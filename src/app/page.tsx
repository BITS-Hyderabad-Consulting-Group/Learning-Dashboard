"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../components/ui/button";
import APIdata from "../app/APIdata.json";
import { Scroller } from "../components/Scroller";

type Course = (typeof APIdata.coursesPage.recommended)[0];

function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length) {
    return [];
  }
  const head = array.slice(0, size);
  const tail = array.slice(size);
  return [head, ...chunk(tail, size)];
}

const CourseSection = ({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) => (
  <section>
    <div className="flex justify-between items-baseline mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <Link href={href}>
        <span className="text-sm font-semibold text-teal-800 hover:underline">
          See all
        </span>
      </Link>
    </div>
    {children}
  </section>
);

const CoursesCarousel = ({
  courses,
  layout = "default",
}: {
  courses: Course[];
  layout?: "default" | "grid";
}) => {
  const courseChunks = layout === "grid" ? chunk(courses, 6) : [];
  const loop = layout === "grid" ? courseChunks.length > 1 : courses.length > 3;

  return (
    <Carousel opts={{ align: "start", loop }} className="w-full">
      <CarouselContent className={layout === "grid" ? "-ml-4" : "-ml-8"}>
        {layout === "grid" &&
          courseChunks.map((chunk, index) => (
            <CarouselItem key={index} className="pl-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {chunk.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </CarouselItem>
          ))}
        {layout === "default" &&
          courses.map((course) => (
            <CarouselItem
              key={course.id}
              className="pl-8 md:basis-1/2 lg:basis-1/3"
            >
              <CourseCard course={course} />
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
      <CarouselNext className="text-teal-800 border-gray-300 hover:bg-gray-100 hover:border-teal-800" />
    </Carousel>
  );
};

export default function CoursesPage() {
  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <section className="relative text-center flex flex-col items-center">
          <div className="absolute top-0 right-0">
            <Button
              variant="outline"
              onClick={() => setIsUserLoggedIn((prev) => !prev)}
            >
              {isUserLoggedIn ? "Simulate Log Out" : "Simulate Log In"}
            </Button>
          </div>
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
            <Link href="/courses">
              <span className="inline-block bg-[#007975] text-white font-semibold rounded-full px-8 py-3 hover:bg-[#005f5c] transition-colors duration-300 shadow-md">
                Explore Courses
              </span>
            </Link>
          </div>
        </section>

        {!isUserLoggedIn && (
          <section className="mt-24 text-center">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-700 mb-8 text-center">
              Curated with guidance from our esteemed Alumni
            </h2>

            <Scroller />
          </section>
        )}

        <div className="space-y-20 mt-24">
          {isUserLoggedIn && (
            <>
              <CourseSection title="Continue Learning" href="/courses/learning">
                <CoursesCarousel
                  courses={APIdata.coursesPage.continueLearning}
                />
              </CourseSection>

              <CourseSection
                title="Recommended for you"
                href="/courses/recommended"
              >
                <CoursesCarousel courses={APIdata.coursesPage.recommended} />
              </CourseSection>
            </>
          )}

          {!isUserLoggedIn && (
            <CourseSection title="Featured Courses" href="/courses/featured">
              <CoursesCarousel
                courses={APIdata.coursesPage.recommended}
                layout="grid"
              />
            </CourseSection>
          )}
        </div>
      </div>
    </div>
  );
}
