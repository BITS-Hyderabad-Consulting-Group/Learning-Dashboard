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
            .select('id, title, description, total_duration, list_price, is_active')
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
        // Transform data to match your API structure
        const transformedWeeks =
            weeks?.map((week) => ({
                id: week.id,
                courseId,
                weekNumber: week.week_number,
                title: week.title,
                description: '', // Default since description doesn't exist in schema
                duration: 0, // Default since duration doesn't exist in schema
                isPublished: false, // Default since is_published doesn't exist in schema
                unlockDate: week.created_at, // Use created_at since unlock_date doesn't exist
                createdAt: week.created_at,
                updatedAt: week.created_at, // Use created_at since updated_at doesn't exist
                expanded: false, // Default value for UI
            })) || [];
        const transformedModules =
            weeks?.flatMap(
                (week) =>
                    week.modules?.map((module) => ({
                        id: module.id,
                        weekId: week.id,
                        moduleNumber: module.order_in_week || 1, // Use order_in_week as module number
                        title: module.title,
                        description: '', // Description field not stored in database
                        contentType: module.module_type,
                        // For articles, content goes to markdownContent; for others, to contentUrl
                        markdownContent: module.module_type === 'article' ? module.content || '' : '',
                        contentUrl: module.module_type !== 'article' ? module.content || '' : '',
                        duration: module.duration,
                        isRequired: true, // Default to true since is_required field doesn't exist
                        points: module.xp, // xp field maps to points
                        orderIndex: module.order_in_week,
                        estimatedReadTime: null, // not in schema
                        createdAt: module.created_at,
                        updatedAt: module.created_at, // Use created_at since updated_at doesn't exist
                    })) || []
            ) || [];
        const courseContent = {
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                price: course.list_price,
                // difficulty removed from schema; omit difficultyLevel
                status: course.is_active ? 'active' : 'draft',
                isActive: course.is_active,
                totalDuration: (course as { total_duration?: number }).total_duration,
                duration: `${Math.ceil(((course as { total_duration?: number }).total_duration || 0) / 60)} weeks`,
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
            const { title, weekNumber } = data;
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
            
            // For articles, save markdownContent; for others, save contentUrl
            const contentToSave = contentType === 'article' ? markdownContent || '' : contentUrl || '';
            
            // Create new module
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
                        duration: 0, // Set default duration
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
        const authResult = await verifyAdminAuth(request);
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
            } = data;

            console.log('Module update data:', {
                title,
                contentType,
                contentUrl,
                markdownContent,
                points
            });

            // Validate required fields
            if (!id || !title || !contentType) {
                console.log('Validation failed - missing required fields');
                return NextResponse.json(
                    { error: 'Module ID, title, and content type are required' },
                    { status: 400 }
                );
            }

            // For articles, save markdownContent; for others, save contentUrl
            const contentToSave = contentType === 'article' ? markdownContent || '' : contentUrl || '';
            console.log('Content to save:', contentToSave);

            // Update existing module
            const { data: updatedModule, error: updateError } = await supabaseServer
                .from('modules')
                .update({
                    title,
                    module_type: contentType,
                    content: contentToSave,
                    xp: points || 10,
                    order_in_week: orderIndex,
                    duration: 0, // Default duration
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

            // Validate required fields
            if (!id || !title) {
                return NextResponse.json(
                    { error: 'Week ID and title are required' },
                    { status: 400 }
                );
            }

            // Update existing week
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
