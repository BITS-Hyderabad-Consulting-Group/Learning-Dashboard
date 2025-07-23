// components/ProfilePageSkeleton.tsx
import React from 'react';

const ProfilePageSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
            {/* Profile Card Skeleton */}
            <div className="w-full max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300">
                    {/* Header Bar */}
                    <div className="bg-gray-300 h-14 w-full"></div>

                    {/* Profile Info Section */}
                    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                            {/* Left Side */}
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full">
                                {/* Profile Picture */}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-300 rounded-full flex-shrink-0"></div>
                                {/* Name and Details */}
                                <div className="text-left flex-1 mt-2 w-full">
                                    <div className="h-8 w-1/2 bg-gray-300 rounded-md mb-4"></div>
                                    <div className="h-5 w-3/4 bg-gray-300 rounded-md mb-4"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <div className="h-5 w-32 bg-gray-300 rounded-md"></div>
                                        <div className="h-5 w-24 bg-gray-300 rounded-md"></div>
                                        <div className="h-5 w-48 bg-gray-300 rounded-md"></div>
                                        <div className="h-5 w-40 bg-gray-300 rounded-md"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Right Side - Stats Card */}
                            <div className="flex-shrink-0">
                                <div className="bg-gray-200 rounded-lg p-4 w-40 h-24">
                                    <div className="h-8 w-20 bg-gray-300 rounded-md mx-auto mb-2"></div>
                                    <div className="h-4 w-16 bg-gray-300 rounded-md mx-auto"></div>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="h-6 w-20 bg-gray-300 rounded-md mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-300 rounded-md"></div>
                                <div className="h-4 w-5/6 bg-gray-300 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Courses and Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Courses Section */}
                    <div className="bg-gray-200 min-h-[15rem] rounded-lg p-6">
                        <div className="h-7 w-40 bg-gray-300 rounded-md mb-6"></div>
                        <div className="flex gap-4">
                            <div className="bg-gray-100 p-4 rounded-lg shadow-md h-40 w-1/2"></div>
                            <div className="bg-gray-100 p-4 rounded-lg shadow-md h-40 w-1/2"></div>
                        </div>
                    </div>
                    {/* Completed Courses Section */}
                    <div className="bg-gray-200 min-h-[15rem] rounded-lg p-6">
                        <div className="h-7 w-48 bg-gray-300 rounded-md mb-6"></div>
                        <div className="flex gap-4">
                            <div className="bg-gray-100 p-4 rounded-lg shadow-md h-40 w-1/2"></div>
                        </div>
                    </div>
                </div>
                {/* Right Column: Leaderboard */}
                <div className="bg-gray-200 rounded-lg p-6 min-h-[31.5rem]">
                    <div className="h-7 w-32 bg-gray-300 rounded-md mb-4"></div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePageSkeleton;
