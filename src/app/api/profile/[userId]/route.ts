import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

type CourseWithStatus = {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    course_status: 'current' | 'completed';
};

// Define the params type as a Promise for Next.js 15
type Params = Promise<{ userId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { data: courses, error } = await supabaseServer
            .rpc('get_courses_for_user', {
                user_id_param: userId,
            })
            .returns<CourseWithStatus[]>();

        if (error) {
            console.error(`Database error fetching courses for user ${userId}:`, error);
            return NextResponse.json(
                { error: 'An error occurred while fetching courses.' },
                { status: 500 }
            );
        }

        const isCoursesArray = Array.isArray(courses);
        const currentCourses = isCoursesArray
            ? courses.filter((c) => c.course_status === 'current')
            : [];
        const completedCourses = isCoursesArray
            ? courses.filter((c) => c.course_status === 'completed')
            : [];

        return NextResponse.json({ currentCourses, completedCourses }, { status: 200 });
    } catch (error) {
        console.error('Error in GET profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
