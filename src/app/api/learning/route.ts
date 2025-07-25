import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server'; // Use your existing utility
import type { EnrolledCourse, AvailableCourse } from '@/types/course';

// Remove the direct client creation
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type CourseWithModules = {
    id: string;
    title: string;
    total_duration: number;
    weeks: {
        modules: { id: string }[];
    }[];
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
        const enrolledCourses: EnrolledCourse[] = [];

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

            // Fetch enrolled courses separately (unfiltered)
            if (enrolledCourseIds.length > 0) {
                const { data: enrolledCoursesData, error: enrolledError } = await supabaseServer
                    .from('courses')
                    .select(
                        `
                        id,
                        title,
                        total_duration,
                        weeks!inner(
                            modules(id)
                        )
                    `
                    )
                    .in('id', enrolledCourseIds);

                if (enrolledError) {
                    console.error('Error fetching enrolled courses:', enrolledError);
                } else if (enrolledCoursesData) {
                    enrolledCoursesData.forEach((course: CourseWithModules) => {
                        const moduleCount =
                            course.weeks?.reduce(
                                (total: number, week: { modules: { id: string }[] }) => {
                                    return total + (week.modules?.length || 0);
                                },
                                0
                            ) || 0;

                        enrolledCourses.push({
                            id: course.id,
                            title: course.title,
                            modules: moduleCount,
                            total_duration: course.total_duration,
                            progress: progressMap.get(course.id) ?? 0,
                        });
                    });
                }
            }
        }

        // Build the query with search and sorting for available courses only
        let query = supabaseServer.from('courses').select(
            `
            id,
            title,
            total_duration,
            weeks!inner(
                modules(id)
            )
        `,
            { count: 'exact' }
        );

        // Exclude enrolled courses from available courses
        if (enrolledCourseIds.length > 0) {
            query = query.not('id', 'in', `(${enrolledCourseIds.join(',')})`);
        }

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

        const { data: availableCoursesData, error: coursesError, count: totalCount } = await query;

        if (coursesError) {
            console.error('Error fetching available courses:', coursesError);
            return NextResponse.json({ error: 'Failed to fetch course details' }, { status: 500 });
        }

        // Convert available courses data
        const availableCourses: AvailableCourse[] = (availableCoursesData || []).map(
            (course: CourseWithModules) => {
                const moduleCount =
                    course.weeks?.reduce((total: number, week: { modules: { id: string }[] }) => {
                        return total + (week.modules?.length || 0);
                    }, 0) || 0;

                return {
                    id: course.id,
                    title: course.title,
                    modules: moduleCount,
                    total_duration: course.total_duration,
                };
            }
        );

        // If no available courses found, return appropriate response
        if (!availableCoursesData || availableCoursesData.length === 0) {
            return NextResponse.json({
                enrolledCourses,
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

        // Calculate pagination metadata
        const safeTotalCount = typeof totalCount === 'number' && totalCount >= 0 ? totalCount : 0;
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
