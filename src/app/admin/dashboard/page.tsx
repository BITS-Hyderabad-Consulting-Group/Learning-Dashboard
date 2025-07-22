'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { CourseCard } from '@/components/CourseCard';
import combinedData from '@/app/admin/dashboard/APIdata.json';
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
import { FcGoogle } from 'react-icons/fc';

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

export default function Learning() {
    const { allCourses, courses: enrolledCoursesData, users: userData } = combinedData;
    const demoUser: User = userData[0];

    const enrolledCoursesById = useMemo(() => {
        return new Map(enrolledCoursesData.map((course) => [course.id, course]));
    }, [enrolledCoursesData]);

    const userCoursesWithDetails = useMemo(() => {
        return demoUser.enrolments
            .map((enrol) => enrolledCoursesById.get(enrol.course_id))
            .filter((course): course is EnrolledCourse => course !== undefined);
    }, [demoUser.enrolments, enrolledCoursesById]);

    const [selectedDomain, setSelectedDomain] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

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
    const coursesPerPage = 6;
    const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
    const currentCoursesToDisplay = filteredAndSortedCourses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
    );
    const currentCourses = allCourses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
    );

    const { profile } = useUser();

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                        Please log in to continue
                    </h1>
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10">
            <div className="absolute top-30 right-30">
                <button
                    className="bg-teal-800 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-teal-900 transition-colors"
                    onClick={async () => {
                        try {
                            await signInWithGoogle();
                        } catch (error) {
                            console.error('Unexpected error:', error);
                            alert('An unexpected error occurred. Please try again.');
                        }
                    }}
                >
                    <FcGoogle className="text-xl" />
                    Sign in with Google
                </button>
            </div>

            {profile ? (
                <div className="container mx-auto space-y-15 px-6 py-8 overflow-x-hidden">
                    <h1 className="text-teal-800 text-4xl ml-6 font-semibold">
                        Welcome Back, {profile.full_name || 'Admin'}!
                    </h1>
                    <section>
                        <h2 className="text-gray-700 text-2xl ml-18 font-semibold mb-8">
                            Continue Learning
                        </h2>
                        <Carousel className="relative mx-auto w-full max-w-[1200px]">
                            <CarouselContent className=" py-4 ml-1 ">
                                {userCoursesWithDetails.map((course) => (
                                    <CarouselItem key={course.id} className="basis-1/3 px-2">
                                        <CourseCard {...course} showProgress={true} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="text-teal-800 border border-gray-300 bg-white hover:bg-gray-100 hover:border-teal-800" />
                            <CarouselNext className="text-teal-800 border border-gray-300 bg-white hover:bg-gray-100 hover:border-teal-800" />
                        </Carousel>
                    </section>

                    <section>
                        <h2 className="text-gray-700 text-2xl mt-12 font-semibold mb-6 pl-18">
                            All Courses
                        </h2>
                        <div className="flex flex-wrap gap-4 mt-8 mb-10 pl-18">
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
                                    <SelectItem
                                        value="created-asc"
                                        className="text-teal-800 font-semibold"
                                    >
                                        Date Created : Oldest
                                    </SelectItem>
                                    <SelectItem
                                        value="created-desc"
                                        className="text-teal-800 font-semibold"
                                    >
                                        Date Created : Newest
                                    </SelectItem>
                                    <SelectItem
                                        value="updated-asc"
                                        className="text-teal-800 font-semibold"
                                    >
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
                                    <SelectItem
                                        value="Consulting"
                                        className="text-teal-800 font-semibold"
                                    >
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-18">
                            {currentCoursesToDisplay.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    {...course}
                                    progress={0}
                                    showProgress={false}
                                />
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
                                        onClick={() =>
                                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </section>
                </div>
            ) : (
                <div className="overflow-x-hidden">
                    <h2 className="text-gray-800 text-4xl font-semibold mb-12 mt-4 text-center">
                        All Courses
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-24">
                        {currentCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                progress={0}
                                {...course}
                                showProgress={false}
                            />
                        ))}
                    </div>
                    <Pagination className="mt-8 ml-10">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            {totalPages > 3 && (
                                <div>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={currentPage === totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </div>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
