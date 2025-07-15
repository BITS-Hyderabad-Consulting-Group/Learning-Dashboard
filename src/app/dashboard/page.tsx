'use client';

import { useMemo, useState } from 'react';
import { CourseCard } from '@/components/CourseCard';
import combinedData from '@/app/dashboard/APIdata.json';
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
    PaginationEllipsis,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';

type EnrolledCourse = (typeof combinedData.courses)[0];

type DirectoryCourse = (typeof combinedData.allCourses)[0];

type User = (typeof combinedData.users)[0];

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
    const { allCourses, courses: enrolledCoursesData, users: userData } = combinedData;
    const user: User = userData[0];

    const enrolledCoursesById = useMemo(() => {
        return new Map(enrolledCoursesData.map((course) => [course.id, course]));
    }, [enrolledCoursesData]);

    const userCoursesWithDetails = useMemo(() => {
        return user.enrolments
            .map((enrol) => enrolledCoursesById.get(enrol.course_id))
            .filter((course): course is EnrolledCourse => course !== undefined);
    }, [user.enrolments, enrolledCoursesById]);

    const [selectedDomain, setSelectedDomain] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 6;
    const [sortOrder, setSortOrder] = useState('a-z');
    const filteredAndSortedCourses = useMemo(() => {
        const filtered =
            selectedDomain === 'all'
                ? allCourses
                : allCourses.filter((course) => course.domain === selectedDomain);

        return [...filtered].sort((a: DirectoryCourse, b: DirectoryCourse) => {
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
    }, [allCourses, selectedDomain, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
    const currentCoursesToDisplay = filteredAndSortedCourses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
    );

    return (
        <div className="container mx-auto space-y-10 px-4 py-8">
            <h1 className="text-teal-800 text-4xl my-4 font-semibold">
                Welcome Back, {user.full_name}!
            </h1>
            <section>
                <h2 className="text-gray-700 text-2xl font-semibold mb-6">Continue Learning</h2>
                <Carousel className="w-full">
                    <CarouselContent className="-ml-4 py-4">
                        {userCoursesWithDetails.map((course) => (
                            <CarouselItem
                                key={course.id}
                                className="pl-4 md:basis-1/2 lg:basis-1/3"
                            >
                                <div className="p-1">
                                    <CourseCard {...course} showProgress={true} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-teal-800 border border-gray-300 bg-white hover:bg-gray-100 hover:border-teal-800" />
                    <CarouselNext className="text-teal-800 border border-gray-300 bg-white hover:bg-gray-100 hover:border-teal-800" />
                </Carousel>
            </section>

            <section>
                <h2 className="text-gray-700 text-2xl mt-12 font-semibold mb-6">All Courses</h2>
                <div className="flex flex-wrap gap-4 mt-8 mb-10">
                    <Select onValueChange={setSortOrder} defaultValue="a-z">
                        <SelectTrigger className="w-[200px] text-teal-800 font-semibold">
                            <SelectValue placeholder="Title: A-to-Z" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a-z" className="text-teal-800 font-semibold">
                                Title: A-to-Z
                            </SelectItem>
                            <SelectItem value="z-a" className="text-teal-800 font-semibold">
                                Title: Z-to-A
                            </SelectItem>
                            <SelectItem value="created-asc" className="text-teal-800 font-semibold">
                                Date Created : Oldest
                            </SelectItem>
                            <SelectItem
                                value="created-desc"
                                className="text-teal-800 font-semibold"
                            >
                                Date Created : Newest
                            </SelectItem>
                            <SelectItem value="updated-asc" className="text-teal-800 font-semibold">
                                Date Updated: Oldest
                            </SelectItem>
                            <SelectItem
                                value="updated-desc"
                                className="text-teal-800 font-semibold"
                            >
                                Date Updated : Newest
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={setSelectedDomain} defaultValue="all">
                        <SelectTrigger className="w-[200px] text-teal-800 font-semibold">
                            <SelectValue placeholder="Domain" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-teal-800 font-semibold">
                                All Domains
                            </SelectItem>
                            <SelectItem value="Consulting" className="text-teal-800 font-semibold">
                                Consulting
                            </SelectItem>
                            <SelectItem
                                value="Product Management"
                                className="text-teal-800 font-semibold"
                            >
                                Product Management
                            </SelectItem>
                            <SelectItem
                                value="Data Analytics"
                                className="text-teal-800 font-semibold"
                            >
                                Data Analytics
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentCoursesToDisplay.map((course) => (
                        <CourseCard key={course.id} {...course} progress={0} showProgress={false} />
                    ))}
                </div>

                <Pagination className="mt-12">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            />
                        </PaginationItem>
                        {renderPageNumbers(currentPage, totalPages, setCurrentPage)}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </section>
        </div>
    );
}
