'use client';

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AdminCourseCard } from '@/components/AdminCourseCard';
import InstructorDashboardSkeleton from './SkeletonLoader';

// Define types for our data structure
interface DashboardData {
    stats: {
        totalCourses: number;
        activeCourses: number;
        totalStudents: number;
        totalEnrollments: number;
    };
    recentCourses: {
        id: string;
        title: string;
        created_at: string;
        is_active: boolean;
        instructor: string;
        enrollments: number;
    }[];
    courseEnrollmentCounts: Record<string, number>;
}

// Types for detailed course analytics (computed client-side)
interface CourseDetailModule {
    id: string;
    title: string;
    markedForReviewCount: number;
}

interface CourseEnrollmentDetail {
    userId: string;
    userName: string;
    progress: number; // 0-100
}

interface CourseQuizSubmissionDetail {
    submissionId: string;
    userId: string;
    userName: string;
    quizTitle: string;
    score: number | null; // null means pending
}

interface CourseDetailsState {
    modules: CourseDetailModule[];
    enrollments: CourseEnrollmentDetail[];
    quizSubmissions: CourseQuizSubmissionDetail[];
    totalModules: number;
}

export default function AdminDashboardPage() {
    const { profile, loading } = useUser();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<DashboardData['recentCourses'][0] | null>(
        null
    );
    const [courseDetails, setCourseDetails] = useState<CourseDetailsState | null>(null);
    const [courseDetailsLoading, setCourseDetailsLoading] = useState(false);
    const [courseDetailsError, setCourseDetailsError] = useState<string | null>(null);

    // Small inline loader component
    const InlineLoader = ({ text }: { text: string }) => (
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {text}
        </CardContent>
    );

    useEffect(() => {
        if (!loading) {
            if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
                router.replace('/learning');
            }
        }
    }, [profile, loading, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const response = await fetch('/api/instructor/dashboard', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(session?.access_token
                            ? { Authorization: `Bearer ${session.access_token}` }
                            : {}),
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to fetch dashboard data');
                }
                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && profile && (profile.role === 'admin' || profile.role === 'instructor')) {
            fetchDashboardData();
        }
    }, [loading, profile]);

    // Fetch detailed analytics for a selected course
    useEffect(() => {
        const loadCourseDetails = async (courseId: string) => {
            setCourseDetails(null);
            setCourseDetailsError(null);
            setCourseDetailsLoading(true);
            let timedOut = false;
            const timeout = setTimeout(() => {
                timedOut = true;
                setCourseDetailsLoading(false);
                setCourseDetailsError('Timed out while loading course details. Please retry.');
            }, 15000);
            try {
                // 1. Weeks for course
                const { data: weeks, error: weeksError } = await supabase
                    .from('weeks')
                    .select('id')
                    .eq('course_id', courseId);
                if (weeksError) throw weeksError;
                const weekIds = (weeks || []).map((w) => w.id);

                // If no weeks, short-circuit
                if (!weekIds.length) {
                    setCourseDetails({
                        modules: [],
                        enrollments: [],
                        quizSubmissions: [],
                        totalModules: 0,
                    });
                    return;
                }

                // 2. Modules for those weeks
                const { data: modules, error: modulesError } = await supabase
                    .from('modules')
                    .select('id,title')
                    .in('week_id', weekIds);
                if (modulesError) throw modulesError;
                const moduleIds = (modules || []).map((m) => m.id);

                // 3. Enrollment list
                const { data: enrollments, error: enrollError } = await supabase
                    .from('user_course_enrollments')
                    .select('user_id')
                    .eq('course_id', courseId);
                if (enrollError) throw enrollError;
                const userIds = Array.from(new Set((enrollments || []).map((e) => e.user_id)));

                // 4. Parallel fetches: user progress, reviews, profiles, quizzes, submissions
                const [progressRes, profilesRes, quizRes] = await Promise.all([
                    moduleIds.length
                        ? supabase
                              .from('user_module_progress')
                              .select('user_id,module_id,marked_for_review,completed_at')
                              .in('module_id', moduleIds)
                        : Promise.resolve({ data: [], error: null }),
                    userIds.length
                        ? supabase.from('profiles').select('id,full_name').in('id', userIds)
                        : Promise.resolve({ data: [], error: null }),
                    moduleIds.length
                        ? supabase
                              .from('quizzes')
                              .select('id,title,module_id')
                              .in('module_id', moduleIds)
                        : Promise.resolve({ data: [], error: null }),
                    // submissions after quizzes
                    Promise.resolve(null),
                ]);

                if (progressRes.error) throw progressRes.error;
                if (profilesRes.error) throw profilesRes.error;
                if (quizRes.error) throw quizRes.error;

                const quizzes = (quizRes.data || []) as { id: string; title: string }[];
                const quizIds = quizzes.map((q) => q.id);

                const submissionsFetch = quizIds.length
                    ? await supabase
                          .from('user_quiz_submissions')
                          .select('id,user_id,quiz_id,score')
                          .in('quiz_id', quizIds)
                    : { data: [], error: null };
                if (submissionsFetch.error) throw submissionsFetch.error;

                const profilesMap = new Map<string, string>(
                    (profilesRes.data as { id: string; full_name: string | null }[]).map((p) => [
                        p.id,
                        p.full_name || 'Unknown',
                    ])
                );

                // Modules review counts
                const reviewCounts: Record<string, number> = {};
                const progressByUser: Record<string, Set<string>> = {};
                (
                    progressRes.data as {
                        user_id: string;
                        module_id: string;
                        marked_for_review: boolean;
                        completed_at: string | null;
                    }[]
                ).forEach((row) => {
                    if (row.marked_for_review) {
                        reviewCounts[row.module_id] = (reviewCounts[row.module_id] || 0) + 1;
                    }
                    if (row.completed_at) {
                        if (!progressByUser[row.user_id]) progressByUser[row.user_id] = new Set();
                        progressByUser[row.user_id].add(row.module_id);
                    }
                });

                const modulesDetail: CourseDetailModule[] = (modules || []).map((m) => ({
                    id: m.id,
                    title: m.title,
                    markedForReviewCount: reviewCounts[m.id] || 0,
                }));

                const totalModules = moduleIds.length || 1; // avoid divide by 0
                const enrollmentDetails: CourseEnrollmentDetail[] = userIds.map((uid) => {
                    const completed = progressByUser[uid]?.size || 0;
                    return {
                        userId: uid,
                        userName: profilesMap.get(uid) || 'Unknown',
                        progress: Math.round((completed / totalModules) * 100),
                    };
                });

                const quizMap = new Map<string, string>(quizzes.map((q) => [q.id, q.title]));
                const quizDetails: CourseQuizSubmissionDetail[] = (submissionsFetch.data || []).map(
                    (s: { id: string; user_id: string; quiz_id: string; score: number }) => ({
                        submissionId: s.id,
                        userId: s.user_id,
                        userName: profilesMap.get(s.user_id) || 'Unknown',
                        quizTitle: quizMap.get(s.quiz_id) || 'Unknown Quiz',
                        score: s.score,
                    })
                );

                if (!timedOut) {
                    setCourseDetails({
                        modules: modulesDetail,
                        enrollments: enrollmentDetails,
                        quizSubmissions: quizDetails,
                        totalModules:
                            totalModules === 1 && moduleIds.length === 0 ? 0 : totalModules,
                    });
                }
            } catch (e: unknown) {
                if (!timedOut) {
                    let msg = 'Failed to load course details';
                    if (
                        typeof e === 'object' &&
                        e &&
                        'message' in e &&
                        typeof (e as { message?: string }).message === 'string'
                    ) {
                        msg = (e as { message: string }).message;
                    } else if (
                        typeof e === 'object' &&
                        e &&
                        'details' in e &&
                        typeof (e as { details?: string }).details === 'string'
                    ) {
                        msg = (e as { details: string }).details;
                    }
                    setCourseDetailsError(msg);
                }
            } finally {
                if (!timedOut) setCourseDetailsLoading(false);
                clearTimeout(timeout);
            }
        };

        if (selectedCourse) {
            loadCourseDetails(selectedCourse.id);
        } else {
            setCourseDetails(null);
            setCourseDetailsError(null);
        }
    }, [selectedCourse]);

    if (loading || isLoading) {
        return <InstructorDashboardSkeleton />;
    }

    if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) {
        return null;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                Error: {error}
            </div>
        );
    }

    // --- RENDER LOGIC: DETAIL VIEW ---
    if (selectedCourse) {
        const enrollmentCount = dashboardData?.courseEnrollmentCounts[selectedCourse.id] || 0;
        return (
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="mb-2">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course Overview
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900">{selectedCourse.title}</h1>
                    <p className="text-muted-foreground">Course analytics & insights</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollments</CardTitle>
                            <CardDescription>Total learners enrolled</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">{enrollmentCount}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                            <CardDescription>Current course visibility</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={selectedCourse.is_active ? 'default' : 'secondary'}>
                                {selectedCourse.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Created</CardTitle>
                            <CardDescription>Initial publish date</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {new Date(selectedCourse.created_at).toLocaleDateString()}
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="students" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="modules">Modules</TabsTrigger>
                        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                    </TabsList>
                    {courseDetailsError && (
                        <div className="text-sm text-red-500 mb-4">{courseDetailsError}</div>
                    )}
                    <TabsContent value="students">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Progress</CardTitle>
                                <CardDescription>
                                    Completion percentage across all modules.
                                </CardDescription>
                            </CardHeader>
                            {courseDetailsLoading ? (
                                <InlineLoader text="Loading student data..." />
                            ) : courseDetails && courseDetails.enrollments.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead className="text-right">Progress</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courseDetails.enrollments.map((e) => (
                                            <TableRow key={e.userId}>
                                                <TableCell className="font-medium">
                                                    {e.userName}
                                                </TableCell>
                                                <TableCell className="text-right flex items-center justify-end gap-2">
                                                    <span>{e.progress}%</span>
                                                    {e.progress < 30 && (
                                                        <Badge variant="destructive">
                                                            Struggling
                                                        </Badge>
                                                    )}
                                                    <Progress value={e.progress} className="w-24" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <CardContent className="text-sm text-muted-foreground">
                                    No enrollments yet.
                                </CardContent>
                            )}
                        </Card>
                    </TabsContent>
                    <TabsContent value="modules">
                        <Card>
                            <CardHeader>
                                <CardTitle>Module Insights</CardTitle>
                                <CardDescription>
                                    Count of times modules were marked for review.
                                </CardDescription>
                            </CardHeader>
                            {courseDetailsLoading ? (
                                <InlineLoader text="Loading module insights..." />
                            ) : courseDetails && courseDetails.modules.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Module</TableHead>
                                            <TableHead className="text-right">
                                                Marked For Review
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courseDetails.modules.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="font-medium">
                                                    {m.title}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {m.markedForReviewCount}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <CardContent className="text-sm text-muted-foreground">
                                    No modules yet.
                                </CardContent>
                            )}
                        </Card>
                    </TabsContent>
                    <TabsContent value="quizzes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Submissions</CardTitle>
                                <CardDescription>Scores for submitted quizzes.</CardDescription>
                            </CardHeader>
                            {courseDetailsLoading ? (
                                <InlineLoader text="Loading quiz data..." />
                            ) : courseDetails && courseDetails.quizSubmissions.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Quiz</TableHead>
                                            <TableHead className="text-right">Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courseDetails.quizSubmissions.map((qs) => (
                                            <TableRow key={qs.submissionId}>
                                                <TableCell className="font-medium">
                                                    {qs.userName}
                                                </TableCell>
                                                <TableCell>{qs.quizTitle}</TableCell>
                                                <TableCell className="text-right">
                                                    {qs.score !== null ? (
                                                        `${qs.score}%`
                                                    ) : (
                                                        <Badge variant="outline">Pending</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <CardContent className="text-sm text-muted-foreground">
                                    No quiz submissions yet.
                                </CardContent>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    // --- RENDER LOGIC: MASTER (OVERVIEW) VIEW ---
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {profile?.full_name || 'Instructor'}!
                    </p>
                </div>
                <Button asChild className="bg-teal-700 hover:bg-teal-800">
                    <Link href="/instructor/courses/new">Create New Course</Link>
                </Button>
            </div>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {dashboardData?.stats.totalCourses || 0}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {dashboardData?.stats.activeCourses || 0}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Students</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {dashboardData?.stats.totalStudents || 0}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {dashboardData?.stats.totalEnrollments || 0}
                    </CardContent>
                </Card>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">Recent Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dashboardData?.recentCourses.map((course) => (
                        <AdminCourseCard
                            key={course.id}
                            id={course.id}
                            name={course.title}
                            enrollments={course.enrollments}
                            status={course.is_active ? 'active' : 'inactive'}
                            onViewDetailsClick={() => setSelectedCourse(course)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
