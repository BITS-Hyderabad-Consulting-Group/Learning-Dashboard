'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { CourseCard } from '@/components/CourseCard';
import combinedData from '@/app/dashboard/APIdata.json';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
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
    PaginationLink,
    PaginationEllipsis,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/auth';

interface BaseCourse {
    id: string;
    name: string;
    domain: string;
    modules: number;
    duration: string;
}

interface Course extends BaseCourse {
    progress: number;
}

type DirectoryCourse = BaseCourse & {
    created_at: string;
    updated_at: string;
};

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

export default function Dashboard() {
    const { user, isLoading } = useUser();
    const { allCourses, courses: enrolledCoursesData } = combinedData;

    const [selectedDomain, setSelectedDomain] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('a-z');
    const [searchTerm, setSearchTerm] = useState('');

    // Get base courses based on user role
    const userCourses = useMemo(() => {
        if (!user) return [];

        switch (user.role) {
            case 'instructor':
                // Show courses assigned to this instructor
                return allCourses.map((course) => ({
                    ...course,
                    progress: 0,
                }));
            case 'learner':
                // Show enrolled courses
                return enrolledCoursesData.map((course) => ({
                    ...course,
                    progress: course.progress || 0,
                }));
            case 'admin':
                // Show all courses
                return allCourses.map((course) => ({
                    ...course,
                    progress: 0,
                }));
            default:
                return [];
        }
    }, [user, allCourses, enrolledCoursesData]);

    // Add progress to courses for learners
    const coursesWithProgress = useMemo(() => {
        return userCourses.map((course) => ({
            ...course,
            progress: course.progress || 0,
        }));
    }, [userCourses]);

    // Filter and sort the available courses
    const filteredAndSortedCourses = useMemo(() => {
        let filtered = coursesWithProgress;

        // Apply domain filter
        if (selectedDomain !== 'all') {
            filtered = filtered.filter((course) => course.domain === selectedDomain);
        }

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter((course) =>
                course.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
        }

        // Sort courses
        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'z-a':
                    return b.name.localeCompare(a.name);
                case 'created-asc':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'created-desc':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'updated-asc':
                    return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                case 'updated-desc':
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                case 'a-z':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [coursesWithProgress, selectedDomain, sortOrder, searchTerm]);

    const coursesPerPage = 9;
    const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
    const currentCoursesToDisplay = filteredAndSortedCourses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold text-teal-800">Loading...</div>
            </div>
        );
    }

    console.log('Dashboard user:', user); // Debug log

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Button
                    onClick={signInWithGoogle}
                    className="bg-teal-600 text-white px-4 py-2 rounded"
                >
                    Sign in with Google
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10">
            {/* Header */}
            <div className="container mx-auto space-y-6 px-6">
                <h1 className="text-teal-800 text-4xl font-semibold">
                    Welcome back,{' '}
                    {user.full_name
                        ? user.full_name
                              .trim()
                              .split(/\s+/) // Split by any whitespace
                              .map(
                                  (part) =>
                                      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                              )
                              .join(' ')
                        : user.email.toLowerCase()}
                    !
                </h1>

                {/* Role-specific welcome message */}
                <h2 className="text-gray-700 text-xl">
                    {user.role === 'learner' && 'Continue your learning journey'}
                    {user.role === 'instructor' && 'Manage your courses'}
                    {user.role === 'admin' && 'Overview of all courses'}
                </h2>
            </div>

            {/* Enrolled/Created Courses Carousel (for learners and instructors) */}
            {(user.role === 'learner' || user.role === 'instructor') && (
                <section className="container mx-auto px-6">
                    <h2 className="text-gray-800 text-2xl font-semibold mb-6">
                        {user.role === 'learner' ? 'Your Enrolled Courses' : 'Your Courses'}
                    </h2>
                    {filteredAndSortedCourses.length > 0 ? (
                        <Carousel opts={{ loop: true }}>
                            <CarouselContent className="py-4">
                                {filteredAndSortedCourses.map((course) => (
                                    <CarouselItem key={course.id} className="basis-1/3 pl-4">
                                        <CourseCard
                                            {...course}
                                            showProgress={user.role === 'learner'}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                            <CarouselNext className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
                        </Carousel>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            {user.role === 'learner'
                                ? "You haven't enrolled in any courses yet."
                                : "You haven't created any courses yet."}
                        </p>
                    )}
                </section>
            )}

            {/* All/Available Courses Section */}
            {(user.role === 'learner' || user.role === 'admin') && (
                <section className="container mx-auto px-6 py-8">
                    <h2 className="text-gray-800 text-2xl font-semibold mb-6">
                        {user.role === 'learner' ? 'Available Courses' : 'All Courses'}
                    </h2>

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
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="a-z">Title: A-Z</SelectItem>
                                <SelectItem value="z-a">Title: Z-A</SelectItem>
                                <SelectItem value="created-desc">Newest First</SelectItem>
                                <SelectItem value="created-asc">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={setSelectedDomain} defaultValue="all">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by Domain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Domains</SelectItem>
                                <SelectItem value="Consulting">Consulting</SelectItem>
                                <SelectItem value="Product Management">
                                    Product Management
                                </SelectItem>
                                <SelectItem value="Data Analytics">Data Analytics</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Course Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentCoursesToDisplay.map((course) => (
                            <CourseCard key={course.id} {...course} showProgress={false} />
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
            )}
        </div>
    );
}
