'use client';

import { useState, useEffect, useCallback } from 'react';
import WeekList from '@/components/WeekList';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock } from 'lucide-react';
import { CourseData } from '@/types/course';

//Convert the total duration from minutes to "X hr Y min" format
function formatDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
}

//Main component to display the course page
export default function CoursePage({ params }: { params: { courseId: string } }) {
    const { courseId } = params;
    const [data, setData] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch course data: ${response.status}`);
            }

            const courseData = await response.json();
            setData(courseData);
        } catch (error) {
            console.error('Error fetching course data:', error);
            // Set fallback data on error
            setData({
                title: 'Course Not Found',
                description:
                    'Unable to load course data. Please check your connection and try again.',
                modulesCount: 0,
                totalDuration: 0,
                modulesCompleted: 0,
                weeksCompleted: 0,
                markedForReview: 0,
                weeks: [],
            });
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    if (loading || !data) {
        return (
            <main className="max-w-6xl mx-auto p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading course data...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-6xl mx-auto p-4">
            {/* Header section: Course Info + Progress */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Left Card: Course Info */}
                <Card className="flex-1 bg-[#B4DEDD] shadow-md">
                    <CardContent className="pt-2 px-4 pb-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="bg-[#007C6A] text-white px-3 py-1.5 rounded-md text-xl font-bold w-fit">
                                {data.title}
                            </div>

                            {/* (Modules + Duration) */}
                            <div className="flex items-center gap-4 text-[#005F5F] font-medium text-sm">
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{data.modulesCount} Modules</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(data.totalDuration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Course description */}
                        <p className="text-base font-medium text-[#333] leading-relaxed">
                            {data.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Right Card: Progress Summary */}
                <Card className="w-full lg:w-64 bg-[#B4DEDD] shadow-md">
                    <CardContent className="pt-2 px-4 pb-3">
                        {/* Status */}
                        <h2 className="text-center text-base text-black font-bold">Status</h2>
                        <hr className="my-2 border-gray-300" />

                        {/* Rows */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-[#007C6A] text-xs font-medium">
                                    Modules Completed
                                </p>
                                <p className="text-black text-lg font-bold">
                                    {data.modulesCompleted}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-[#007C6A] text-xs font-medium">
                                    Weeks Completed
                                </p>
                                <p className="text-black text-lg font-bold">
                                    {data.weeksCompleted} / {data.weeks.length}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-[#007C6A] text-xs font-medium">
                                    Marked for Review
                                </p>
                                <p className="text-black text-lg font-bold">
                                    {data.markedForReview}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* WeekList */}
            <WeekList weeks={data.weeks} />
        </main>
    );
}
