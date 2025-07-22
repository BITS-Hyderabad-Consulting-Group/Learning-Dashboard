'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { format } from 'date-fns';
import WeekList from '@/components/WeekList';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [completedModules, setCompletedModules] = useState<string[]>([]);
    const { user, loading: userLoading } = useUser();

    const fetchCourseData = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/api/courses/${courseId}`;
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
            setCompletedModules(courseData.completedModules || []);
        } catch (error) {
            setData({
                title: 'Course Not Found',
                description:
                    'Unable to load course data. Please check your connection and try again.',
                modulesCount: 0,
                totalDuration: 0,
                modulesCompleted: 0,
                weeksCompleted: 0,
                updatedAt: new Date(),
                markedForReview: 0,
                weeks: [],
            });
            setEnrolled(false);
            setActiveLearners(null);
            setCompletedModules([]);
        } finally {
            setLoading(false);
        }
    }, [courseId, user]);

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
            const res = await fetch(`/api/courses/${courseId}`, {
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

    const handleModuleClick = (moduleUrl: string) => {
        if (!enrolled) {
            toast.error('Please enroll in the course to access modules');
            return;
        }

        // Handle module navigation here
        console.log('Opening module:', moduleUrl);
        // Example: router.push(moduleUrl) or window.open(moduleUrl)

        // Mark module as completed (you might want to call an API here)
        if (!completedModules.includes(moduleUrl)) {
            setCompletedModules((prev) => [...prev, moduleUrl]);
        }
    };

    if (loading || !data || userLoading) {
        return (
            <main className="max-w-6xl mx-auto p-4">
                <motion.div
                    className="flex items-center justify-center h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        className="text-lg text-gray-600"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        Loading course data...
                    </motion.div>
                </motion.div>
            </main>
        );
    }

    return (
        <>
            <motion.main
                className="max-w-6xl mx-auto p-4"
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
                    <motion.div
                        className="flex-1 bg-[#B4DEDD] rounded-lg shadow-md p-6 flex flex-col gap-3 h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="flex items-center gap-3 justify-between w-full"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <motion.span
                                className="bg-[#007C6A] text-white px-3 py-1.5 rounded-md text-xl font-bold w-fit"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                {data.title}
                            </motion.span>
                            <AnimatePresence>
                                {!enrolled && user && (
                                    <motion.button
                                        className="bg-[#007C6A] text-white font-bold px-5 py-1.5 rounded-md shadow-md hover:bg-[#005F5F] transition-all duration-200 text-base whitespace-nowrap"
                                        onClick={handleEnrol}
                                        disabled={enrolLoading}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.span
                                            animate={enrolLoading ? { rotate: 360 } : { rotate: 0 }}
                                            transition={{
                                                duration: 1,
                                                repeat: enrolLoading ? Infinity : 0,
                                                ease: 'linear',
                                            }}
                                        >
                                            {enrolLoading ? 'Enrolling...' : 'Enrol'}
                                        </motion.span>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <motion.p
                            className="text-base font-medium text-[#333] leading-relaxed"
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
                                    label: 'Last updated:',
                                    value: data.updatedAt
                                        ? (() => {
                                              const dateObj =
                                                  typeof data.updatedAt === 'string'
                                                      ? new Date(data.updatedAt)
                                                      : data.updatedAt;
                                              return isNaN(dateObj.getTime())
                                                  ? 'N/A'
                                                  : format(dateObj, 'dd MMMM, yyyy');
                                          })()
                                        : 'N/A',
                                },
                                { label: 'Language:', value: 'English' },
                                {
                                    label: 'Active learners:',
                                    value:
                                        activeLearners !== null && activeLearners !== undefined
                                            ? activeLearners
                                            : 0,
                                },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-center gap-2 bg-white/20 rounded-md px-3 py-2 shadow-sm"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                                    whileHover={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                        transition: { duration: 0.2 },
                                    }}
                                >
                                    <span className="font-semibold text-[#007C6A] min-w-28">
                                        {item.label}
                                    </span>
                                    <motion.span
                                        className="bg-white/50 px-2 py-1 rounded-full"
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
                    </motion.div>

                    {/* Right: Outcomes */}
                    <motion.div
                        className="flex flex-row items-center gap-4 w-full md:w-auto"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <motion.div
                            className="flex-1 md:w-[500px] bg-white rounded-lg shadow-md border border-[#B4DEDD] p-6 flex flex-col gap-3 h-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <motion.h2
                                className="text-2xl font-bold text-[#222] mb-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                            >
                                Learning Objectives
                            </motion.h2>
                            <motion.ul
                                className="flex flex-col gap-y-2 list-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                {[
                                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                                    'Curabitur ac leo nunc. Vestibulum et mauris vel ante.',
                                    'Praesent ut ligula non mi varius sagittis.',
                                    'Morbi nec metus. Donec id justo.',
                                    'Nullam dictum felis eu pede mollis pretium.',
                                    'Etiam imperdiet imperdiet orci. Nunc nec neque.',
                                ].map((text, index) => (
                                    <motion.li
                                        key={index}
                                        className="flex items-start gap-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.6 + index * 0.05,
                                        }}
                                    >
                                        <motion.span
                                            className="text-[#007C6A] font-bold text-lg"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: 0.6 + index * 0.05,
                                            }}
                                        >
                                            &#10003;
                                        </motion.span>
                                        <span>{text}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                    </motion.div>
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
                    <WeekList
                        weeks={data.weeks.map((week) => ({
                            ...week,
                            modules: week.modules.map((module) => ({
                                ...module,
                                type:
                                    module.type === 'video'
                                        ? 'Video'
                                        : module.type === 'article'
                                        ? 'Article'
                                        : 'Evaluative',
                                completed: completedModules.includes(module.id || ''),
                                markedForReview: module.markedForReview || false,
                            })),
                        }))}
                        enrolled={enrolled}
                    />
                </motion.div>
            </motion.main>
        </>
    );
}
