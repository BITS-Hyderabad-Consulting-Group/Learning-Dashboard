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

function chunk<T>(array: T[], size: number): T[][] {
    if (!array.length) return [];
    const head = array.slice(0, size);
    const tail = array.slice(size);
    return [head, ...chunk(tail, size)];
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
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#007975] text-white px-5 py-3 text-2xl sm:text-3xl">
                                    <Zap size={24} className="flex-shrink-0" />
                                </span>
                                <span className="pr-6">
                                    <span className="text-[#007975]">Welcome</span> to BITS
                                    Hyderabad Consulting Group
                                </span>
                            </h1>
                        </div>
                    </div>
                    <p className="mt-8 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
                        Empowering future consultants and tech leaders through comprehensive
                        learning programs in
                        <br />
                        technology and business consulting.
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-500">
                        End-End Non Tech Expertise
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
                            <section>
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
                                <Carousel
                                    opts={{
                                        align: 'start',
                                        loop: APIData.coursesPage.continueLearning.length > 3,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-8">
                                        {APIData.coursesPage.continueLearning.map((course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-8 md:basis-1/2 lg:basis-1/3"
                                            >
                                                <CourseCard {...course} showProgress={true} />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                    <CarouselNext className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                </Carousel>
                            </section>

                            <section>
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
                                        loop: APIData.coursesPage.recommended.length > 3,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-8">
                                        {APIData.coursesPage.recommended.map((course) => (
                                            <CarouselItem
                                                key={course.id}
                                                className="pl-8 md:basis-1/2 lg:basis-1/3"
                                            >
                                                <CourseCard {...course} showProgress={false} />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                    <CarouselNext className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                </Carousel>
                            </section>
                        </>
                    ) : (
                        <section>
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
                                <CarouselContent className="-ml-4">
                                    {chunk(APIData.coursesPage.recommended, 6).map(
                                        (chunk, index) => (
                                            <CarouselItem key={index} className="pl-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {chunk.map((course) => (
                                                        <CourseCard
                                                            key={course.id}
                                                            {...course}
                                                            showProgress={false}
                                                        />
                                                    ))}
                                                </div>
                                            </CarouselItem>
                                        )
                                    )}
                                </CarouselContent>
                                <CarouselPrevious className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                                <CarouselNext className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                            </Carousel>
                        </section>
                    )}
                </div>

                <FaqSection />
            </div>
        </div>
    );
}
