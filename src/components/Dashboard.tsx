import { useState } from "react";
import Link from "next/link";
import { CourseCard } from "./CourseCard";
import combinedData from "@/app/dashboard/APIdata.json";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Enrolment = {
  course_id: string;
  course_name: string;
  enrollment_date: string;
  access_expiry: string;
  amount_paid: number;
  external_ref_id: string;
};

type User = {
  id: string;
  full_name: string;
  student_year: string;
  student_status: string;
  updated_at: string;
  enrolments: Enrolment[];
};

type Course = {
  progress: number;
  id: string;
  name: string;
  description: string;
  duration: string;
  modules: number;
  attendees: number;
  price: number;
  tags: string[];
  badge_name: string;
};

export function Dashboard() {
  const { allCourses, courses: coursesData, users: userData } = combinedData;
  const user: User = userData[0];
  const courses: Course[] = coursesData;

  function chunkArray<T>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
  }
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [sortOrder, setSortOrder] = useState("");
  const filteredCourses = selectedDomain === "all"
    ? allCourses
    : allCourses.filter(course => course.domain === selectedDomain);
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortOrder === "a-z") {
      return a.name.localeCompare(b.name);
    } 
    else if (sortOrder === "z-a") {
      return b.name.localeCompare(a.name);
    }
    else if (sortOrder === "created-asc") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    else if (sortOrder === "created-desc") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    else if (sortOrder === "updated-asc") {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    }
    else if (sortOrder === "updated-desc") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    return 0;
  });
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);
  const startIdx = (currentPage - 1) * coursesPerPage;
  const endIdx = startIdx + coursesPerPage;
  const currentCourses = sortedCourses.slice(startIdx, endIdx);
  return (
    <div className="p-8 space-y-10">
      <h1 className="text-teal-800 text-4xl mx-10 ml-20 my-4 font-semibold ">
          Welcome Back, {user.full_name}!
      </h1>
      <h2 className="text-gray-700 text-2xl mx-10 ml-20 mt-12 font-semibold mb-6">
          Continue Learning
      </h2>
      <Carousel className="relative mx-auto w-full max-w-[1200px]">
        <CarouselContent className="-ml-4 mr-4 py-4">
          {user.enrolments.map((enrol) => {
            const course = courses.find(c => c.id === enrol.course_id);
            return course ? (            
              <CarouselItem
                key={course.id}
                className="pl-8 basis-1/3  flex justify-center"
              >          
              <CourseCard
                id={course.id}
                name={course.name}
                duration={course.duration}
                modules={course.modules}
                progress={course.progress}
                showProgress={true}
              />          
              </CarouselItem>    
            ) : null;
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    
      <section>
        <h2 className="text-gray-700 text-2xl ml-20 mx-10 mt-12 font-semibold mb-6">
          All Courses
        </h2>
        <div className="flex gap-4 mt-8 mb-10 ml-28">
          <Select
            onValueChange={(value) => {
              setSortOrder(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[200px] text-teal-800 font-semibold">
              <SelectValue placeholder="Title: A-to-Z" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a-z" className="text-teal-800 font-semibold">Title: A-to-Z</SelectItem>
              <SelectItem value="z-a" className="text-teal-800 font-semibold">Title: Z-to-A</SelectItem>
              <SelectItem value="created-asc" className="text-teal-800 font-semibold">Date Created : Oldest</SelectItem>
              <SelectItem value="created-desc" className="text-teal-800 font-semibold">Date Created : Newest</SelectItem>
              <SelectItem value="updated-asc" className="text-teal-800 font-semibold">Date Updated: Oldest</SelectItem>
              <SelectItem value="updated-desc" className="text-teal-800 font-semibold">Date Updated : Newest</SelectItem> 
            </SelectContent>
          </Select>
 
          <Select
            onValueChange={(value) => {
              setSelectedDomain(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[200px] text-teal-800 font-semibold">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-teal-800 font-semibold">All Domains</SelectItem>
              <SelectItem value="Consulting" className="text-teal-800 font-semibold">Consulting</SelectItem>
              <SelectItem value="Product Management" className="text-teal-800 font-semibold">Product Management</SelectItem>
              <SelectItem value="Data Analytics" className="text-teal-800 font-semibold">Data Analytics</SelectItem>
            </SelectContent>
          </Select>
        </div>
   
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-28">
          {currentCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              name={course.name}
              duration={course.duration}
              modules={course.modules}
              progress={0}
              showProgress={false}
            />
          ))}
        </div>

        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => {
              if (i < 3 || i === totalPages - 1) {
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              }    
              if (i === 3) {
                return (
                  <PaginationItem key="ellipsis">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div> 
  );
}
