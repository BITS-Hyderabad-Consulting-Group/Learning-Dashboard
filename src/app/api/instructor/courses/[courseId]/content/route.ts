import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminAuth } from '@/lib/auth';
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
        const authResult = await verifyAdminAuth(request);
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                {
                    status: authResult.status,
                }
            );
        }
        const { courseId } = await params;
        // Get course basic info
        const { data: course, error: courseError } = await supabaseServer
            .from('courses')
            .select('id, title, description, duration, list_price, difficulty_level, is_active')
            .eq('id', courseId)
            .single();
        if (courseError || !course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        // Get weeks with modules
        const { data: weeks, error: weeksError } = await supabaseServer
            .from('weeks')
            .select(
                `
        id,
        week_number,
        title,
        description,
        duration,
        is_published,
        unlock_date,
        created_at,
        updated_at,
        modules(
          id,
          module_number,
          title,
          description,
          content_type,
          content_url,
          duration,
          is_required,
          points,
          order_in_week,
          estimated_read_time,
          created_at,
          updated_at
        )
      `
            )
            .eq('course_id', courseId)
            .order('week_number')
            .order('order_in_week', { referencedTable: 'modules' });
        if (weeksError) {
            console.error('Error fetching weeks:', weeksError);
            return NextResponse.json({ error: 'Failed to fetch course content' }, { status: 500 });
        }
        // Transform data to match your API structure
        const transformedWeeks =
            weeks?.map((week) => ({
                id: week.id,
                courseId,
                weekNumber: week.week_number,
                title: week.title,
                description: week.description,
                duration: week.duration,
                isPublished: week.is_published,
                unlockDate: week.unlock_date,
                createdAt: week.created_at,
                updatedAt: week.updated_at,
                expanded: false, // Default value for UI
            })) || [];
        const transformedModules =
            weeks?.flatMap(
                (week) =>
                    week.modules?.map((module) => ({
                        id: module.id,
                        weekId: week.id,
                        moduleNumber: module.module_number,
                        title: module.title,
                        description: module.description,
                        contentType: module.content_type,
                        contentUrl: module.content_url,
                        duration: module.duration,
                        isRequired: module.is_required,
                        points: module.points,
                        orderIndex: module.order_in_week,
                        estimatedReadTime: module.estimated_read_time,
                        createdAt: module.created_at,
                        updatedAt: module.updated_at,
                    })) || []
            ) || [];
        const courseContent = {
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                duration: course.duration,
                price: course.list_price,
                difficultyLevel: course.difficulty_level,
                status: course.is_active ? 'active' : 'draft',
                isActive: course.is_active,
            },
            weeks: transformedWeeks,
            modules: transformedModules,
        };
        return NextResponse.json(courseContent);
    } catch (error) {
        console.error('Get course content error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// Create new week
export async function POST(
    request: NextRequest,
    {
        params,
    }: {
        params: Params;
    }
) {
    try {
        const authResult = await verifyAdminAuth(request);
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
        const { type, data } = body;
        if (type === 'week') {
            const { title, description, duration, weekNumber } = data;
            // Validate required fields
            if (!title || !weekNumber) {
                return NextResponse.json(
                    { error: 'Title and week number are required' },
                    { status: 400 }
                );
            }
            // Create new week
            const { data: newWeek, error: createError } = await supabaseServer
                .from('weeks')
                .insert([
                    {
                        course_id: courseId,
                        week_number: weekNumber,
                        title,
                        description: description || '',
                        duration: duration || 0,
                        is_published: false,
                        unlock_date: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();
            if (createError) {
                console.error('Error creating week:', createError);
                return NextResponse.json({ error: 'Failed to create week' }, { status: 500 });
            }
            return NextResponse.json(
                {
                    message: 'Week created successfully',
                    week: newWeek,
                },
                { status: 201 }
            );
        } else if (type === 'module') {
            const {
                weekId,
                title,
                description,
                contentType,
                contentUrl,
                duration,
                isRequired,
                points,
                orderIndex,
            } = data;
            // Validate required fields
            if (!weekId || !title || !contentType) {
                return NextResponse.json(
                    { error: 'Week ID, title, and content type are required' },
                    { status: 400 }
                );
            }
            // Get next module number for the week
            const { count: moduleCount } = await supabaseServer
                .from('modules')
                .select('id', { count: 'exact', head: true })
                .eq('week_id', weekId);
            // Create new module
            const { data: newModule, error: createError } = await supabaseServer
                .from('modules')
                .insert([
                    {
                        week_id: weekId,
                        module_number: (moduleCount || 0) + 1,
                        title,
                        description: description || '',
                        content_type: contentType,
                        content_url: contentUrl || '',
                        duration: duration || 0,
                        is_required: isRequired !== false,
                        points: points || 0,
                        order_in_week: orderIndex || (moduleCount || 0) + 1,
                        estimated_read_time: contentType === 'article' ? duration : null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();
            if (createError) {
                console.error('Error creating module:', createError);
                return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
            }
            return NextResponse.json(
                {
                    message: 'Module created successfully',
                    module: newModule,
                },
                { status: 201 }
            );
        }
        return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
    } catch (error) {
        console.error('Create content error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
            }
        );
    }
}
