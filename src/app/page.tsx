'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap } from 'lucide-react';
import { CourseCard } from '@/components/CourseCard';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Scroller } from '@/components/Scroller';
import { FaqSection } from '@/components/FaqSection';
import { motion } from 'framer-motion';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import { AvailableCourse } from '@/types/course';

interface ApiResponse {
    enrolledCourses: Array<{
        id: string;
        title: string;
        modules: number;
        duration: string;
        progress: number;
    }>;
    availableCourses: AvailableCourse[];
}

function chunk<T>(array: T[], size: number): T[][] {
    if (!array.length) return [];
    const head = array.slice(0, size);
    const tail = array.slice(size);
    return [head, ...chunk(tail, size)];
}

//is mobile check
function isMobile() {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
}

export default function HomePage() {
    const [featuredCourses, setFeaturedCourses] = useState<AvailableCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/learning');
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const data: ApiResponse = await response.json();
                // Get first 6 available courses for featured section
                setFeaturedCourses(data.availableCourses.slice(0, 6));
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="py-16 sm:py-24 relative text-center flex flex-col items-center">
                    <div className="relative inline-block">
                        <div className="absolute -top-2 -left-4 transform -rotate-12">
                            <Image
                                src="/sparkle.png"
                                alt=""
                                width={39}
                                height={43}
                                className="w-6 h-6"
                            />
                        </div>
                        <div className="relative inline-flex items-center rounded-full bg-[#bde4e2] p-2">
                            <h1 className="flex items-center gap-4 text-3xl sm:text-4xl font-bold tracking-tight text-[#0f3433]">
                                {isMobile() || (
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.05, rotate: 1 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className="inline-flex items-center gap-2 rounded-full bg-[#007975] text-white px-5 py-3 text-2xl sm:text-3xl shadow-md"
                                    >
                                        <Zap size={24} className="flex-shrink-0" />
                                    </motion.span>
                                )}
                                {isMobile() ? (
                                    <span className="p-6 select-none">
                                        <span className="text-[#007975]">Learning Dashboard</span>
                                        <br />
                                        by BHCG
                                    </span>
                                ) : (
                                    <span className="pr-6 select-none">
                                        <span className="text-[#007975]">Learning Dashboard</span>{' '}
                                        by BHCG
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                    <p className="mt-8 select-none max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
                        Empowering future consultants, product leaders, analysts, and technologists
                        through comprehensive learning in business, data, and technology.
                    </p>
                    <div className="mt-8">
                        <Link href="/(student)/courses">
                            <span className="inline-block bg-[#007975] text-white font-semibold rounded-full px-8 py-3 hover:bg-[#005f5c] transition-colors duration-300 shadow-md">
                                Explore Courses
                            </span>
                        </Link>
                    </div>
                </section>
                <Scroller />
                <div className="space-y-20 my-24">
                    <section className="w-full">
                        <div className="flex justify-between items-baseline mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Featured Courses</h2>
                            <Link href="/courses/featured">
                                <span className="text-sm font-semibold text-teal-800 hover:underline">
                                    See all
                                </span>
                            </Link>
                        </div>
                        <div className="px-10">
                            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                                <CarouselContent>
                                    {loading
                                        ? Array.from({ length: 3 }).map((_, index) => (
                                              <CarouselItem
                                                  key={`skeleton-${index}`}
                                                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                                              >
                                                  <CourseCardSkeleton />
                                              </CarouselItem>
                                          ))
                                        : featuredCourses.map((course) => (
                                              <CarouselItem
                                                  key={course.id}
                                                  className="pl-4 basis-full lg:basis-1/3"
                                              >
                                                  <CourseCard
                                                      key={course.id}
                                                      id={course.id}
                                                      name={course.title}
                                                      modules={course.modules}
                                                      duration={course.duration}
                                                      progress={0}
                                                      showProgress={false}
                                                  />
                                              </CarouselItem>
                                          ))}
                                </CarouselContent>
                                <CarouselPrevious className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                <CarouselNext className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                            </Carousel>
                        </div>
                    </section>
                </div>
                <FaqSection />
            </div>
        </div>
    );
}
