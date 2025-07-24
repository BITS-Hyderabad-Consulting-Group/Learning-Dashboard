import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { CourseWithInstructor } from '@/types/course';

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
    try {
        const { courseId } = params;
        const body = await request.json();
        const userId = body.userId;
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

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
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ courseId: string }> }
) {
    const { courseId } = await context.params;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const { data: course, error: courseError } = await supabaseServer
            .from('courses')
            .select(
                'id, title, description, objectives, list_price, is_active, created_at, updated_at, instructor:profiles (full_name)'
            )
            .eq('id', courseId)
            .single<CourseWithInstructor>();

        if (courseError || !course) {
            console.error('Error fetching course:', courseError);
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const { data: weeks, error: weeksError } = await supabaseServer
            .from('weeks')
            .select(
                `id, title, week_number, modules (id, title, module_type, order_in_week,duration)`
            )
            .eq('course_id', courseId)
            .order('week_number');

        if (weeksError) {
            console.error('Error fetching weeks:', weeksError);
            return NextResponse.json({ error: 'Error fetching course weeks' }, { status: 500 });
        }

        const userProgress: Record<string, boolean> = {};
        const userModuleReviews: Record<string, boolean> = {};
        let enrolled = false;
        const completedModuleIds: string[] = [];

        if (userId) {
            const { data: enrollmentData, error: enrollmentError } = await supabaseServer
                .from('user_course_enrollments')
                .select('id')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single();
            if (!enrollmentError && enrollmentData) {
                enrolled = true;
            }

            const { data: progressData } = await supabaseServer
                .from('user_module_progress')
                .select('module_id, completed_at')
                .eq('user_id', userId);

            if (progressData) {
                progressData.forEach((progress) => {
                    const isCompleted = progress.completed_at !== null;
                    userProgress[progress.module_id] = isCompleted;
                    if (isCompleted) {
                        completedModuleIds.push(progress.module_id);
                    }
                });
            }

            try {
                const { data: reviewData } = await supabaseServer
                    .from('user_module_reviews')
                    .select('module_id')
                    .eq('user_id', userId)
                    .eq('marked_for_review', true);

                if (reviewData) {
                    reviewData.forEach((review) => {
                        userModuleReviews[review.module_id] = true;
                    });
                }
            } catch {
                console.log('Note: user_module_reviews table not found, skipping review data');
            }
        }

        let modulesCount = 0;
        // let modulesCompleted = 0;
        let markedForReview = 0;

        const transformedWeeks =
            (weeks ?? []).map((week) => {
                const weekModules = week.modules || [];
                modulesCount += weekModules.length;

                const weekDuration = weekModules.reduce(
                    (total, module) => total + (module.duration || 0),
                    0
                );

                const transformedModules = weekModules
                    .sort((a, b) => (a.order_in_week || 0) - (b.order_in_week || 0))
                    .map((module) => {
                        const completed = userProgress[module.id] || false;
                        const markedForReviewStatus = userModuleReviews[module.id] || false;

                        // if (completed) modulesCompleted++;
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

        const weeksCompleted = transformedWeeks.filter(
            (week) => week.modules.length > 0 && week.modules.every((module) => module.completed)
        ).length;

        const { count: activeLearnersCount } = await supabaseServer
            .from('user_course_enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId);

        const response = {
            title: course.title,
            description: course.description,
            updatedAt: course.updated_at,
            courseObjectives: course.objectives || [],
            modulesCount,
            weeksCompleted,
            markedForReview,
            weeks: transformedWeeks,
            instructor: course.instructor?.full_name || 'N/A',
            enrolled,
            completedModules: completedModuleIds,
            activeLearners: activeLearnersCount ?? 0,
        };

        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
