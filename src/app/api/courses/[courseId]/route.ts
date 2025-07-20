import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DbModule, DbWeek, UserProgress } from '@/types/course';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//error handling
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey,
    });
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
    try {
        const { courseId } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Fetch course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id, title, description, list_price, is_active, created_at')
            .eq('id', courseId)
            .single();

        if (courseError) {
            console.error('Error fetching course:', courseError);
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Fetch weeks for this course with modules
        const { data: weeks, error: weeksError } = await supabase
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
        let userProgress: UserProgress = {};
        let userModuleReviews: { [moduleId: string]: boolean } = {};
        let enrolled = false;

        if (userId) {
            // Check if user is enrolled in this course
            const { data: enrollmentData, error: enrollmentError } = await supabase
                .from('user_course_enrollments')
                .select('id')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single();
            if (!enrollmentError && enrollmentData) {
                enrolled = true;
            }
            // Fetch user completion progress
            const { data: progressData, error: progressError } = await supabase
                .from('user_module_progress')
                .select('module_id, completed_at')
                .eq('user_id', userId);

            if (!progressError && progressData) {
                userProgress = progressData.reduce(
                    (
                        acc: UserProgress,
                        progress: { module_id: string; completed_at: string | null }
                    ) => {
                        acc[progress.module_id] = progress.completed_at !== null;
                        return acc;
                    },
                    {}
                );
            }

            // Fetch user review preferences
            try {
                const { data: reviewData, error: reviewError } = await supabase
                    .from('user_module_reviews')
                    .select('module_id')
                    .eq('user_id', userId)
                    .eq('marked_for_review', true);

                if (!reviewError && reviewData) {
                    userModuleReviews = reviewData.reduce(
                        (acc: { [moduleId: string]: boolean }, review: { module_id: string }) => {
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
            weeks?.map((week: DbWeek) => {
                const weekModules = week.modules || [];
                modulesCount += weekModules.length;

                // Calculate week duration (you might want to add a duration field to modules table)
                const weekDuration = weekModules.length * 30; // Assuming 30 minutes per module on average
                totalDuration += weekDuration;

                // Transform modules to match expected format
                const transformedModules = weekModules
                    .sort(
                        (a: DbModule, b: DbModule) =>
                            (a.order_in_week || 0) - (b.order_in_week || 0)
                    )
                    .map((module: DbModule) => {
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
            (week) =>
                week.modules.length > 0 &&
                week.modules.every((module: { completed: boolean }) => module.completed)
        ).length;

        // Format response to match the expected structure
        interface CourseResponse {
            title: string;
            description: string;
            modulesCount: number;
            totalDuration: number;
            modulesCompleted: number;
            weeksCompleted: number;
            markedForReview: number;
            weeks: {
                title: string;
                duration: number;
                modules: {
                    id: string;
                    title: string;
                    type: string;
                    completed: boolean;
                    markedForReview: boolean;
                }[];
            }[];
            enrolled?: boolean;
        }

        const response: CourseResponse = {
            title: course.title,
            description: course.description,
            modulesCount,
            totalDuration,
            modulesCompleted,
            weeksCompleted,
            markedForReview,
            weeks: transformedWeeks,
        };
        // Add enrolled boolean if userId was provided
        if (userId) {
            response.enrolled = enrolled;
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
