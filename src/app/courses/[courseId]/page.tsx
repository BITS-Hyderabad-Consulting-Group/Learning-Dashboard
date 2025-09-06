'use client';

import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { format, isValid, parseISO } from 'date-fns';
import WeekList from '@/components/WeekList';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import CoursePageSkeleton from './CoursePageSkeleton';
import { CourseData } from '@/types/course';

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = use(params);
    const [data, setData] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolLoading, setEnrolLoading] = useState(false);
    const [enrolError, setEnrolError] = useState<string | null>(null);
    const { user, loading: userLoading } = useUser();
    const [isAboutOpen, setIsAboutOpen] = useState(true);
    const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        setIsObjectivesOpen(!isMobile);
    }, []);

    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        try {
            // Simplify URL construction
            const url = user?.id
                ? `/api/courses/${courseId}?userId=${user.id}`
                : `/api/courses/${courseId}`;

            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch course data: ${response.status}`);
            }

            const courseData: CourseData = await response.json();
            setData(courseData);
        } catch {
            // Set a complete error state object to avoid null reference errors in the UI
            setData({
                title: 'Course Not Found',
                description: 'Unable to load course data. Please check the URL or try again later.',
                courseObjectives: [],
                modulesCount: 0,
                weeks: [],
                enrolled: false,
                instructor: 'N/A',
                updatedAt: new Date(),
                activeLearners: 0,
                completedModules: [],
                markedForReview: 0,
                weeksCompleted: 0,
                totalDuration: 0,
                modulesCompleted: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [courseId, user]);

    useEffect(() => {
        if (!userLoading) {
            fetchCourseData();
        }
    }, [fetchCourseData, userLoading]);

    const transformedWeeks = useMemo(() => {
        if (!data?.weeks) return [];

        return data.weeks.map((week) => ({
            ...week,
            modules: week.modules.map((module) => ({
                ...module,
                type: module.type.charAt(0).toUpperCase() + module.type.slice(1),
            })),
        }));
    }, [data]);

    const handleEnrol = async () => {
        if (!user || !user.id) return;
        setEnrolLoading(true);
        setEnrolError(null);
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to enroll');
            await fetchCourseData(); // Refetch data to update UI state
            toast.success('Enrolled successfully!');
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            setEnrolError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setEnrolLoading(false);
        }
    };

    if (loading || userLoading) {
        return <CoursePageSkeleton />;
    }

    // Fallback if data loading fails but we are no longer in a 'loading' state
    if (!data) {
        return (
            <main className="max-w-7xl mx-auto p-6 text-center text-red-500">
                Course data could not be loaded.
            </main>
        );
    }

    return (
        <>
            <motion.main
                className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                {/* Top: Course Info + Outcomes */}
                <motion.div
                    className="flex flex-col md:flex-row gap-6 mb-8 items-stretch md:items-stretch"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {/* Left: Course Info */}
                    <Collapsible
                        open={isAboutOpen}
                        onOpenChange={setIsAboutOpen}
                        className="flex-1 bg-[#B4DEDD] rounded-lg shadow-md p-6 flex flex-col gap-3 h-full"
                    >
                        <div className="flex items-center gap-3 justify-between w-full">
                            <motion.h1
                                className="bg-[#03706E] text-white px-3 py-1.5 rounded-md text-xl font-bold w-fit"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                {data.title}
                            </motion.h1>
                            <CollapsibleTrigger className="md:hidden rounded-full p-2 bg-white/30 hover:bg-white/50">
                                <motion.div animate={{ rotate: isAboutOpen ? 180 : 0 }}>
                                    <ChevronDown className="h-5 w-5 text-[#03706E]" />
                                </motion.div>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            <motion.p
                                className="text-base font-medium text-[#333] leading-relaxed mt-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                            >
                                {data.description}
                            </motion.p>
                            <motion.div
                                className="grid grid-cols-1 gap-3 text-[#005F5F] font-medium mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {[
                                    {
                                        label: 'Instructor:',
                                        value: data.instructor || 'N/A',
                                    },
                                    {
                                        label: 'Last updated:',
                                        value: (() => {
                                            const date =
                                                typeof data.updatedAt === 'string'
                                                    ? parseISO(data.updatedAt)
                                                    : data.updatedAt;
                                            return isValid(date)
                                                ? format(date, 'dd MMMM, yyyy')
                                                : 'N/A';
                                        })(),
                                    },
                                    {
                                        label: 'Active learners:',
                                        value: data.activeLearners ?? 0,
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-2 bg-white/20 rounded-md px-3 py-3 shadow-sm"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.5 + index * 0.05,
                                        }}
                                        whileHover={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            transition: { duration: 0.2 },
                                        }}
                                    >
                                        <span className="font-semibold text-[#03706E]">
                                            {item.label}
                                        </span>
                                        <motion.span
                                            className="bg-white/50 px-2 py-0 rounded-full"
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {item.value}
                                        </motion.span>
                                    </motion.div>
                                ))}
                            </motion.div>
                            <AnimatePresence>
                                {!data?.enrolled && user && (
                                    <motion.button
                                        className="bg-[#007C6A] text-white font-bold px-5 py-1.5 rounded-md shadow-md hover:bg-[#005F5F] transition-all duration-200 text-base whitespace-nowrap mt-4"
                                        onClick={handleEnrol}
                                        disabled={enrolLoading}
                                        initial={{
                                            opacity: 0,
                                            scale: 0.9,
                                        }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.span
                                            transition={{
                                                duration: 1,
                                                repeat: enrolLoading ? Infinity : 0,
                                                ease: 'linear',
                                            }}
                                            style={{
                                                display: 'inline-block',
                                            }}
                                        >
                                            {enrolLoading ? (
                                                <svg
                                                    className="w-4 h-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="4"
                                                        d="M4 12a8 8 0 018-8"
                                                    ></path>
                                                </svg>
                                            ) : (
                                                'Enroll'
                                            )}
                                        </motion.span>
                                        {enrolLoading && ' Enrolling'}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                {enrolError && (
                                    <motion.div
                                        className="text-red-600 text-xs mt-2 ml-1"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {enrolError}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Right: Outcomes */}
                    <Collapsible
                        open={isObjectivesOpen}
                        onOpenChange={setIsObjectivesOpen}
                        className="flex flex-row items-center gap-4 w-full md:w-auto"
                    >
                        <motion.div
                            className="flex-1 md:w-[500px] bg-white rounded-lg shadow-md border border-[#B4DEDD] p-6 flex flex-col gap-3 h-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <div className="flex justify-between items-center">
                                <motion.h2
                                    className="text-2xl font-bold text-[#222] mb-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.4,
                                    }}
                                >
                                    Learning Objectives
                                </motion.h2>
                                <CollapsibleTrigger className="md:hidden rounded-full p-2 bg-gray-100 hover:bg-gray-200">
                                    <motion.div
                                        animate={{
                                            rotate: isObjectivesOpen ? 180 : 0,
                                        }}
                                    >
                                        <ChevronDown className="h-5 w-5 text-[#03706E]" />
                                    </motion.div>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                                <motion.ul
                                    className="flex flex-col gap-y-2 list-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.5,
                                    }}
                                >
                                    {data.courseObjectives?.map((text, index) => (
                                        <motion.li
                                            key={index}
                                            className="flex items-start gap-2"
                                            initial={{
                                                opacity: 0,
                                                x: -10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                delay: 0.6 + index * 0.05,
                                            }}
                                        >
                                            <motion.span
                                                className="text-[#03706E] font-bold text-lg"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.6 + index * 0.05,
                                                }}
                                            >
                                                ✓
                                            </motion.span>
                                            <span>{text}</span>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </CollapsibleContent>
                        </motion.div>
                    </Collapsible>
                </motion.div>

                {/* WeekList */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: 0.8,
                        ease: 'anticipate',
                    }}
                >
                    <WeekList weeks={transformedWeeks} enrolled={data.enrolled} />
                </motion.div>
            </motion.main>
        </>
    );
}
