import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server'; // Use your existing utility
import type { EnrolledCourse, AvailableCourse } from '@/types/course';

// Remove the direct client creation
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type CourseDetails = {
    id: string;
    title: string;
    total_duration: number;
    modules_count: number;
};

// GET /api/learning?userId=xxx&page=1&limit=12&search=&sort=a-z (userId is now optional)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Pagination and filtering parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12', 10));
    const search = (searchParams.get('search') || '').trim();
    const sort = searchParams.get('sort') || 'a-z';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    try {
        // --- Conditional User-Specific Logic ---
        let enrolledCourseIds: string[] = [];
        const progressMap = new Map<string, number>();

        if (userId) {
            const { data: enrollmentData, error: enrollmentError } = await supabaseServer
                .from('user_course_enrollments')
                .select('course_id')
                .eq('user_id', userId);

            if (enrollmentError) {
                console.error(`Error fetching enrollments for user ${userId}:`, enrollmentError);
            } else if (enrollmentData) {
                enrolledCourseIds = enrollmentData.map((e) => e.course_id);
            }

            const { data: progressData, error: progressError } = await supabaseServer.rpc(
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

        // --- Publicly Accessible Logic with Server-Side Filtering ---

        // Build the query with search and sorting
        let query = supabaseServer.from('courses').select('*', { count: 'exact' }); // Include count for total pages calculation

        // Apply search filter if provided
        if (search.length > 0) {
            query = query.ilike('title', `%${search}%`);
        }

        // Apply sorting
        switch (sort) {
            case 'z-a':
                query = query.order('title', { ascending: false });
                break;
            case 'desc':
                // Use the correct field name for sorting by date from the joined courses table
                query = query.order('created_at', { ascending: false });
                break;
            case 'asc':
                query = query.order('created_at', { ascending: true });
                break;
            case 'a-z':
            default:
                query = query.order('title', { ascending: true });
                break;
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const {
            data: allCoursesDetails,
            error: coursesError,
            count: totalCount,
        } = await query.returns<CourseDetails[]>();

        if (coursesError) {
            console.error('Error fetching from course_details view:', coursesError);
            return NextResponse.json({ error: 'Failed to fetch course details' }, { status: 500 });
        }

        // If no courses found, always return empty arrays and correct pagination
        if (!allCoursesDetails || allCoursesDetails.length === 0) {
            return NextResponse.json({
                enrolledCourses: [],
                availableCourses: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalCount: 0,
                    limit,
                    hasNextPage: false,
                    hasPreviousPage: page > 1,
                },
            });
        }

        const enrolledCourses: EnrolledCourse[] = [];
        const availableCourses: AvailableCourse[] = [];

        for (const course of allCoursesDetails) {
            const courseData = {
                id: course.id,
                title: course.title,
                modules: course.modules_count,
                total_duration: course.total_duration,
            };

            if (userId && enrolledCourseIds.includes(course.id)) {
                enrolledCourses.push({
                    ...courseData,
                    progress: progressMap.get(course.id) ?? 0,
                    total_duration: course.total_duration,
                });
            } else {
                // Otherwise, add it to the general 'availableCourses' list.
                availableCourses.push(courseData);
            }
        }

        // Calculate pagination metadata
        const safeTotalCount =
            typeof totalCount === 'number' && totalCount >= 0
                ? totalCount
                : availableCourses.length + enrolledCourses.length;
        const totalPages = Math.ceil(safeTotalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return NextResponse.json({
            enrolledCourses,
            availableCourses,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount: safeTotalCount,
                limit,
                hasNextPage,
                hasPreviousPage,
            },
        });
    } catch (error) {
        console.error('Unexpected error in /api/learning:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}
