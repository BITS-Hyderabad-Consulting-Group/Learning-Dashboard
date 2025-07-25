'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { CourseCard } from '@/components/CourseCard';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationEllipsis,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';

import type {
    EnrolledCourse,
    AvailableCourse,
    LearningApiResponse,
    PaginationInfo,
} from '@/types/course';
import SkeletonLoader from './SkeletonLoader';
import CourseCarousel from '@/components/CourseCarousel';

const renderPageNumbers = (
    currentPage: number,
    totalPages: number,
    setCurrentPage: (page: number) => void
) => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pageNumbers.push(
                <PaginationItem key={i}>
                    <Button
                        variant={currentPage === i ? 'outline' : 'ghost'}
                        size="icon"
                        onClick={() => setCurrentPage(i)}
                    >
                        {i}
                    </Button>
                </PaginationItem>
            );
        } else if (pageNumbers[pageNumbers.length - 1]?.key !== 'ellipsis') {
            pageNumbers.push(
                <PaginationItem key="ellipsis">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
    }
    return pageNumbers;
};

export default function Learning() {
    const { user, profile, loading: isUserLoading } = useUser();

    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('a-z');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);

    const [isCoursesLoading, setIsCoursesLoading] = useState(true);

    const isLoggedInLearner = profile?.role === 'learner';
    const coursesPerPage = isLoggedInLearner ? 6 : 12;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Function to fetch courses with server-side pagination
    const fetchCourses = useCallback(
        async (page: number, search: string, sort: string) => {
            if (isUserLoading) return;

            setIsCoursesLoading(true);

            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: coursesPerPage.toString(),
                    search: search.trim(),
                    sort: sort,
                });

                if (user) {
                    params.append('userId', user.id);
                }

                const response = await fetch(`/api/learning?${params.toString()}`);
                const data: LearningApiResponse = await response.json();

                setEnrolledCourses(data.enrolledCourses || []);
                setAvailableCourses(data.availableCourses || []);
                setPaginationInfo(data.pagination);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
                setEnrolledCourses([]);
                setAvailableCourses([]);
                setPaginationInfo(null);
            } finally {
                setIsCoursesLoading(false);
            }
        },
        [isUserLoading, coursesPerPage, user]
    );

    // Load courses effect - triggers when dependencies change
    useEffect(() => {
        fetchCourses(currentPage, debouncedSearchTerm, sortOrder);
    }, [user, isUserLoading, currentPage, debouncedSearchTerm, sortOrder, fetchCourses]);

    // Reset to page 1 when search term or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, sortOrder]);

    const coursesWithProgress = useMemo(() => enrolledCourses, [enrolledCourses]);

    if (isUserLoading || isCoursesLoading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="container mx-auto space-y-6 pt-6 pb-2">
                <h3 className="text-gray-600 text-lg font-semibold p-0 m-0">Welcome back, </h3>
                <h1 className="text-teal-800 text-4xl font-semibold">
                    {profile?.full_name
                        ? profile.full_name
                              .split(' ')
                              .map(
                                  (part: string) =>
                                      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                              )
                              .join(' ')
                        : 'Guest'}
                    !
                </h1>
                <h2 className="text-gray-700 text-xl">
                    {isLoggedInLearner ? '' : 'Explore our latest learning tracks'}
                </h2>
            </div>

            {/* Continue Learning Carousel */}
            {isLoggedInLearner && (
                <section className="container mx-auto">
                    <h2 className="text-gray-800 text-2xl font-semibold mb-6">Continue Learning</h2>
                    {coursesWithProgress.length > 0 ? (
                        <CourseCarousel
                            enrolled={true}
                            courses={coursesWithProgress.slice(0, 6)}
                            basis="1/3"
                        />
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            You haven&apos;t enrolled in any courses yet.
                        </p>
                    )}
                </section>
            )}

            {/* Available/All Courses */}
            <section className="container mx-auto my-8">
                <h2 className="text-gray-800 text-2xl font-semibold mb-6">Available Courses</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search courses..."
                        className="border border-gray-300 shadow-sm rounded-lg px-5 py-2 w-full max-w-xs"
                    />

                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="border border-gray-300 shadow-sm rounded-lg px-5 py-5 h-full w-full max-w-xs">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a-z">Title: A-Z</SelectItem>
                            <SelectItem value="z-a">Title: Z-A</SelectItem>
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 -mx-2">
                    {availableCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            name={course.title}
                            modules={course.modules}
                            duration={course.total_duration}
                            progress={0}
                            showProgress={false}
                        />
                    ))}
                </div>

                {/* Pagination */}
                {paginationInfo && paginationInfo.totalPages > 1 && (
                    <Pagination className="mt-8">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className={
                                        !paginationInfo.hasPreviousPage
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>
                            {renderPageNumbers(
                                currentPage,
                                paginationInfo.totalPages,
                                setCurrentPage
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(paginationInfo.totalPages, p + 1)
                                        )
                                    }
                                    className={
                                        !paginationInfo.hasNextPage
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

                {/* No results message */}
                {!isCoursesLoading && availableCourses.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {searchTerm.trim()
                                ? `No courses found matching "${searchTerm}"`
                                : 'No courses available at the moment.'}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
