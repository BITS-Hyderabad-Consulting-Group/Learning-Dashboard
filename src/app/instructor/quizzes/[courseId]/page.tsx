'use client';

import React, { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import data from '../../../admin/APIdata.json';

// Define types for our detailed data
type Quiz = (typeof data.quizzes)[0];
type Question = Quiz['questions'][0];

export default function QuizSubmissionsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = React.use(params);
    const { courses, students, quizzes, quizSubmissions } = data;

    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

    // Find the course and its relevant data
    const course = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);
    const courseQuizzes = useMemo(
        () => quizzes.filter((q) => q.courseId === courseId),
        [quizzes, courseId]
    );
    const courseSubmissions = useMemo(
        () => quizSubmissions.filter((s) => s.courseId === courseId),
        [quizSubmissions, courseId]
    );

    const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);

    // Create a map of all questions for quick lookup
    const questionMap = useMemo(() => {
        const map = new Map<string, Question>();
        courseQuizzes.forEach((quiz) => {
            quiz.questions.forEach((question) => {
                map.set(question.questionId, question);
            });
        });
        return map;
    }, [courseQuizzes]);

    const selectedSubmission = useMemo(() => {
        if (!selectedSubmissionId) return null;
        return courseSubmissions.find((s) => s.submissionId === selectedSubmissionId);
    }, [selectedSubmissionId, courseSubmissions]);

    if (!course) {
        return notFound();
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
                <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Left Column: List of Submissions */}
                <div className="md:col-span-1 space-y-2">
                    <h2 className="text-lg font-semibold px-2">Student Submissions</h2>
                    {courseSubmissions.map((submission) => (
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
                                    {studentMap.get(submission.studentId) || 'Unknown'}
                                </p>
                                <Badge
                                    variant={
                                        submission.score && submission.score > 70
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {submission.score}%
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {quizzes.find((q) => q.quizId === submission.quizId)?.quizTitle}
                            </p>
                        </button>
                    ))}
                    {courseSubmissions.length === 0 && (
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
                                    ? `Viewing submission for ${studentMap.get(
                                          selectedSubmission.studentId
                                      )}`
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
                                        const isCorrect =
                                            answer.studentAnswer === question.correctAnswer;

                                        return (
                                            <div key={answer.questionId}>
                                                <p className="font-semibold text-gray-800 mb-2">
                                                    {question.text}
                                                </p>
                                                <div className="space-y-2">
                                                    {question.options.map((option) => {
                                                        const isSelected =
                                                            option === answer.studentAnswer;
                                                        const isTheCorrectAnswer =
                                                            option === question.correctAnswer;
                                                        return (
                                                            <div
                                                                key={option}
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
                                                                <span>{option}</span>
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
