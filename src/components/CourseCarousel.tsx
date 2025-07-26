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
import { EnrolledCourse as Course } from '@/types/course';
import CourseCardSkeleton from './CourseCardSkeleton';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import type { EmblaCarouselType } from 'embla-carousel';

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
    const emblaRef = useRef<EmblaCarouselType | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

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
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 2000,
                    }),
                ]}
                opts={{ align: 'start', loop: true }}
                className="w-full px-0 lg:px-8"
                setApi={(api) => {
                    emblaRef.current = api ?? null;
                    if (api) {
                        setSelectedIndex(api.selectedScrollSnap());
                        api.on('select', () => {
                            setSelectedIndex(api.selectedScrollSnap());
                        });
                    }
                }}
            >
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

            {isMobile && (
                <div className="flex justify-center mt-4 gap-2">
                    {courses.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                selectedIndex === index ? 'bg-teal-800 w-3' : 'bg-gray-400'
                            }`}
                            onClick={() => emblaRef.current?.scrollTo(index)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
