'use client';

import React from 'react';
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
import APIData from '@/app/APIdata.json';
import { Scroller } from '@/components/Scroller';
import { FaqSection } from '@/components/FaqSection';
import { motion } from 'framer-motion';

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
    const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="py-16 sm:py-24 relative text-center flex flex-col items-center">
                    {/* <div className="absolute top-0 right-0 pt-4 pr-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsUserLoggedIn((prev) => !prev)}
                        >
                            {isUserLoggedIn ? 'Simulate Log Out' : 'Simulate Log In'}
                        </Button>
                    </div> */}
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
                {!isUserLoggedIn && <Scroller />}
                <div className="space-y-20 my-24">
                    {isUserLoggedIn ? (
                        <>
                            <section className="w-full">
                                <div className="flex justify-between items-baseline mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Continue Learning
                                    </h2>
                                    <Link href="/courses/learning">
                                        <span className="text-sm font-semibold text-teal-800 hover:underline">
                                            See all
                                        </span>
                                    </Link>
                                </div>
                                {/* The Carousel component acts as the relative container for the absolute buttons */}
                                <Carousel
                                    opts={{
                                        align: 'start',
                                        loop: APIData.coursesPage.continueLearning.length > 4,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-8">
                                        {APIData.coursesPage.continueLearning.map((course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                                            >
                                                <CourseCard {...course} showProgress={true} />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {/* These buttons are now positioned absolutely relative to the Carousel container */}
                                    {/* The negative top margin pulls them up into the header space */}
                                    <CarouselPrevious className="absolute -top-[52px] right-12 text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                    <CarouselNext className="absolute -top-[52px] right-0 text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                </Carousel>
                            </section>

                            <section className="w-full">
                                <div className="flex justify-between items-baseline mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Recommended for you
                                    </h2>
                                    <Link href="/courses/recommended">
                                        <span className="text-sm font-semibold text-teal-800 hover:underline">
                                            See all
                                        </span>
                                    </Link>
                                </div>
                                <Carousel
                                    opts={{
                                        align: 'start',
                                        loop: APIData.coursesPage.recommended.length > 4,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-8">
                                        {APIData.coursesPage.recommended.map((course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                                            >
                                                <CourseCard {...course} showProgress={false} />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="absolute -top-[52px] right-12 text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                    <CarouselNext className="absolute -top-[52px] right-0 text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                </Carousel>
                            </section>
                        </>
                    ) : (
                        <section className="w-full">
                            <div className="flex justify-between items-baseline mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Featured Courses
                                </h2>
                                <Link href="/courses/featured">
                                    <span className="text-sm font-semibold text-teal-800 hover:underline">
                                        See all
                                    </span>
                                </Link>
                            </div>
                            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                                <CarouselContent className="">
                                    {APIData.coursesPage.recommended.map((course) => (
                                        <CarouselItem
                                            key={course.id}
                                            className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 "
                                        >
                                            <CourseCard {...course} showProgress={false} />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="absolute -top-[36px] left-60 md:left-268 text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                <CarouselNext className="absolute -top-[36px] right-16 text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                            </Carousel>
                        </section>
                    )}
                </div>
                <FaqSection />
            </div>
        </div>
    );
}
