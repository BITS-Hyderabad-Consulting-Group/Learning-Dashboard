"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CourseCard } from "@/components/CourseCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import userProfile from "@/app/profile/APIdata.json";
import { CameraIcon } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const user = userProfile;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
       <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          {/* Header Bar */}
          <div className="bg-teal-800 text-white py-3 px-6 rounded-t-lg">
            <h1 className="text-lg font-semibold">Header</h1>
          </div>
          
          {/* Profile Section */}
          <div className="bg-white border-2 border-teal-800 py-6 px-6 rounded-b-lg">
            <div className="flex items-center gap-4">
              {/* Profile Picture */}
              <motion.div
                className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800 mb-1">Your Profile</h1>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">{user.name}</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-blue-500">📧</span>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Top Row - Leaderboard and Streak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <motion.div
              className="bg-[#B4DEDD] rounded-lg p-6"
              variants={itemVariants}
            >
              <h3 className="text-lg font-bold text-teal-800 mb-4">Leaderboard</h3>
              <div className="space-y-3">
                {user.leaderboard.slice(0, 3).map((person) => (
                  <motion.div
                    key={person.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      person.name === user.name 
                        ? 'bg-teal-300 bg-opacity-70' 
                        : 'bg-white bg-opacity-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{person.initials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-teal-800">{person.name}</div>
                      <div className="text-xs text-teal-600">{person.xp} XP</div>
                    </div>
                    <div className="text-sm font-bold text-teal-700">#{person.rank}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Learning Streak */}
            <motion.div
              className="bg-[#B4DEDD] rounded-lg p-6"
              variants={itemVariants}
            >
              <h3 className="text-lg font-bold text-teal-800 mb-4">Learning Streak</h3>
              <div className="flex flex-col mb-4">
                <div className="flex justify-center gap-2">
                  {[...Array(3)].map((_, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`text-4xl ${index < Math.min(user.learningStreak.currentStreak, 3) ? 'text-yellow-400' : 'text-teal-600'}`}>
                        {index === 0 ? '⭐' : '★'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="text-center flex flex-col">
                <div className="text-sm text-teal-700">
                  Current streak: <span className="font-bold">{user.learningStreak.currentStreak} days</span>
                </div>
              </div>
              
              {/* Stats Section */}
              <div className="mt-6 space-y-3 flex flex-col">
                <div className="text-center">
                  <span className="font-semibold text-teal-800 block text-sm">Highest streaks:</span>
                  <div className="text-2xl font-bold text-teal-700">{user.stats.highestStreaks}</div>
                </div>
                
                <div className="text-center">
                  <span className="font-semibold text-teal-800 block text-sm">Highest rank:</span>
                  <div className="text-2xl font-bold text-teal-700">#{user.stats.highestRank}</div>
                </div>
                
                <div className="text-center">
                  <span className="font-semibold text-teal-800 block text-sm">Courses completed:</span>
                  <div className="text-2xl font-bold text-teal-700">{user.stats.coursesCompleted}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row - Courses Carousel */}
          <motion.div
            className="bg-[#B4DEDD] rounded-lg p-6"
            variants={itemVariants}
          >
            <h3 className="text-lg font-bold text-teal-800 mb-6">Courses Enrolled</h3>
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent className="-ml-2 md:-ml-4">
                {user.courses.map((course) => (
                  <CarouselItem key={course.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
