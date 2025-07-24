'use client';

import { useEffect, useMemo, useState } from 'react';
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

import type { EnrolledCourse, AvailableCourse } from '@/types/course';
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

    const [isCoursesLoading, setIsCoursesLoading] = useState(true);

    const isLoggedInLearner = profile?.role === 'learner';

    useEffect(() => {
        if (isUserLoading) {
            return;
        }

        if (!user) {
            setEnrolledCourses([]);
            setAvailableCourses([]);
            setIsCoursesLoading(false);
            return;
        }

        setIsCoursesLoading(true);
        fetch(`/api/learning?userId=${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                setEnrolledCourses(data.enrolledCourses || []);
                setAvailableCourses(data.availableCourses || []);
            })
            .catch((error) => {
                console.error('Failed to fetch dashboard data:', error);

                setEnrolledCourses([]);
                setAvailableCourses([]);
            })
            .finally(() => {
                setIsCoursesLoading(false);
            });
    }, [user, isUserLoading]);

    const coursesWithProgress = useMemo(() => enrolledCourses, [enrolledCourses]);

    const filteredAndSortedCourses = useMemo(() => {
        let filtered = availableCourses;
        if (searchTerm.trim()) {
            filtered = filtered.filter((course) =>
                course.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
        }
        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'z-a':
                    return b.title.localeCompare(a.title);
                case 'a-z':
                default:
                    return a.title.localeCompare(b.title);
            }
        });
    }, [availableCourses, sortOrder, searchTerm]);

    const coursesPerPage = isLoggedInLearner ? 6 : 12;
    const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
    const currentCoursesToDisplay = filteredAndSortedCourses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
    );

    if (isUserLoading || isCoursesLoading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="p-8 space-y-10">
            {/* Header */}
            <div className="container mx-auto space-y-6 pt-6 pb-2">
                <h1 className="text-teal-800 text-4xl font-semibold">
                    Welcome back,{' '}
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
                    {isLoggedInLearner
                        ? 'Continue your learning journey'
                        : 'Explore our latest learning tracks'}
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
                            You haven't enrolled in any courses yet.
                        </p>
                    )}
                </section>
            )}

            {/* Available/All Courses */}
            <section className="container mx-auto py-8">
                <h2 className="text-gray-800 text-2xl font-semibold mb-6">Available Courses</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search courses..."
                        className="border border-gray-300 shadow-sm rounded-lg px-5 py-2 w-full max-w-xs"
                    />

                    <Select onValueChange={setSortOrder} defaultValue="a-z">
                        <SelectTrigger className="border border-gray-300 shadow-sm rounded-lg px-5 py-5 h-full w-full max-w-xs">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a-z">Title: A-Z</SelectItem>
                            <SelectItem value="z-a">Title: Z-A</SelectItem>
                            <SelectItem value="created-desc">Newest First</SelectItem>
                            <SelectItem value="created-asc">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 -mx-2">
                    {currentCoursesToDisplay.map((course) => (
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
                {totalPages > 1 && (
                    <Pagination className="mt-8">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                />
                            </PaginationItem>
                            {renderPageNumbers(currentPage, totalPages, setCurrentPage)}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </section>
        </div>
    );
}
