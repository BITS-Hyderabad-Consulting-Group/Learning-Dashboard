'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase-client';

// Define types for our API data
type Submission = {
    submissionId: string;
    quizId: string;
    courseId: string;
    studentId: string;
    studentName: string;
    quizTitle: string;
    score: number | null;
    status: string;
    answers: {
        questionId: string;
        selectedAnswerId: string | null;
        submittedText: string | null;
    }[];
    submittedAt: string | null;
    gradedAt: string | null;
    instructorFeedback: string | null;
};

type Question = {
    id: string;
    question_text: string;
    question_type: string;
    order_index: number;
    answers: {
        id: string;
        answer_text: string;
        is_correct: boolean;
    }[];
};

type Course = {
    id: string;
    title: string;
    description: string;
};

export default function QuizSubmissionsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { profile, loading } = useUser();
    const router = useRouter();
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get courseId from params
    useEffect(() => {
        (async () => {
            const resolved = await params;
            setCourseId(resolved.courseId);
        })();
    }, [params]);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;
            setIsLoading(true);
            setError(null);
            
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

                // Fetch course details, submissions, and questions in parallel
                const [courseRes, submissionsRes, quizzesRes] = await Promise.all([
                    fetch(`/api/instructor/courses/${courseId}`, { headers }),
                    fetch(`/api/instructor/quizzes/${courseId}/submissions`, { headers }),
                    fetch(`/api/instructor/quizzes/${courseId}`, { headers })
                ]);

                if (!courseRes.ok) {
                    throw new Error('Failed to fetch course');
                }
                if (!submissionsRes.ok) {
                    throw new Error('Failed to fetch submissions');
                }
                if (!quizzesRes.ok) {
                    throw new Error('Failed to fetch quizzes');
                }

                const [courseData, submissionsData, quizzesData] = await Promise.all([
                    courseRes.json(),
                    submissionsRes.json(),
                    quizzesRes.json()
                ]);

                setCourse({ 
                    id: courseData.id, 
                    title: courseData.name || courseData.title,
                    description: courseData.description || ''
                });
                setSubmissions(submissionsData.submissions || []);
                
                // Extract all questions from all quizzes for answer lookup
                const allQuestions: Question[] = [];
                (quizzesData.quizzes || []).forEach((quiz: { questions?: Question[] }) => {
                    if (quiz.questions) {
                        allQuestions.push(...quiz.questions);
                    }
                });
                setQuestions(allQuestions);
                
            } catch (err: unknown) {
                let errorMsg = 'Failed to load data';
                if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: string }).message === 'string') {
                    errorMsg = (err as { message: string }).message;
                }
                setError(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && profile && (profile.role === 'admin' || profile.role === 'instructor')) {
            fetchData();
        }
    }, [courseId, loading, profile]);

    const selectedSubmission = useMemo(() => {
        if (!selectedSubmissionId) return null;
        return submissions.find(s => s.submissionId === selectedSubmissionId);
    }, [selectedSubmissionId, submissions]);

    const questionMap = useMemo(() => {
        const map = new Map<string, Question>();
        questions.forEach(q => map.set(q.id, q));
        return map;
    }, [questions]);

    useEffect(() => {
        if (!loading) {
            if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
                router.replace('/learning');
            }
        }
    }, [profile, loading, router]);

    // Wait for courseId to be set
    if (!courseId) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }
    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading quiz submissions...
            </div>
        );
    }
    // Only allow admin or instructor
    if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
        if (typeof window !== 'undefined') {
            window.location.replace('/learning');
        }
        return null;
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }
    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Course not found.
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <Button asChild variant="ghost" className="-ml-4 mb-4">
                    <Link href="/instructor/dashboard">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Link>
                </Button>
                <p className="text-muted-foreground">Quiz Submissions for</p>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Left Column: List of Submissions */}
                <div className="md:col-span-1 space-y-2">
                    <h2 className="text-lg font-semibold px-2">Student Submissions</h2>
                    {submissions.map((submission) => (
                        <button
                            key={submission.submissionId}
                            onClick={() => setSelectedSubmissionId(submission.submissionId)}
                            className={cn(
                                'w-full text-left p-3 rounded-lg border transition-colors',
                                selectedSubmissionId === submission.submissionId
                                    ? 'bg-teal-50 border-teal-200'
                                    : 'bg-white hover:bg-gray-50'
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-800">
                                    {submission.studentName}
                                </p>
                                <Badge
                                    variant={
                                        submission.score && submission.score > 70
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {submission.score ? `${submission.score}%` : 'N/A'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {submission.quizTitle}
                            </p>
                        </button>
                    ))}
                    {submissions.length === 0 && (
                        <p className="text-sm text-muted-foreground p-3">
                            No submissions yet for this course.
                        </p>
                    )}
                </div>

                {/* Right Column: Submission Details */}
                <div className="md:col-span-2">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Submission Details</CardTitle>
                            <CardDescription>
                                {selectedSubmission
                                    ? `Viewing submission for ${selectedSubmission.studentName}`
                                    : 'Select a student submission to view details.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedSubmission ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No submission selected.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedSubmission.answers.map((answer) => {
                                        const question = questionMap.get(answer.questionId);
                                        if (!question) return null;
                                        
                                        // Find the correct answer
                                        const correctAnswer = question.answers.find(a => a.is_correct);
                                        const isCorrect = answer.selectedAnswerId === correctAnswer?.id;

                                        return (
                                            <div key={answer.questionId}>
                                                <p className="font-semibold text-gray-800 mb-2">
                                                    {question.question_text}
                                                </p>
                                                <div className="space-y-2">
                                                    {question.answers.map((option) => {
                                                        const isSelected = option.id === answer.selectedAnswerId;
                                                        const isTheCorrectAnswer = option.is_correct;
                                                        return (
                                                            <div
                                                                key={option.id}
                                                                className={cn(
                                                                    'flex items-center justify-between p-3 rounded-md border text-sm',
                                                                    isSelected &&
                                                                        !isCorrect &&
                                                                        'bg-red-50 border-red-200 text-red-800',
                                                                    isSelected &&
                                                                        isCorrect &&
                                                                        'bg-green-50 border-green-200 text-green-800',
                                                                    !isSelected &&
                                                                        isTheCorrectAnswer &&
                                                                        'border-green-300'
                                                                )}
                                                            >
                                                                <span>{option.answer_text}</span>
                                                                {isSelected && !isCorrect && (
                                                                    <X className="h-5 w-5 text-red-500" />
                                                                )}
                                                                {isSelected && isCorrect && (
                                                                    <Check className="h-5 w-5 text-green-500" />
                                                                )}
                                                                {!isSelected &&
                                                                    isTheCorrectAnswer && (
                                                                        <Check className="h-5 w-5 text-green-500 opacity-50" />
                                                                    )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {answer.submittedText && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                                        <p className="text-sm font-medium text-gray-700">Text Answer:</p>
                                                        <p className="text-sm text-gray-600">{answer.submittedText}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
