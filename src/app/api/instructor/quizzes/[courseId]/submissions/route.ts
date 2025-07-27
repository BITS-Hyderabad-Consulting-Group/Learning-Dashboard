import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAdminAuth } from '@/lib/auth';
type Params = Promise<{ courseId: string }>;
// GET /api/admin/quizzes/[courseId]/submissions - Get 
quiz 
submissions
export async function GET(request: NextRequest, { params 
}: { 
params: Params }) {
  try {
    const authResult = await verifyAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error 
}, {
status: authResult.status });
    }
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    // First, get all modules for this course to filter 
quiz 
submissions
    const { data: weeks } = await supabaseServer
      .from('weeks')
      .select('id')
      .eq('course_id', courseId);
    if (!weeks || weeks.length === 0) {
      return NextResponse.json({ submissions: [] });
    }
    const weekIds = weeks.map(w => w.id);
    const { data: modules } = await supabaseServer
      .from('modules')
      .select('id')
      .in('week_id', weekIds);
    if (!modules || modules.length === 0) {
      return NextResponse.json({ submissions: [] });
    }
    const moduleIds = modules.map(m => m.id);
    // Get quizzes for these modules
    let quizQuery = supabaseServer
      .from('quizzes')
      .select('id')
      .in('module_id', moduleIds)
      .is('deleted_at', null);
    if (quizId) {
      quizQuery = quizQuery.eq('id', quizId);
    }
    const { data: quizzes } = await quizQuery;
    if (!quizzes || quizzes.length === 0) {
      return NextResponse.json({ submissions: [] });
    }
    const quizIds = quizzes.map(q => q.id);
    // Get quiz submissions for these quizzes
    const { data: submissions, error } = await 
supabaseServer
      .from('quiz_submissions')
      .select(`
        id,
        user_id,
        quiz_id,
        score,
        status,
        submitted_at,
        graded_at,
        instructor_feedback,
        user_quiz_answers (
          id,
          submission_id,
          question_id,
          selected_answer_id,
          submitted_text
        )
      `)
      .in('quiz_id', quizIds)
      .order('submitted_at', { ascending: false });
    if (error) {
      console.error('Error fetching quiz submissions:', 
error);
      return NextResponse.json({ error: 'Failed to fetch 
submissions' }, { status: 500 });
    }
    // Get user and quiz details
    const userIds = [...new Set(submissions?.map(s => 
s.user_id) 
|| [])];
    const submissionQuizIds = [...new 
Set(submissions?.map(s => 
s.quiz_id) || [])];
    const [usersData, quizzesData] = await Promise.all([
      supabaseServer
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds),
      supabaseServer
        .from('quizzes')
        .select('id, title')
        .in('id', submissionQuizIds)
    ]);
    const users = usersData.data || [];
    const quizTitles = quizzesData.data || [];
    // Transform submissions to match expected format
    const transformedSubmissions = (submissions || 
[]).map(submission => {
      const user = users.find(u => u.id === 
submission.user_id);
      const quiz = quizTitles.find(q => q.id === 
submission.quiz_id);
      return {
        submissionId: submission.id,
        quizId: submission.quiz_id,
        courseId: courseId,
        studentId: submission.user_id,
        studentName: user?.full_name || 'Unknown 
Student',
        quizTitle: quiz?.title || 'Unknown Quiz',
        score: submission.score,
        status: submission.status,
        answers: submission.user_quiz_answers || [],
        submittedAt: submission.submitted_at,
        gradedAt: submission.graded_at,
        instructorFeedback: 
submission.instructor_feedback
      };
    });
    return NextResponse.json({ submissions: 
transformedSubmissions 
});
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server 
error' }, { 
status: 500 });
  }

