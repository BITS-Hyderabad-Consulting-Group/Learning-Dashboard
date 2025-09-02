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

        const { data: course, error: courseError } = await supabaseServer
            .from('courses')
            .select('id, title, description, total_duration, list_price, is_active')
            .eq('id', courseId)
            .single();
        if (courseError || !course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const { data: weeks, error: weeksError } = await supabaseServer
            .from('weeks')
            .select(
                `
        id,
        week_number,
        title,
        created_at,
        modules(
          id,
          title,
          module_type,
          content,
          duration,
          xp,
          order_in_week,
          created_at
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

        const transformedWeeks =
            weeks?.map((week) => ({
                id: week.id,
                courseId,
                weekNumber: week.week_number,
                title: week.title,
                description: '',
                duration: 0,
                isPublished: false,
                unlockDate: week.created_at,
                createdAt: week.created_at,
                updatedAt: week.created_at,
                expanded: false,
            })) || [];
        const transformedModules =
            weeks?.flatMap(
                (week) =>
                    week.modules?.map((module) => ({
                        id: module.id,
                        weekId: week.id,
                        moduleNumber: module.order_in_week || 1,
                        title: module.title,
                        description: '',
                        contentType: module.module_type,

                        markdownContent:
                            module.module_type === 'article' ? module.content || '' : '',
                        contentUrl: module.module_type !== 'article' ? module.content || '' : '',
                        duration: module.duration,
                        isRequired: true,
                        points: module.xp,
                        orderIndex: module.order_in_week,
                        estimatedReadTime: null,
                        createdAt: module.created_at,
                        updatedAt: module.created_at,
                    })) || []
            ) || [];
        const courseContent = {
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                price: course.list_price,

                status: course.is_active ? 'active' : 'draft',
                isActive: course.is_active,
                totalDuration: (course as { total_duration?: number }).total_duration,
                duration: `${Math.ceil(
                    ((course as { total_duration?: number }).total_duration || 0) / 60
                )} weeks`,
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
        const { type, data } = body;
        if (type === 'week') {
            const { title, weekNumber } = data;

            if (!title || !weekNumber) {
                return NextResponse.json(
                    { error: 'Title and week number are required' },
                    { status: 400 }
                );
            }

            const { data: newWeek, error: createError } = await supabaseServer
                .from('weeks')
                .insert([
                    {
                        course_id: courseId,
                        week_number: weekNumber,
                        title,
                        created_at: new Date().toISOString(),
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
                contentType,
                contentUrl,
                markdownContent,
                points,
                orderIndex,
                duration,
            } = data;

            if (!weekId || !title || !contentType) {
                return NextResponse.json(
                    { error: 'Week ID, title, and content type are required' },
                    { status: 400 }
                );
            }

            const { count: moduleCount } = await supabaseServer
                .from('modules')
                .select('id', { count: 'exact', head: true })
                .eq('week_id', weekId);

            const contentToSave =
                contentType === 'article' ? markdownContent || '' : contentUrl || '';

            const { data: newModule, error: createError } = await supabaseServer
                .from('modules')
                .insert([
                    {
                        week_id: weekId,
                        title,
                        module_type: contentType,
                        content: contentToSave,
                        xp: points || 10,
                        order_in_week: orderIndex || (moduleCount || 0) + 1,
                        duration: duration || 0,
                        created_at: new Date().toISOString(),
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

// Update existing content (week or module)
export async function PUT(request: NextRequest) {
    try {
        console.log('PUT request received');
        const authResult = await verifyAdminAuth();
        if ('error' in authResult) {
            console.log('Auth failed:', authResult.error);
            return NextResponse.json(
                { error: authResult.error },
                {
                    status: authResult.status,
                }
            );
        }
        const body = await request.json();
        console.log('PUT request body:', body);
        const { type, id, data } = body;

        if (type === 'module') {
            console.log('Updating module with ID:', id);
            const {
                title,
                contentType,
                contentUrl,
                markdownContent,
                points,
                orderIndex,
                duration,
            } = data;

            console.log('Module update data:', {
                title,
                contentType,
                contentUrl,
                markdownContent,
                points,
            });

            if (!id || !title || !contentType) {
                console.log('Validation failed - missing required fields');
                return NextResponse.json(
                    { error: 'Module ID, title, and content type are required' },
                    { status: 400 }
                );
            }

            const contentToSave =
                contentType === 'article' ? markdownContent || '' : contentUrl || '';
            console.log('Content to save:', contentToSave);

            const { data: updatedModule, error: updateError } = await supabaseServer
                .from('modules')
                .update({
                    title,
                    module_type: contentType,
                    content: contentToSave,
                    xp: points || 10,
                    order_in_week: orderIndex,
                    duration: duration || 0,
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating module:', updateError);
                return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
            }

            console.log('Module updated successfully:', updatedModule);
            return NextResponse.json(
                {
                    message: 'Module updated successfully',
                    module: updatedModule,
                },
                { status: 200 }
            );
        } else if (type === 'week') {
            const { title, weekNumber } = data;

            if (!id || !title) {
                return NextResponse.json(
                    { error: 'Week ID and title are required' },
                    { status: 400 }
                );
            }

            const { data: updatedWeek, error: updateError } = await supabaseServer
                .from('weeks')
                .update({
                    title,
                    week_number: weekNumber,
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating week:', updateError);
                return NextResponse.json({ error: 'Failed to update week' }, { status: 500 });
            }

            return NextResponse.json(
                {
                    message: 'Week updated successfully',
                    week: updatedWeek,
                },
                { status: 200 }
            );
        }

        return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
    } catch (error) {
        console.error('Update content error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
            }
        );
    }
}
