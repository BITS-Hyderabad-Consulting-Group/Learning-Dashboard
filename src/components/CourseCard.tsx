export const courses = [
  {
    id: "course_001",
    name: "Introduction to Python",
    description: "Learn the basics of Python programming including syntax, data structures, and libraries.",
    duration: "6 weeks",
    progress: "75%",
    attendees: 1200,
    date_created: "2023-03-15T10:30:00Z",
    thumbnail_url: "https://example.com/thumbnails/python.png",
    prereq: "Basic computer knowledge",
    price: 49.99,
    tags: ["Python", "Programming", "Beginner"],
    badge_name: "Python Beginner",
    date_updated: "2024-06-20T08:15:00Z",
    status: "active"
  },
]; // dummy data accd to schema 

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Calendar, SquareArrowOutUpRight, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";


export function CourseCard() {
  const course = courses[0];

  return (
    <Card className="w-full max-w-md bg-white text-zinc-900 shadow-lg border-t-12 border-x-0 border-b-0 border-teal-800">
      <CardHeader>
        <CardTitle className="text-2xl">{course.name}</CardTitle>
            <CardAction className="bg-white">
                <Button variant="ghost" size="icon" asChild>
                    <SquareArrowOutUpRight className="w-5 h-5 text-teal-800"/>
                </Button>        
            </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-start flex-auto text-slate-500 space-x-8">
            <div className="flex items-center space-x-2">
                <Calendar />
                <span>24 Modules</span> {/*Need this data from API*/}
            </div>
            <div className="flex items-center space-x-2">
                <Timer />
                <span>{course.duration}</span>
            </div>  
        </div>
      </CardContent>
      <CardFooter className="flex flex-row justify-start text-slate-500">
        <Progress
          value={30} 
          className="bg-zinc-200 max-w-9/10"
        />      {/*This too. Made some changes to progress component from ShadCN*/}
        <span className="text-sm pl-4">30%</span>
        </CardFooter>
    </Card>
  );
}