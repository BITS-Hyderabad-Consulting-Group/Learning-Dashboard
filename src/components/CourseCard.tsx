'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, SquareArrowOutUpRight, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Course = {
    id: string;
    name: string;
    duration: string;
    progress: number;
    modules: number;
    showProgress: boolean;
};

const MotionCard = motion(Card);

export function CourseCard({
    id,
    name,
    duration,
    modules,
    progress = 0,
    showProgress = false,
}: Course) {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' as const },
        },
    };
    return (
        <MotionCard
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="w-full max-w-md cursor-pointer bg-white text-zinc-900 shadow-lg border-t-[12px] border-x-0 border-b-0 border-teal-800"
        >
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-0">
                <CardTitle className="text-xl font-semibold truncate min-w-0" title={name}>
                    {name}
                </CardTitle>

                <Button variant="ghost" size="icon" asChild className="shrink-0">
                    <a href={`/courses/${id}`} aria-label={`View details for ${name}`}>
                        <SquareArrowOutUpRight className="h-5 w-5 text-teal-800" />
                    </a>
                </Button>
            </CardHeader>

            <CardContent className="pb-2">
                <div className="flex items-center justify-start space-x-3 text-sm text-slate-500">
                    <div className="flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{modules} Modules</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <Timer className="h-4 w-4" />
                        <span>{duration}</span>
                    </div>
                </div>
            </CardContent>
            {showProgress && (
                <CardFooter className="flex flex-col items-start space-y-1 text-slate-500">
                    <div className="flex w-full justify-between text-sm">
                        <p className="font-medium">Progress</p>
                        <span className="font-bold text-teal-800">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 w-full bg-zinc-200" />
                </CardFooter>
            )}
        </MotionCard>
    );
}
