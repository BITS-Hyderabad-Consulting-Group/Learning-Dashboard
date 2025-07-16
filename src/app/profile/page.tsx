"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import userProfile from "@/app/profile/APIdata.json";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<typeof userProfile | null>(null);

  useEffect(() => {
    // Simulate auth check
    const isLoggedIn = true; // Replace with real auth logic
    if (!isLoggedIn) {
      router.push("/"); // Redirect if not logged in
    } else {
      setUser(userProfile); // Use imported JSON data directly
    }
  }, [router]);

  if (!user) return (
    <div className="min-h-screen bg-teal-800 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

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
    <div className="min-h-screen py-8 px-4">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <div className="bg-teal-800 outline-2 outline-teal-800 text-white py-2 px-4 rounded-t-lg">
            Header
          </div>
          <div className="bg-white outline-teal-800 outline-2 py-4 px-6 rounded-b-lg">
            <h1 className="text-2xl font-bold text-teal-800 mb-2">Your Profile</h1>
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-600 flex items-center justify-center gap-2 mt-2">
              <span>📧</span>
              {user.email}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <motion.div
            className="bg-teal-200 rounded-lg p-6"
            variants={itemVariants}
          >
            <div className="space-y-4">
              <div className="border-b border-teal-300 pb-2">
                <span className="font-semibold text-teal-800">Highest number of streaks:</span>
                <div className="text-2xl font-bold text-teal-700">{user.stats.highestStreaks}</div>
              </div>
              <div className="border-b border-teal-300 pb-2">
                <span className="font-semibold text-teal-800">Highest rank:</span>
                <div className="text-2xl font-bold text-teal-700">#{user.stats.highestRank}</div>
              </div>
              <div>
                <span className="font-semibold text-teal-800">Number of courses completed:</span>
                <div className="text-2xl font-bold text-teal-700">{user.stats.coursesCompleted}</div>
              </div>
            </div>
          </motion.div>

          {/* Courses Enrolled */}
          <motion.div
            className="bg-teal-200 rounded-lg p-6"
            variants={itemVariants}
          >
            <h3 className="text-lg font-bold text-teal-800 mb-4">Courses Enrolled</h3>
            <div className="space-y-4">
              {user.courses.map((course) => (
                <motion.div
                  key={course.id}
                  className="bg-white bg-opacity-50 rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-teal-800">{course.name}</h4>
                    <span className="text-sm font-bold text-teal-600">{course.progress}%</span>
                  </div>
                  <p className="text-sm text-teal-700 mb-2">{course.currentWeek}</p>
                  <div className="text-xs text-teal-600">
                    {course.modulesCompleted}/{course.totalModules} modules completed
                  </div>
                  <div className="w-full bg-teal-100 rounded-full h-2 mt-2">
                    <motion.div
                      className="bg-teal-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Learning Streak & Leaderboard */}
          <div className="space-y-6">
            {/* Learning Streak */}
            <motion.div
              className="bg-teal-200 rounded-lg p-6"
              variants={itemVariants}
            >
              <h3 className="text-lg font-bold text-teal-800 mb-4">Learning Streak</h3>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-2">
                  {[...Array(3)].map((_, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`text-3xl ${index < user.learningStreak.currentStreak ? 'text-teal-600' : 'text-gray-400'}`}>
                        {index === 0 ? '⭐' : '★'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="text-sm text-teal-700">
                  Current streak: <span className="font-bold">{user.learningStreak.currentStreak} days</span>
                </div>
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              className="bg-teal-200 rounded-lg p-6"
              variants={itemVariants}
            >
              <h3 className="text-lg font-bold text-teal-800 mb-4">Leaderboard</h3>
              <div className="space-y-3">
                {user.leaderboard.slice(0, 3).map((person, index) => (
                  <motion.div
                    key={person.id}
                    className={`flex items-center gap-3 p-2 rounded ${
                      person.name === user.name ? 'bg-teal-300' : 'bg-white bg-opacity-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{person.initials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-teal-800">{person.name}</div>
                    </div>
                    <div className="text-xs text-teal-600">#{person.rank}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
