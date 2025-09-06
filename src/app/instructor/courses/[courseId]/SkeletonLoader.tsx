'use-client';

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { BookOpen, Layers, Star } from 'lucide-react';

export default function CourseUpsertPageSkeleton() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white to-teal-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <Card className="w-full max-w-7xl rounded-2xl p-4 sm:p-8 shadow-xl border border-gray-100">
                <CardHeader>
                    {/* Title Skeleton */}
                    <div className="h-9 w-48 bg-gray-300 rounded-md mx-auto mb-2"></div>
                    {/* Subtitle Skeleton */}
                    <div className="h-5 w-64 bg-gray-200 rounded-md mx-auto"></div>
                </CardHeader>

                <CardContent className="space-y-10 mt-4">
                    {/* General Information Section Skeleton */}
                    <section>
                        <h2 className="text-lg font-semibold text-teal-700/50 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <div className="h-6 w-40 bg-gray-300 rounded-md"></div>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Course Name Input Skeleton */}
                            <div>
                                <div className="h-5 w-24 bg-gray-200 rounded-md mb-2"></div>
                                <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
                            </div>
                            {/* Domain Input Skeleton */}
                            <div>
                                <div className="h-5 w-16 bg-gray-200 rounded-md mb-2"></div>
                                <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
                            </div>
                            {/* Description Textarea Skeleton */}
                            <div className="sm:col-span-2">
                                <div className="h-5 w-24 bg-gray-200 rounded-md mb-2"></div>
                                <div className="h-24 w-full bg-gray-300 rounded-lg"></div>
                            </div>
                        </div>
                    </section>

                    {/* Details Section Skeleton */}
                    <section>
                        <h2 className="text-lg font-semibold text-teal-700/50 mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-gray-400" />
                            <div className="h-6 w-20 bg-gray-300 rounded-md"></div>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Status Select Skeleton */}
                            <div>
                                <div className="h-5 w-16 bg-gray-200 rounded-md mb-2"></div>
                                <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
                            </div>
                            {/* Badge Name Input Skeleton */}
                            <div className="sm:col-span-2">
                                <div className="h-5 w-24 bg-gray-200 rounded-md mb-2"></div>
                                <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
                            </div>
                        </div>
                    </section>

                    {/* Curriculum Section Skeleton (simulates edit mode) */}
                    <section>
                        <h2 className="text-lg font-semibold text-teal-700/50 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-gray-400" />
                            <div className="h-6 w-28 bg-gray-300 rounded-md"></div>
                        </h2>
                        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 space-y-4">
                            <div className="h-5 w-3/4 bg-gray-300 rounded-md"></div>
                            <div className="h-5 w-1/2 bg-gray-300 rounded-md"></div>
                            <div className="h-5 w-2/3 bg-gray-300 rounded-md"></div>
                        </div>
                    </section>
                </CardContent>

                {/* Link and Footer Skeleton */}
                <div className="mt-4 mb-4 h-5 w-48 bg-gray-200 rounded-md mx-auto"></div>
                <CardFooter className="flex flex-col items-center">
                    <div className="h-12 w-full bg-gray-300 rounded-xl"></div>
                </CardFooter>
            </Card>
        </div>
    );
}
