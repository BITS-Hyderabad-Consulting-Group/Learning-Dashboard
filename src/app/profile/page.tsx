'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/CourseCard';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import userProfile from '@/app/profile/APIdata.json';


export default function ProfilePage() {
    const router = useRouter();
    const user = userProfile;

    // Separate current and completed courses
    const currentCourses = user.courses.filter((course) => course.progress < 100);
    const completedCourses = user.courses.filter((course) => course.progress >= 100);

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
            {/* Combined Header + Profile Card */}
            <motion.div
                className="max-w-4xl mx-auto mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-teal-800"
                    variants={itemVariants}
                >
                    {/* Header Bar */}
                    <div className="bg-teal-800 text-white py-4 px-6">
                        <h1 className="text-xl font-semibold">Your Profile</h1>
                    </div>

                    {/* Profile Info Section */}
                    <div className="py-8 px-6">
                        <div className="flex items-center gap-6">
                            {/* Profile Picture */}
                            <motion.div
                                className="w-24 h-24 bg-cyan-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">
                                        {user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Profile Details */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    {user.name}
                                </h2>
                                <div className="space-y-2">
                                    {/* Role - Added here */}
                                    {user.role && (
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <span>💼</span>
                                            <span className="font-medium">{user.role}</span>
                                        </p>
                                    )}
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <span>📧</span>
                                        <span>{user.email}</span>
                                    </p>
                                    <p className="text-gray-400 flex items-center gap-2">
                                        <span>🗓️</span>
                                        <span>{user.joined}</span>
                                    </p>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="font-semibold">{user.xp} XP</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section - Added below the existing flex container */}
                        {user.bio && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 mt-1">📝</span>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                            Bio
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {user.bio}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Main Content Area - Full Width, Not Restricted by Header */}
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
                                        {currentCourses.map((course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2"
                                            >
                                                <CourseCard
                                                    id={course.id.toString()}
                                                    name={course.name}
                                                    duration={course.currentWeek}
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
                                        {completedCourses.map((course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2"
                                            >
                                                <CourseCard
                                                    id={course.id.toString()}
                                                    name={course.name}
                                                    duration={course.currentWeek}
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
                                {user.leaderboard.map((person) => (
                                    <div
                                        key={person.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${
                                            person.name === user.name
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
