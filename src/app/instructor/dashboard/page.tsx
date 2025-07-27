'use client';

import { useMemo, useState } from 'react';
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
import { ArrowLeft } from 'lucide-react';
import data from './APIdata.json';
import { CourseCard } from '@/components/CourseCard';

// Define types for our new data structure
type AdminCourse = (typeof data.courses)[0];

export default function AdminDashboardPage() {
    const { admin, courses, students, enrollments, quizSubmissions } = data;
    const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);

    const myCourses = useMemo(
        () => courses.filter((c) => c.owner_id === admin.id),
        [courses, admin.id]
    );
    const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);

    // High-level overview stats
    const overviewStats = useMemo(
        () => ({
            totalCourses: myCourses.length,
            activeCourses: myCourses.filter((c) => c.status === 'active').length,
            totalEnrollments: enrollments.filter((e) =>
                myCourses.some((mc) => mc.id === e.courseId)
            ).length,
        }),
        [myCourses, enrollments]
    );

    // --- RENDER LOGIC: DETAIL VIEW ---
    if (selectedCourse) {
        const courseEnrollments = enrollments.filter((e) => e.courseId === selectedCourse.id);
        const courseSubmissions = quizSubmissions.filter((q) => q.courseId === selectedCourse.id);
        const avgCompletion =
            courseEnrollments.length > 0
                ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) /
                  courseEnrollments.length
                : 0;

        return (
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course Overview
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedCourse.name}</h1>
                    <p className="text-muted-foreground">Detailed Analytics</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {courseEnrollments.length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Avg. Completion</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {avgCompletion.toFixed(0)}%
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Submissions</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {courseSubmissions.length}
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="students" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="students">Student Engagement</TabsTrigger>
                        <TabsTrigger value="modules">Module Insights</TabsTrigger>
                        <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="students">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Progress</CardTitle>
                                <CardDescription>
                                    Showing all students enrolled in this course.
                                </CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">Progress</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courseEnrollments.map((enrollment) => (
                                        <TableRow key={enrollment.enrollmentId}>
                                            <TableCell className="font-medium">
                                                {studentMap.get(enrollment.studentId) || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                <span>{enrollment.progress}%</span>
                                                <Progress
                                                    value={enrollment.progress}
                                                    className="w-24"
                                                />
                                                {enrollment.progress < 30 && (
                                                    <Badge variant="destructive">Struggling</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="modules">
                        <Card>
                            <CardHeader>
                                <CardTitle>Module Insights</CardTitle>
                                <CardDescription>
                                    Highlights modules that students frequently mark for review.
                                </CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Module</TableHead>
                                        <TableHead className="text-right">
                                            Marked for Review Count
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedCourse.modules.map((module) => (
                                        <TableRow key={module.id}>
                                            <TableCell className="font-medium">
                                                {module.title}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {module.markedForReviewCount} times
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="quizzes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Submissions</CardTitle>
                                <CardDescription>
                                    To provide feedback, visit the full submission page.
                                </CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Quiz</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courseSubmissions.map((sub) => (
                                        <TableRow key={sub.submissionId}>
                                            <TableCell className="font-medium">
                                                {studentMap.get(sub.studentId) || 'Unknown'}
                                            </TableCell>
                                            <TableCell>{sub.quizTitle}</TableCell>
                                            <TableCell className="text-right">
                                                {sub.score !== null ? (
                                                    `${sub.score}%`
                                                ) : (
                                                    <Badge variant="outline">Pending</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                    <p className="text-muted-foreground">Welcome back, {admin.full_name}!</p>
                </div>
                <Button asChild className="bg-teal-700 hover:bg-teal-800">
                    <Link href="/instructor/courses/new">Create New Course</Link>
                </Button>
            </div>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {overviewStats.totalCourses}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Courses</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {overviewStats.activeCourses}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {overviewStats.totalEnrollments.toLocaleString()}
                    </CardContent>
                </Card>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">My Courses Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myCourses.map((course) => {
                        const enrollmentCount = enrollments.filter(
                            (e) => e.courseId === course.id
                        ).length;
                        const avgProgress =
                            enrollmentCount > 0
                                ? enrollments
                                      .filter((e) => e.courseId === course.id)
                                      .reduce((sum, e) => sum + e.progress, 0) / enrollmentCount
                                : 0;

                        return (
                            <div key={course.id} className="flex flex-col gap-2">
                                <CourseCard
                                    id={course.id}
                                    name={course.name}
                                    modules={course.modules.length}
                                    duration={Number(course.duration)}
                                    progress={avgProgress}
                                    showProgress={false}
                                />
                                <div className="grid grid-cols-2 gap-2 text-center p-2 rounded-lg bg-gray-50 border">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Enrollments</p>
                                        <p className="font-semibold text-sm">{enrollmentCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <p className="font-semibold text-sm">
                                            <Badge
                                                variant={
                                                    course.status === 'active'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {course.status}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={() => setSelectedCourse(course)}>
                                    View Detailed Analytics
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/instructor/courses/${course.id}`}>
                                            Edit Course
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/instructor/quizzes/${course.id}`}>
                                            Quiz Submissions
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
