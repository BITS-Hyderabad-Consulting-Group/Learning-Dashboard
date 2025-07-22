import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
    try {
        const { courseId } = params;
        const body = await request.json();
        const userId = body.userId;
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Check if already enrolled
        const { data: existing, error: checkError } = await supabaseServer
            .from('user_course_enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        if (checkError) {
            return NextResponse.json({ error: checkError.message }, { status: 500 });
        }
        if (existing) {
            return NextResponse.json({ message: 'Already enrolled' }, { status: 200 });
        }

        const { error: insertError } = await supabaseServer.from('user_course_enrollments').insert([
            {
                user_id: userId,
                course_id: courseId,
                enrollment_date: new Date().toISOString(),
                enrollment_method: 'direct_purchase',
                amount_paid: 0.0,
            },
        ]);
        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Enrolled successfully' }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ courseId: string }> }
) {
    const { courseId } = await context.params;
    console.log('API received courseId:', courseId);
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch course details
        const { data: course, error: courseError } = await supabaseServer
            .from('courses')
            .select('id, title, description, list_price, is_active, created_at, updated_at')
            .eq('id', courseId)
            .single();

        if (courseError || !course) {
            console.error('Error fetching course:', courseError);
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Fetch weeks for this course with modules
        const { data: weeks, error: weeksError } = await supabaseServer
            .from('weeks')
            .select(
                `
                id,
                title,
                week_number,
                created_at,
                modules (
                  id,
                  title,
                  module_type,
                  content,
                  order_in_week,
                  difficulty
                )
            `
            )
            .eq('course_id', courseId)
            .order('week_number');

        if (weeksError) {
            console.error('Error fetching weeks:', weeksError);
            return NextResponse.json({ error: 'Error fetching course weeks' }, { status: 500 });
        }

        // Fetch user progress if user is logged in
        let userProgress: Record<string, boolean> = {};
        let userModuleReviews: Record<string, boolean> = {};
        let enrolled = false;

        if (userId) {
            // Check if user is enrolled in this course
            const { data: enrollmentData, error: enrollmentError } = await supabaseServer
                .from('user_course_enrollments')
                .select('id')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single();
            if (!enrollmentError && enrollmentData) {
                enrolled = true;
            }
            // Fetch user completion progress
            const { data: progressData, error: progressError } = await supabaseServer
                .from('user_module_progress')
                .select('module_id, completed_at')
                .eq('user_id', userId);

            if (!progressError && progressData) {
                userProgress = progressData.reduce(
                    (
                        acc: Record<string, boolean>,
                        progress: { module_id: string; completed_at: string | null }
                    ) => {
                        acc[progress.module_id] = progress.completed_at !== null;
                        return acc;
                    },
                    {} as Record<string, boolean>
                );
            }

            // Fetch user review preferences
            try {
                const { data: reviewData, error: reviewError } = await supabaseServer
                    .from('user_module_reviews')
                    .select('module_id')
                    .eq('user_id', userId)
                    .eq('marked_for_review', true);

                if (!reviewError && reviewData) {
                    userModuleReviews = reviewData.reduce(
                        (acc: Record<string, boolean>, review: { module_id: string }) => {
                            acc[review.module_id] = true;
                            return acc;
                        },
                        {}
                    );
                }
            } catch {
                // Table might not exist - that's okay, just log it
                console.log(
                    'Note: user_module_reviews table not found or accessible, skipping review data'
                );
            }
        }

        // Calculate total duration from modules (assuming each module has an estimated duration)
        let totalDuration = 0;
        let modulesCount = 0;
        let modulesCompleted = 0;
        let markedForReview = 0;

        // Transform weeks data to match the expected format
        const transformedWeeks =
            weeks?.map((week) => {
                const weekModules = week.modules || [];
                modulesCount += weekModules.length;

                // Calculate week duration (you might want to add a duration field to modules table)
                const weekDuration = weekModules.length * 30; // Assuming 30 minutes per module on average
                totalDuration += weekDuration;

                // Transform modules to match expected format
                const transformedModules = weekModules
                    .sort((a, b) => (a.order_in_week || 0) - (b.order_in_week || 0))
                    .map((module) => {
                        // Check if user has completed this module
                        const completed = userProgress[module.id] || false;
                        const markedForReviewStatus = userModuleReviews[module.id] || false;

                        if (completed) modulesCompleted++;
                        if (markedForReviewStatus) markedForReview++;

                        return {
                            id: module.id,
                            title: module.title,
                            type: module.module_type || 'Article',
                            completed,
                            markedForReview: markedForReviewStatus,
                        };
                    });

                return {
                    title: week.title,
                    duration: weekDuration,
                    modules: transformedModules,
                };
            }) || [];

        // Calculate weeks completed (weeks with all modules completed)
        const weeksCompleted = transformedWeeks.filter(
            (week) => week.modules.length > 0 && week.modules.every((module) => module.completed)
        ).length;

        // Format response to match the expected structure
        const response: any = {
            title: course.title,
            description: course.description,
            updatedAt: course.updated_at,
            modulesCount,
            totalDuration,
            modulesCompleted,
            weeksCompleted,
            markedForReview,
            weeks: transformedWeeks,
        };
        // Add enrolled boolean if userId was provided
        if (userId) {
            (response as any).enrolled = enrolled;
        }

        // Also return active learners count
        const { count: activeLearnersCount, error: learnersError } = await supabaseServer
            .from('user_course_enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId);
        (response as any).activeLearners = learnersError ? 0 : activeLearnersCount ?? 0;

        return NextResponse.json(response);
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
