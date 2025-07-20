export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
    try {
        const { courseId } = params;
        const body = await request.json();
        const userId = body.userId;
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Check if already enrolled
        const { data: existing, error: checkError } = await supabase
            .from('user_course_enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        if (checkError) {
            return NextResponse.json({ error: checkError.message }, { status: 500 });
        }
        if (existing) {
            return NextResponse.json({ message: 'Already enrolled' }, { status: 200 });
        }

        const { error: insertError } = await supabase.from('user_course_enrollments').insert([
            {
                user_id: userId,
                course_id: courseId,
                enrollment_date: new Date().toISOString(),
                enrollment_method: 'direct_purchase',
                amount_paid: 0.0,
            },
        ]);
        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Enrolled successfully' }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey,
    });
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
    try {
        const { courseId } = params;
        // Count active learners (enrollments) for this course
        const { count, error } = await supabase
            .from('user_course_enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId);
        if (error) {
            return NextResponse.json({ activeLearners: 0, error: error.message }, { status: 500 });
        }
        return NextResponse.json({ activeLearners: count ?? 0 });
    } catch {
        return NextResponse.json(
            { activeLearners: 0, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
