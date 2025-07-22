'use client';
import { useRouter } from 'next/navigation';
import { motion, number } from 'framer-motion';
 import { supabase } from '@/lib/supabase-client';
import { CourseCard } from '@/components/CourseCard';
import { useState, useEffect } from 'react';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { Briefcase, Mail, Calendar, Star, FileText } from 'lucide-react';
import userProfile from '@/app/profile/APIdata.json';


export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    
    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                console.error('User not logged in or error fetching user:', error);
                return;
            }

            const userId = user.id;

            try {
                const res = await fetch(`/api/profile?id=${userId}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch profile from API');
                }
                const profileData = await res.json();
                setUser(profileData);
            } catch (fetchError) {
                console.error('Error fetching profile data:', fetchError);
            }
        };

        fetchUserProfile();
    }, []);



    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Loading your profile...
            </div>
        );
    }

    type Course = {
        id: number;
        name: string;
        currentWeek: number;
        totalModules: number;
        progress: number;
    };

    type LeaderboardEntry = {
        id: string;
        name: string;
        initials: string;
        xp: number;
        rank: number;
    };

    // Separate current and completed courses
    const currentCourses = user?.courses?.filter((course : Course) => (course.progress) < 100) || [];
    const completedCourses = user?.courses?.filter((course : Course) => course.progress >= 100) || [];

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
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            {/* Combined Header + Profile Card - Responsive Width */}
            <motion.div
                className="w-full max-w-7xl mx-auto mb-8 px-4"
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
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                                {/* Profile Picture - Responsive Size */}
                                <motion.div
                                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                    {user.photo_url ? (
                                        <img
                                        src={user.photo_url}
                                        alt="Profile Photo"
                                        className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
                                        <span className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">
                                            {user?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                                        </span>
                                        </div>
                                    )}
                                </motion.div>


                                {/* Name and Primary Info */}
                                <div className="text-center sm:text-left flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                                        {user.full_name}
                                    </h2>

                                    {/* Responsive Grid Layout */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                                        {/* Role */}
                                        {user.role && (
                                            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                                <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="font-medium text-sm sm:text-base">
                                                    {user.role}
                                                </span>
                                            </p>
                                        )}
                                        {/* XP */}
                                        <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                            <span className="font-semibold text-sm sm:text-base">
                                                {user.xp} XP
                                            </span>
                                        </p>
                                        {/* Email */}
                                        <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                            <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm sm:text-base truncate">
                                                {user.email}
                                            </span>
                                        </p>
                                        {/* Joined Date */}
                                        <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                            <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">
                                                Member since {new Date(user.created_at).toLocaleDateString()}
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
                                            {user.xp}
                                        </div>
                                        <div className="text-sm text-teal-600">Total XP</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section - Full Width, Responsive */}
                        {user.bio && (
                            <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-base font-semibold text-gray-700 mb-2">
                                            About
                                        </h4>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                            {user.bio}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Current and Completed Courses (Stacked Vertically) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Courses Section */}
                        <motion.div className="bg-[#B4DEDD] rounded-lg p-6" variants={itemVariants}>
                            <h3 className="text-lg font-bold text-teal-800 mb-6">
                                Current Courses
                            </h3>
                            {currentCourses.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {currentCourses?.map((course : Course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2"
                                            >
                                                <CourseCard
                                                    id={course.id.toString()}
                                                    name={course.name}
                                                    duration={course.currentWeek.toString()}
                                                    modules={course.totalModules}
                                                    progress={course.progress}
                                                    showProgress={true}
                                                />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            ) : (
                                <div className="text-center text-teal-600 py-8">
                                    <p>No current courses enrolled</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Completed Courses Section */}
                        <motion.div className="bg-[#B4DEDD] rounded-lg p-6" variants={itemVariants}>
                            <h3 className="text-lg font-bold text-teal-800 mb-6">
                                Completed Courses
                            </h3>
                            {completedCourses.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {completedCourses?.map((course : Course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2"
                                            >
                                                <CourseCard
                                                    id={course.id.toString()}
                                                    name={course.name}
                                                    duration={course.currentWeek.toString()}
                                                    modules={course.totalModules}
                                                    progress={course.progress}
                                                    showProgress={true}
                                                />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            ) : (
                                <div className="text-center text-teal-600 py-8">
                                    <p>No completed courses yet</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column - Leaderboard (Single Box) */}
                    <motion.div className="bg-[#B4DEDD] rounded-lg p-6" variants={itemVariants}>
                        <h3 className="text-lg font-bold text-teal-800 mb-4">Leaderboard</h3>
                        <div
                            className="h-[600px] overflow-y-scroll pr-2 scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-teal-200"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#0f766e #b2dfdb',
                            }}
                        >
                            <div className="space-y-3">
                                {user.leaderboard?.map((person : LeaderboardEntry) => (
                                    <div
                                        key={person.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${
                                            person.name === user.full_name
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
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
