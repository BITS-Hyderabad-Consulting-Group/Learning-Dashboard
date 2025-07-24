'use client';
import { TooltipWrapper } from '@/components/ToolTipWrapper';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Briefcase, Mail, Calendar, Star, FileText, UserRound } from 'lucide-react';
import { EnrolledCourse as Course } from '@/types/course';
import { useUser } from '@/context/UserContext';
import ProfilePageSkeleton from './ProfileSkeleton';
import CourseCarousel from '@/components/CourseCarousel';
// import Image from 'next/image';

export default function ProfilePage() {
    const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
    const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
    const { profile } = useUser();

    useEffect(() => {
        const fetchUserCourses = async () => {
            setCoursesLoading(true);

            try {
                const response = await fetch(`/api/profile/${profile?.id}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch courses');
                }

                const data = await response.json();
                setCurrentCourses(data.currentCourses);
                setCompletedCourses(data.completedCourses);
            } catch (err: unknown) {
                console.error('Fetch error:', err);
            } finally {
                setCoursesLoading(false);
            }
        };

        if (profile?.id) {
            fetchUserCourses();
        }
    }, [profile?.id]);

    // ✅ 3. Combined loading state check
    // We show the skeleton if the profile is loading OR if the courses are loading.
    if (!profile || coursesLoading) {
        return <ProfilePageSkeleton />;
    }

    // type LeaderboardEntry = {
    //     id: string;
    //     name: string;
    //     initials: string;
    //     xp: number;
    //     rank: number;
    // };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1,
            },
        },
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3 },
        },
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Combined Header + Profile Card - Responsive Width */}
            <motion.div
                className="w-full max-w-7xl mx-auto mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-teal-800"
                    variants={itemVariants}
                >
                    {/* Header Bar */}
                    <div className="bg-teal-800 text-white py-4 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-lg sm:text-xl font-semibold">Your Profile</h1>
                    </div>

                    {/* Profile Info Section - Responsive Layout */}
                    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
                        {/* Main Profile Content - Responsive Flex */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                            {/* Left Side - Profile Picture and Basic Info */}
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                                {/* Profile Picture - Responsive Size */}
                                <motion.div
                                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {/* {profile.photo_url ? (
                                        <Image
                                            src={profile.photo_url?.split('=')[0]}
                                            alt="Profile Photo"
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                            width={300}
                                            height={300}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
                                            <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                                                {profile?.full_name
                                                    ?.split(' ')
                                                    .map((n: string) => n[0])
                                                    .join('')}
                                            </span>
                                        </div>
                                    )} */}
                                </motion.div>

                                {/* Name and Primary Info */}
                                <div className="text-left flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                                        {profile.full_name
                                            ?.toLowerCase()
                                            .split(' ')
                                            .map(
                                                (word: string) =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                            )
                                            .join(' ')}
                                    </h2>
                                    <p className="text-gray-600 text-sm sm:text-base mb-2">
                                        <TooltipWrapper label="User ID">
                                            <UserRound className="w-4 h-4 text-gray-500 inline-block" />
                                        </TooltipWrapper>
                                        <span className="text-sm p-2 sm:text-base">
                                            {profile.id}
                                        </span>
                                    </p>

                                    {/* Responsive Grid Layout */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 lg:gap-x-12 gap-y-2 text-left">
                                        {/* Role */}
                                        {profile.role && (
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <TooltipWrapper label="Role">
                                                    <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                </TooltipWrapper>
                                                <span className="font-medium text-sm sm:text-base">
                                                    {profile.role.charAt(0).toUpperCase() +
                                                        profile.role.slice(1)}
                                                </span>
                                            </p>
                                        )}

                                        {/* XP */}
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <TooltipWrapper label="Experience Points">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                            </TooltipWrapper>
                                            <span className="font-semibold text-sm sm:text-base">
                                                {profile.xp} XP
                                            </span>
                                        </p>

                                        {/* Email */}
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <TooltipWrapper label="Email">
                                                <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                            </TooltipWrapper>
                                            <span className="text-sm sm:text-base truncate">
                                                {profile.email}
                                            </span>
                                        </p>

                                        {/* Joined Date */}
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <TooltipWrapper label="Join Date">
                                                <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                            </TooltipWrapper>
                                            <span className="text-sm sm:text-base">
                                                Member since{' '}
                                                {new Date(profile.created_at).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        year: 'numeric',
                                                        month: 'long',
                                                    }
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Stats Card - Responsive Positioning */}
                            <div className="flex justify-center lg:flex-col lg:items-end">
                                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200 w-full max-w-xs lg:max-w-none lg:w-auto">
                                    <div className="text-center lg:text-right">
                                        <div className="text-2xl sm:text-3xl font-bold text-teal-800">
                                            {profile.xp}
                                        </div>
                                        <div className="text-sm text-center text-teal-600">
                                            Total XP
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section - Full Width, Responsive */}
                        {profile.biodata && (
                            <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-base font-semibold text-gray-700 mb-2">
                                            About
                                        </h4>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                            {profile.biodata}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Main Content Area - Same Width as Header */}
            <motion.div
                className="max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* Left Column - Current and Completed Courses (Stacked Vertically) */}
                    <div className="lg:col-span-3 space-y-6 h-full">
                        {/* Current Courses Section */}
                        {currentCourses.length > 0 && (
                            <motion.div
                                className="bg-[#B4DEDD] min-h-[15rem] rounded-lg p-6"
                                variants={itemVariants}
                            >
                                <h3 className="text-lg font-bold text-teal-800 mb-2">
                                    Current Courses
                                </h3>
                                <CourseCarousel
                                    courses={currentCourses}
                                    basis="1/3"
                                    enrolled={true}
                                />
                            </motion.div>
                        )}

                        {/* Completed Courses Section */}
                        {completedCourses.length > 0 && (
                            <motion.div
                                className="bg-[#B4DEDD] min-h-[15rem] rounded-lg p-6"
                                variants={itemVariants}
                            >
                                <h3 className="text-lg font-bold text-teal-800 mb-2">
                                    Completed Courses
                                </h3>
                                <CourseCarousel
                                    courses={completedCourses}
                                    basis="1/3"
                                    enrolled={true}
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Leaderboard (Single Box) */}
                    {/* <motion.div
                        className="bg-[#B4DEDD] rounded-lg p-6 h-full flex flex-col"
                        variants={itemVariants}
                    >
                        <h3 className="text-lg font-bold text-teal-800 mb-4">Leaderboard</h3>
                        <div
                            className="flex-1 overflow-y-scroll pr-2 scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-teal-200"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#0f766e #b2dfdb',
                            }}
                        >
                            <div className="space-y-3">
                                {profile.leaderboard?.map((person: LeaderboardEntry) => (
                                    <div
                                        key={person.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${
                                            person.name === profile.full_name
                                                ? 'bg-teal-300 bg-opacity-70'
                                                : 'bg-white bg-opacity-50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-sm font-bold">
                                                {person.initials}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-teal-800 truncate">
                                                {person.name}
                                            </div>
                                            <div className="text-xs text-teal-600">
                                                {person.xp} XP
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-teal-700 flex-shrink-0">
                                            #{person.rank}
                                        </div>
                                    </div>
                                ))} 
                            </div>
                        </div>
                    </motion.div> */}
                </div>
            </motion.div>
        </div>
    );
}
