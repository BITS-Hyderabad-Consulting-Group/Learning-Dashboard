// API route for /api/modules/[moduleId]

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Helper to map DB module_type to API type
function mapModuleType(type: string): 'video' | 'article' | 'evaluative' | 'markdown' {
    switch (type?.toLowerCase()) {
        case 'video':
            return 'video';
        case 'article':
            return 'article';
        case 'markdown':
            return 'markdown';
        default:
            return 'evaluative';
    }
}

// Define the params type as a Promise for Next.js 15
type Params = Promise<{ moduleId: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    const { moduleId } = await params;
    try {
        // First, fetch the module
        const { data: module, error: moduleError } = await supabaseServer
            .from('modules')
            .select('id, title, module_type, content, week_id')
            .eq('id', moduleId)
            .single();

        if (moduleError || !module) {
            console.error('Module fetch error:', moduleError);
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        console.log('Fetched module:', module);

        // Then fetch the week
        let weekObj = null;
        let courseObj = null;

        if (module.week_id) {
            const { data: week, error: weekError } = await supabaseServer
                .from('weeks')
                .select('id, title, course_id')
                .eq('id', module.week_id)
                .single();

            if (!weekError && week) {
                weekObj = week;
                console.log('Fetched week:', week);

                // Then fetch the course
                const { data: course, error: courseError } = await supabaseServer
                    .from('courses')
                    .select('id, title')
                    .eq('id', week.course_id)
                    .single();

                if (!courseError && course) {
                    courseObj = course;
                    console.log('Fetched course:', course);
                }
            }
        }

        const response = {
            id: module.id,
            title: module.title,
            type: mapModuleType(module.module_type),
            content: module.content,
            evaluativeType: undefined, // No evaluativeType field in schema
            week: weekObj ? { id: weekObj.id, title: weekObj.title } : undefined,
            course: courseObj ? { id: courseObj.id, title: courseObj.title } : undefined,
        };

        console.log('Final response:', response);
        return NextResponse.json(response);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
