import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import React from 'react';

const SkeletonLoader = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="container mx-auto space-y-6 pt-6 pb-2">
                <div className="w-80 h-10 bg-gray-300 rounded-lg animate-pulse mb-4"></div>
                <div className="w-48 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Continue Learning Section Skeleton */}
            <section className="container mx-auto">
                <div className="w-48 h-8 bg-gray-300 rounded-lg animate-pulse mb-6"></div>

                {/* Course Cards Carousel Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 -mx-2">
                    {[...Array(3)].map((_, i) => (
                        <CourseCardSkeleton progress={true} key={i} />
                    ))}
                </div>
            </section>

            {/* Available Courses Section Skeleton */}
            <section className="container mx-auto py-8">
                <div className="w-40 h-8 bg-gray-300 rounded-lg animate-pulse mb-6"></div>

                {/* Search and Filter Skeleton */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="w-full max-w-xs">
                        <div className="w-full h-10 bg-gray-300 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="w-full max-w-xs">
                        <div className="w-full h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                {/* Course Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 -mx-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-2">
                            <div className="w-full bg-white rounded-lg shadow-lg border-t-[12px] border-teal-800 border-x-0 border-b-0">
                                <div className="flex flex-row items-center justify-between gap-4 p-6 pb-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="w-48 h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                                    </div>
                                </div>
                                <div className="px-6 pb-2">
                                    <div className="flex items-center justify-start space-x-3">
                                        <div className="flex items-center space-x-1.5">
                                            <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center space-x-1.5"></div>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 flex flex-col items-start space-y-1">
                                    <div className="flex w-full justify-between">
                                        <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SkeletonLoader;
