import React from 'react';

const InstructorDashboardSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Header Section */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="space-y-2">
                    <div className="w-80 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
                    <div className="w-48 h-5 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="w-40 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>

            {/* Stats Cards Section */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border p-6 space-y-2">
                        <div className="w-24 h-5 bg-gray-300 rounded animate-pulse"></div>
                        <div className="w-12 h-8 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                ))}
            </section>

            {/* Recent Courses Section */}
            <section className="space-y-6">
                <div className="w-48 h-8 bg-gray-300 rounded-lg animate-pulse"></div>

                {/* Admin Course Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="px-2 py-4">
                            <div className="w-full max-w-md min-w-xs bg-white rounded-lg shadow-lg border-t-[12px] border-x-0 border-b-0 border-teal-800">
                                {/* Header */}
                                <div className="flex flex-row items-center justify-between gap-4 p-6 pb-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="w-48 h-6 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                    <div className="shrink-0">
                                        <div className="w-10 h-10 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="px-6 pb-2">
                                    <div className="flex items-center justify-start space-x-4 text-sm pt-4">
                                        <div className="flex flex-col space-y-1">
                                            <div className="w-20 h-3 bg-gray-300 rounded animate-pulse"></div>
                                            <div className="w-8 h-4 bg-gray-300 rounded animate-pulse"></div>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <div className="w-12 h-3 bg-gray-300 rounded animate-pulse"></div>
                                            <div className="w-16 h-5 bg-gray-300 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 p-6 pt-2">
                                    <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
                                        <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
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

export default InstructorDashboardSkeleton;
