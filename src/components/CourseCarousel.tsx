'use client';
import { useEffect, useState } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { CourseCard } from '@/components/CourseCard';
import SwipeIndicator from '@/components/SwipeIndicator';
import { EnrolledCourse as Course } from '@/types/course';
import CourseCardSkeleton from './CourseCardSkeleton';

interface CourseCarouselProps {
    enrolled: boolean;
    courses: Course[];
    loading?: boolean;
    basis?: string;
}

export default function CourseCarousel({
    enrolled = true,
    courses,
    loading = false,
    basis = '1/2',
}: CourseCarouselProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Carousel opts={{ align: 'start', loop: true }} className="w-full px-0 lg:px-8">
                <CarouselContent>
                    {loading
                        ? Array.from({ length: 3 }).map((_, index) => (
                              <CarouselItem
                                  key={`skeleton-${index}`}
                                  className={`pl-4 basis-full lg:basis-${basis}`}
                              >
                                  <CourseCardSkeleton />
                              </CarouselItem>
                          ))
                        : courses.map((course) => (
                              <CarouselItem
                                  key={course.id}
                                  className={`pl-4 basis-full ${
                                      basis === '1/3' ? 'lg:basis-1/3' : 'lg:basis-1/2'
                                  }`}
                              >
                                  <CourseCard
                                      id={course.id}
                                      name={course.title}
                                      modules={course.modules}
                                      duration={course.total_duration}
                                      progress={course.progress ?? 0}
                                      showProgress={enrolled}
                                  />
                              </CarouselItem>
                          ))}
                </CarouselContent>

                {!isMobile && (
                    <>
                        <CarouselPrevious className="ml-10 -mr-6 text-teal-1200 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                        <CarouselNext className="-ml-6 mr-10 text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                    </>
                )}
            </Carousel>

            {isMobile && <SwipeIndicator />}
        </>
    );
}
