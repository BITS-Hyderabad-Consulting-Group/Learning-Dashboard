"use client";
import React from "react";
import { CourseCard } from "@/components/CourseCard";
const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <h1 className="text-4xl font-bold text-white-800 mb-12">Home Page</h1>
      <CourseCard/>
    </div>
  );
};

export default HomePage;
