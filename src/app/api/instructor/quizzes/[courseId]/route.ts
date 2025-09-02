import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminAuth } from '@/lib/auth-server';

type Params = Promise<{ courseId: string }>;

// GET /api/admin/quizzes/[courseId] - Get quizzes for course
export async function GET(request: NextRequest, { params }: { params: Params }) {
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

        const { data: quizzes, error } = await supabaseServer
            .from('quizzes')
            .select(
                `
        id,
        title,
        module_id,
        created_at,
        questions (
          id,
          question_text,
          question_type,
          order_index,
          answers (
            id,
            answer_text,
            is_correct
          )
        )
      `
            )
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching quizzes:', error);
            return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
        }
        // Filter quizzes by courseId through the proper relationship: course → weeks → modules
        // First, get all weeks for this course
        const { data: weeks, error: weeksError } = await supabaseServer
            .from('weeks')
            .select('id')
            .eq('course_id', courseId);

        if (weeksError) {
            console.error('Error fetching weeks:', weeksError);
            return NextResponse.json({ error: 'Failed to fetch course weeks' }, { status: 500 });
        }

        const weekIds = weeks?.map((w) => w.id) || [];

        // Then get all modules for these weeks
        const { data: modules, error: moduleError } = await supabaseServer
            .from('modules')
            .select('id')
            .in('week_id', weekIds);

        if (moduleError) {
            console.error('Error fetching modules:', moduleError);
            return NextResponse.json({ error: 'Failed to fetch course modules' }, { status: 500 });
        }

        const moduleIds = modules?.map((m) => m.id) || [];
        const courseQuizzes = (quizzes || []).filter((quiz: { module_id: string }) =>
            moduleIds.includes(quiz.module_id)
        );
        return NextResponse.json({ quizzes: courseQuizzes });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// POST /api/admin/quizzes/[courseId] - Create new quiz
export async function POST(request: NextRequest) {
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
        // courseId is unused and params removed to silence lint
        const body = await request.json();

        const { title, moduleId, questions } = body;
        if (!title || !moduleId || !questions || !Array.isArray(questions)) {
            return NextResponse.json(
                {
                    error: 'Title, moduleId, and questions array are required',
                },
                { status: 400 }
            );
        }
        // Create the quiz first
        const { data: quiz, error: quizError } = await supabaseServer
            .from('quizzes')
            .insert([
                {
                    title,
                    module_id: moduleId,
                    created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();
        if (quizError) {
            console.error('Error creating quiz:', quizError);
            return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
        }
        // Create questions and answers
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            const { data: createdQuestion, error: questionError } = await supabaseServer
                .from('questions')
                .insert([
                    {
                        quiz_id: quiz.id,
                        question_text: question.text,
                        question_type: question.type || 'multiple_choice',
                        order_index: i + 1,
                    },
                ])
                .select()
                .single();
            if (questionError) {
                console.error('Error creating question:', questionError);
                continue;
            }
            // Create answers for this question
            if (question.options && Array.isArray(question.options)) {
                const answerInserts = question.options.map((option: string) => ({
                    question_id: createdQuestion.id,
                    answer_text: option,
                    is_correct: option === question.correctAnswer,
                }));
                const { error: answersError } = await supabaseServer
                    .from('answers')
                    .insert(answerInserts);
                if (answersError) {
                    console.error('Error creating answers:', answersError);
                }
            }
        }
        // Fetch the complete quiz with questions and
        const { data: completeQuiz, error: fetchError } = await supabaseServer
            .from('quizzes')
            .select(
                `
        id,
        title,
        module_id,
        created_at,
        questions (
          id,
          question_text,
          question_type,
          order_index,
          answers (
            id,
            answer_text,
            is_correct
          )
        )
      `
            )
            .eq('id', quiz.id)
            .single();
        if (fetchError) {
            console.error('Error fetching complete quiz:', fetchError);
        }
        return NextResponse.json({ quiz: completeQuiz || quiz }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
