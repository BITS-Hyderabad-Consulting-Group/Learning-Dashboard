'use client';

export default function CoursePageSkeleton() {
    return (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
            {/* Top Section Skeleton */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch">
                {/* Left Card: Course Info Skeleton */}
                <div className="flex-1 bg-gray-200 rounded-lg p-6">
                    {/* Title */}
                    <div className="h-9 w-3/4 bg-gray-400 rounded-md"></div>
                    {/* Description */}
                    <div className="h-5 w-full bg-gray-300 rounded-md mt-4"></div>
                    <div className="h-5 w-full bg-gray-300 rounded-md mt-2"></div>
                    <div className="h-5 w-5/6 bg-gray-300 rounded-md mt-2"></div>
                    {/* Info items */}
                    <div className="space-y-3 mt-6">
                        <div className="h-10 w-full bg-gray-300 rounded-md"></div>
                        <div className="h-10 w-full bg-gray-300 rounded-md"></div>
                        <div className="h-10 w-full bg-gray-300 rounded-md"></div>
                    </div>
                </div>

                {/* Right Card: Learning Objectives Skeleton */}
                <div className="w-full md:w-[500px] bg-white rounded-lg border border-gray-200 p-6">
                    {/* Title */}
                    <div className="h-8 w-1/2 bg-gray-300 rounded-md mb-6"></div>
                    {/* List items */}
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                                <div className="h-5 flex-1 bg-gray-300 rounded-md"></div>
                            </div>
                        ))}
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                            <div className="h-5 w-4/5 bg-gray-300 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WeekList Section Skeleton */}
            <div>
                {/* Simulate 3 week accordions */}
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4"
                    >
                        <div className="flex items-center justify-between p-6">
                            <div className="flex-1 space-y-2">
                                <div className="h-7 w-3/4 bg-gray-400 rounded-md"></div>
                            </div>
                            <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
