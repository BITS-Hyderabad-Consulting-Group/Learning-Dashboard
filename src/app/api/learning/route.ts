import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { EnrolledCourse, AvailableCourse } from '@/types/course';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is not defined.');
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type CourseDetails = {
    id: string;
    title: string;
    duration: number;
    modules_count: number;
};

// GET /api/learning?userId=xxx (userId is now optional)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    try {
        // --- Conditional User-Specific Logic ---
        let enrolledCourseIds: string[] = [];
        const progressMap = new Map<string, number>();

        if (userId) {
            const { data: enrollmentData, error: enrollmentError } = await supabase
                .from('user_course_enrollments')
                .select('course_id')
                .eq('user_id', userId);

            if (enrollmentError) {
                console.error(`Error fetching enrollments for user ${userId}:`, enrollmentError);
            } else if (enrollmentData) {
                enrolledCourseIds = enrollmentData.map((e) => e.course_id);
            }

            const { data: progressData, error: progressError } = await supabase.rpc(
                'get_user_progress_by_course',
                { p_user_id: userId }
            );

            if (progressError) {
                console.error(`Error fetching progress for user ${userId}:`, progressError);
            } else if (progressData) {
                progressData.forEach(
                    (item: {
                        course_id: string;
                        completed_modules: number;
                        total_modules: number;
                    }) => {
                        const percentage =
                            item.total_modules > 0
                                ? Math.round((item.completed_modules / item.total_modules) * 100)
                                : 0;
                        progressMap.set(item.course_id, percentage);
                    }
                );
            }
        }

        // --- Publicly Accessible Logic ---
        const { data: allCoursesDetails, error: coursesError } = await supabase
            .from('course_details')
            .select('*')
            .order('title') // Good to have a consistent order
            .returns<CourseDetails[]>();

        if (coursesError) {
            console.error('Error fetching from course_details view:', coursesError);
            return NextResponse.json({ error: 'Failed to fetch course details' }, { status: 500 });
        }

        if (!allCoursesDetails) {
            return NextResponse.json({ enrolledCourses: [], availableCourses: [] });
        }

        const enrolledCourses: EnrolledCourse[] = [];
        const availableCourses: AvailableCourse[] = [];

        for (const course of allCoursesDetails) {
            const courseData = {
                id: course.id,
                title: course.title,
                modules: course.modules_count,
                total_duration: course.duration,
            };

            if (userId && enrolledCourseIds.includes(course.id)) {
                enrolledCourses.push({
                    ...courseData,
                    progress: progressMap.get(course.id) ?? 0,
                    total_duration: course.duration,
                });
            } else {
                availableCourses.push(courseData);
            }
        }

        return NextResponse.json({
            enrolledCourses,
            availableCourses,
        });
    } catch (error) {
        console.error('Unexpected error in /api/learning:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
