import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminAuth } from '@/lib/auth';
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                {
                    status: authResult.status,
                }
            );
        }
        // Get total courses count
        const { count: totalCourses } = await supabaseServer
            .from('courses')
            .select('id', { count: 'exact', head: true });
        // Get active courses count
        const { count: activeCourses } = await supabaseServer
            .from('courses')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);
        // Get total students count
        const { count: totalStudents } = await supabaseServer
            .from('profiles')
            .select('id', { count: 'exact', head: true });
        // Get total enrollments count
        const { count: totalEnrollments } = await supabaseServer
            .from('user_course_enrollments')
            .select('id', { count: 'exact', head: true });
        // Get recent courses
        const { data: recentCourses, error: coursesError } = await supabaseServer
            .from('courses')
            .select(
                `
        id,
        title,
        created_at,
        is_active,
        instructor:profiles(full_name)
      `
            )
            .order('created_at', { ascending: false })
            .limit(5);
        if (coursesError) {
            console.error('Error fetching recent courses:', coursesError);
        }
        // Get course enrollment stats
        const { data: enrollmentStats, error: enrollmentError } = await supabaseServer.from(
            'user_course_enrollments'
        ).select(`
        course_id,
        courses(title)
      `);
        const courseEnrollmentCounts: Record<string, number> = {};
        if (enrollmentStats && !enrollmentError) {
            enrollmentStats.forEach((enrollment) => {
                const courseId = enrollment.course_id;
                courseEnrollmentCounts[courseId] = (courseEnrollmentCounts[courseId] || 0) + 1;
            });
        }
        // Transform recent courses to include enrollment counts
        const transformedRecentCourses =
            recentCourses?.map((course) => ({
                id: course.id,
                title: course.title,
                created_at: course.created_at,
                is_active: course.is_active,
                instructor: course.instructor?.[0]?.full_name ?? 'N/A',
                enrollments: courseEnrollmentCounts[course.id] || 0,
            })) || [];
        const dashboardData = {
            stats: {
                totalCourses: totalCourses || 0,
                activeCourses: activeCourses || 0,
                totalStudents: totalStudents || 0,
                totalEnrollments: totalEnrollments || 0,
            },
            recentCourses: transformedRecentCourses,
            courseEnrollmentCounts,
        };
        return NextResponse.json(dashboardData);
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
