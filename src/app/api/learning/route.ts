import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { CourseRow, WeekRow, ModuleRow, EnrollRow } from '@/types/course';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

// GET /api/learning?userId=xxx
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // 1. Get enrolled courses for user (Continue Learning)

    let enrolledCourses: Array<{
        id: string;
        title: string;
        modules: number;
        duration: string;
        progress: number;
    }> = [];
    if (userId) {
        // Get enrolled course ids for user
        const { data: enrollData, error: enrollError } = await supabase
            .from('user_course_enrollments')
            .select('course_id, courses (id, title)')
            .eq('user_id', userId);
        if (enrollError) {
            return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
        }
        if (enrollData && Array.isArray(enrollData)) {
            // For each course, count modules
            const courseIds = (enrollData as EnrollRow[])
                .map((row) => (Array.isArray(row.courses) ? row.courses[0]?.id : row.courses?.id))
                .filter((id): id is string => Boolean(id));
            const modulesCountMap: Record<string, number> = {};
            if (courseIds.length > 0) {
                // Get all weeks for these courses
                const { data: weeksData, error: weeksError } = await supabase
                    .from('weeks')
                    .select('id, course_id')
                    .in('course_id', courseIds);
                if (weeksError) {
                    return NextResponse.json({ error: 'Failed to fetch weeks' }, { status: 500 });
                }
                const weekIds = ((weeksData as WeekRow[]) || []).map((w) => w.id);
                // Get all modules for these weeks
                let modulesData: ModuleRow[] = [];
                if (weekIds.length > 0) {
                    const { data: modsData, error: modsError } = await supabase
                        .from('modules')
                        .select('id, week_id');
                    if (modsError) {
                        return NextResponse.json(
                            { error: 'Failed to fetch modules' },
                            { status: 500 }
                        );
                    }
                    modulesData = ((modsData as ModuleRow[]) || []).filter((m) =>
                        weekIds.includes(m.week_id)
                    );
                }
                // Count modules per course
                for (const courseId of courseIds) {
                    const weekIdsForCourse = ((weeksData as WeekRow[]) || [])
                        .filter((w) => w.course_id === courseId)
                        .map((w) => w.id);
                    modulesCountMap[courseId] = modulesData.filter((m) =>
                        weekIdsForCourse.includes(m.week_id)
                    ).length;
                }
            }
            enrolledCourses = (enrollData as EnrollRow[])
                .map((row) => {
                    let course = row.courses;
                    if (Array.isArray(course)) course = course[0];
                    if (!course) return undefined;
                    return {
                        id: course.id,
                        title: course.title,
                        modules: modulesCountMap[course.id] ?? 0,
                        duration: 'x',
                        progress: 0,
                    };
                })
                .filter(
                    (
                        c
                    ): c is {
                        id: string;
                        title: string;
                        modules: number;
                        duration: string;
                        progress: number;
                    } => !!c
                );
        }
    }

    // 2. Get all available courses

    let availableCourses: Array<{ id: string; title: string; modules: number; duration: string }> =
        [];
    const { data: allCourses, error: allCoursesError } = await supabase
        .from('courses')
        .select('id, title')
        .order('created_at', { ascending: false });
    if (allCoursesError) {
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
    if (allCourses && Array.isArray(allCourses)) {
        const courseIds = (allCourses as CourseRow[]).map((c) => c.id);
        // Get all weeks for these courses
        const { data: weeksData, error: weeksError } = await supabase
            .from('weeks')
            .select('id, course_id')
            .in('course_id', courseIds);
        if (weeksError) {
            return NextResponse.json({ error: 'Failed to fetch weeks' }, { status: 500 });
        }
        const weekIds = ((weeksData as WeekRow[]) || []).map((w) => w.id);
        // Get all modules for these weeks
        let modulesData: ModuleRow[] = [];
        if (weekIds.length > 0) {
            const { data: modsData, error: modsError } = await supabase
                .from('modules')
                .select('id, week_id');
            if (modsError) {
                return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
            }
            modulesData = ((modsData as ModuleRow[]) || []).filter((m) =>
                weekIds.includes(m.week_id)
            );
        }
        // Count modules per course
        const modulesCountMap: Record<string, number> = {};
        for (const courseId of courseIds) {
            const weekIdsForCourse = ((weeksData as WeekRow[]) || [])
                .filter((w) => w.course_id === courseId)
                .map((w) => w.id);
            modulesCountMap[courseId] = modulesData.filter((m) =>
                weekIdsForCourse.includes(m.week_id)
            ).length;
        }
        availableCourses = (allCourses as CourseRow[]).map((course) => ({
            id: course.id,
            title: course.title,
            modules: modulesCountMap[course.id] ?? 0,
            duration: 'x',
        }));
    }

    return NextResponse.json({
        enrolledCourses,
        availableCourses,
    });
}
