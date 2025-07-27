import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminAuth } from '@/lib/auth';

type RouteParams = { courseId: string; quizId: string };

// PUT /api/admin/quizzes/[courseId]/[quizId] - Update quiz
export async function PUT(request: NextRequest, { params }: { params: Promise<RouteParams> }) {
    try {
        const authResult = await verifyAdminAuth(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const { courseId, quizId } = await params;
        const body = await request.json();
        const { title, questions } = body;
        if (!title && !questions) {
            return NextResponse.json(
                {
                    error: 'At least one field (title or questions) is required for update',
                },
                { status: 400 }
            );
        }
        // Update quiz title if provided
        if (title) {
            const { error: titleError } = await supabaseServer
                .from('quizzes')
                .update({ title })
                .eq('id', quizId)
                .is('deleted_at', null);
            if (titleError) {
                console.error('Error updating quiz title:', titleError);
                return NextResponse.json({ error: 'Failed to update quiz title' }, { status: 500 });
            }
        }
        if (questions && Array.isArray(questions)) {
            // Get existing questions
            const { data: existingQuestions } = await supabaseServer
                .from('questions')
                .select('id')
                .eq('quiz_id', quizId);
            // Delete existing answers and questions
            if (existingQuestions && existingQuestions.length > 0) {
                const questionIds = existingQuestions.map((q) => q.id);
                // Delete answers first
                await supabaseServer.from('answers').delete().in('question_id', questionIds);
                // Delete questions
                await supabaseServer.from('questions').delete().eq('quiz_id', quizId);
            }
            // Create new questions and answers
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                const { data: createdQuestion, error: questionError } = await supabaseServer
                    .from('questions')
                    .insert([
                        {
                            quiz_id: quizId,
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
        }
        // Fetch the updated quiz with questions and answers
        const { data: quiz, error: fetchError } = await supabaseServer
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
            .eq('id', quizId)
            .is('deleted_at', null)
            .single();
        if (fetchError || !quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }
        return NextResponse.json({ quiz });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/quizzes/[courseId]/[quizId] - Soft delete quiz
export async function DELETE(request: NextRequest, { params }: { params: Promise<RouteParams> }) {
    try {
        const authResult = await verifyAdminAuth(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const { courseId, quizId } = await params;
        // Check if quiz exists
        const { data: existingQuiz, error: checkError } = await supabaseServer
            .from('quizzes')
            .select('id')
            .eq('id', quizId)
            .is('deleted_at', null)
            .single();
        if (checkError || !existingQuiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }
        // Soft delete the quiz by setting deleted_at
        const { error } = await supabaseServer
            .from('quizzes')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', quizId);
        if (error) {
            console.error('Error deleting quiz:', error);
            return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
