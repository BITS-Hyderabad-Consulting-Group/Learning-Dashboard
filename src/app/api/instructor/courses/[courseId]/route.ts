import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminAuth } from '@/lib/auth-server';
type Params = Promise<{ courseId: string }>;
export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Params;
    }
) {
    try {
        const authResult = await verifyAdminAuth();
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                {
                    status: authResult.status,
                }
            );
        }
        const { courseId } = await params;
        // Get course details
        const { data: course, error: courseError } = await supabaseServer
            .from('courses')
            .select(
                `
            id,
        title,
        description,
        total_duration,
        prerequisites,
        objectives,
        list_price,
        is_active,
            created_at,
            updated_at,
            instructor_profile:profiles!instructor(full_name)
          `
            )
            .eq('id', courseId)
            .single();
        if (courseError || !course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        // Get enrollment count
        const { count: enrollmentCount } = await supabaseServer
            .from('user_course_enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId);
        // Transform course data to match your API structure
        const transformedCourse = {
            id: course.id,
            name: course.title,
            description: course.description,
            totalDuration: course.total_duration,
            duration: `${Math.ceil((course.total_duration || 0) / 60)} weeks`,
            // Convert minutes to weeks; keep totalDuration numeric
            modules: 0, // Will be calculated from weeks/modules
            attendees: enrollmentCount || 0,
            prereq: course.prerequisites || 'None',
            badge_name: `${course.title} Expert`, // Generate badge name
            status: course.is_active ? 'active' : 'draft',
            domain: 'Business', // Default domain - you can add this
            banner_url: '', // Add this field to your table if needed
            date_created: course.created_at,
            date_updated: course.updated_at,
            instructor: course.instructor_profile?.[0]?.full_name || 'N/A',
            list_price: course.list_price,
            // difficulty removed from schema; omit difficultyLevel
            objectives: course.objectives,
        };
        return NextResponse.json(transformedCourse);
    } catch (error) {
        console.error('Get course error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
            }
        );
    }
}
export async function PUT(
    request: NextRequest,
    {
        params,
    }: {
        params: Params;
    }
) {
    try {
        const authResult = await verifyAdminAuth();
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                {
                    status: authResult.status,
                }
            );
        }
        const { courseId } = await params;
        const body = await request.json();
        const {
            title,
            description,
            duration,
            total_duration,
            prerequisites,
            objectives,
            list_price,
            is_active,
        } = body;
        // Update course
        const { data: updatedCourse, error: updateError } = await supabaseServer
            .from('courses')
            .update({
                title,
                description,
                total_duration: duration || total_duration,
                prerequisites,
                objectives,
                list_price,
                // difficulty removed from schema; no difficulty mapping
                is_active,
                updated_at: new Date().toISOString(),
            })
            .eq('id', courseId)
            .select()
            .single();
        if (updateError) {
            console.error('Error updating course:', updateError);
            return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
        }
        return NextResponse.json({
            message: 'Course updated successfully',
            course: updatedCourse,
        });
    } catch (error) {
        console.error('Update course error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
            }
        );
    }
}
export async function DELETE(
    request: NextRequest,
    {
        params,
    }: {
        params: Params;
    }
) {
    try {
        const authResult = await verifyAdminAuth();
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                {
                    status: authResult.status,
                }
            );
        }
        const { courseId } = await params;
        // Check if course has enrollments
        const { count: enrollmentCount } = await supabaseServer
            .from('user_course_enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId);
        if (enrollmentCount && enrollmentCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete course with active enrollments' },
                { status: 400 }
            );
        }
        // Delete course (this will cascade delete weeks and modules if you have foreign key constraints)
        const { error: deleteError } = await supabaseServer
            .from('courses')
            .delete()
            .eq('id', courseId);
        if (deleteError) {
            console.error('Error deleting course:', deleteError);
            return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
        }
        return NextResponse.json({
            message: 'Course deleted successfully',
        });
    } catch (error) {
        console.error('Delete course error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
            }
        );
    }
}
