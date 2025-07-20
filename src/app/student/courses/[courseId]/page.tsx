'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import WeekList from '@/components/WeekList';

import { CourseData } from '@/types/course';

import { use } from 'react';

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = use(params);
    const [data, setData] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLearners, setActiveLearners] = useState<number | null>(null);
    const [enrolled, setEnrolled] = useState<boolean>(false);
    const [enrolLoading, setEnrolLoading] = useState(false);
    const [enrolError, setEnrolError] = useState<string | null>(null);
    const { user, isLoading: userLoading } = useUser();

    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/api/student/courses/${courseId}`;
            if (user && user.id) {
                url += `?userId=${user.id}`;
            }
            const response = await fetch(url, {
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
            setEnrolled(!!courseData.enrolled);
            setActiveLearners(courseData.activeLearners ?? null);
        } catch (error) {
            console.error('Error fetching course data:', error);
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
            setEnrolled(false);
            setActiveLearners(null);
        } finally {
            setLoading(false);
        }
    }, [courseId, user]);

    // No need for separate fetchActiveLearners, handled in fetchCourseData

    useEffect(() => {
        if (!userLoading) {
            fetchCourseData();
        }
    }, [fetchCourseData, userLoading]);

    const handleEnrol = async () => {
        if (!user || !user.id) return;
        setEnrolLoading(true);
        setEnrolError(null);
        try {
            const res = await fetch(`/api/student/courses/${courseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to enrol');
            setEnrolled(true);
            fetchCourseData();
            toast.success('Enrolled successfully!');
        } catch (e: unknown) {
            setEnrolError(e instanceof Error ? e.message : 'Failed to enrol');
        } finally {
            setEnrolLoading(false);
        }
    };

    if (loading || !data || userLoading) {
        return (
            <main className="max-w-6xl mx-auto p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading course data...</div>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="max-w-6xl mx-auto p-4">
                {/* Top: Course Info + Outcomes */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch md:items-stretch">
                    {/* Left: Course Info */}
                    <div className="flex-1 bg-[#B4DEDD] rounded-lg shadow-md p-6 flex flex-col gap-3 h-full">
                        <div className="flex items-center gap-3 justify-between w-full">
                            <span className="bg-[#007C6A] text-white px-3 py-1.5 rounded-md text-xl font-bold w-fit">
                                {data.title}
                            </span>
                            {/* Enroll button for not enrolled users, right aligned */}
                            {!enrolled && user && (
                                <button
                                    className="bg-[#007C6A] text-white font-bold px-5 py-1.5 rounded-md shadow-md hover:bg-[#005F5F] transition-all duration-200 text-base whitespace-nowrap"
                                    onClick={handleEnrol}
                                    disabled={enrolLoading}
                                >
                                    {enrolLoading ? 'Enrolling...' : 'Enrol'}
                                </button>
                            )}
                        </div>
                        <p className="text-base font-medium text-[#333] leading-relaxed">
                            {data.description}
                        </p>
                        <div className="grid grid-cols-1 gap-3 text-[#005F5F] font-medium mt-4">
                            <div className="flex items-center gap-2 bg-white/20 rounded-md px-3 py-2 shadow-sm">
                                <span className="font-semibold text-[#007C6A] min-w-28">
                                    Last updated:
                                </span>
                                <span className="bg-white/50 px-2 py-1 rounded">xxx</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 rounded-md px-3 py-2 shadow-sm">
                                <span className="font-semibold text-[#007C6A] min-w-28">
                                    Language:
                                </span>
                                <span className="bg-white/50 px-2 py-1 rounded">English</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 rounded-md px-3 py-2 shadow-sm">
                                <span className="font-semibold text-[#007C6A] min-w-28">
                                    Active learners:
                                </span>
                                <span className="bg-white/50 px-2 py-1 rounded">
                                    {activeLearners !== null && activeLearners !== undefined
                                        ? activeLearners
                                        : 0}
                                </span>
                            </div>
                        </div>
                        {/* Enroll error message below title if any */}
                        {enrolError && (
                            <div className="text-red-600 text-xs mt-2 ml-1">{enrolError}</div>
                        )}
                    </div>
                    {/* Right: Outcomes + Enroll Button */}
                    <div className="flex flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-[500px] bg-white rounded-lg shadow-md border border-[#B4DEDD] p-6 flex flex-col gap-3 h-full">
                            <h2 className="text-2xl font-bold text-[#222] mb-2">
                                What you&apos;ll learn
                            </h2>
                            <ul className="flex flex-col gap-y-2 list-none">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#007C6A] font-bold text-lg">
                                        &#10003;
                                    </span>
                                    <span>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#007C6A] font-bold text-lg">
                                        &#10003;
                                    </span>
                                    <span>
                                        Curabitur ac leo nunc. Vestibulum et mauris vel ante.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#007C6A] font-bold text-lg">
                                        &#10003;
                                    </span>
                                    <span>Praesent ut ligula non mi varius sagittis.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#007C6A] font-bold text-lg">
                                        &#10003;
                                    </span>
                                    <span>Morbi nec metus. Donec id justo.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#007C6A] font-bold text-lg">
                                        &#10003;
                                    </span>
                                    <span>Nullam dictum felis eu pede mollis pretium.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#007C6A] font-bold text-lg">
                                        &#10003;
                                    </span>
                                    <span>Etiam imperdiet imperdiet orci. Nunc nec neque.</span>
                                </li>
                            </ul>
                        </div>
                        {/* Removed duplicate enroll button on right */}
                    </div>
                </div>

                {/* WeekList */}
                <WeekList weeks={data.weeks} enrolled={enrolled} />
            </main>
        </>
    );
    /* Add fade-in animation for popup */
    <style jsx global>{`
        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in {
            animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `}</style>;
}
