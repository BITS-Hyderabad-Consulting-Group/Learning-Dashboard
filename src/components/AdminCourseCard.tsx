'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SquareArrowOutUpRight } from 'lucide-react';

type AdminCourseCardProps = {
    id: string;
    name: string;
    enrollments: number;
    status: string;
    onViewDetailsClick: () => void;
};

const statusColorMap = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
};

type Status = 'active' | 'draft' | 'archived';

const StatusBadge = ({ status }: { status: Status }) => {
    return (
        <span
            className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColorMap[status]}`}
        >
            {status}
        </span>
    );
};

export const AdminCourseCard = ({
    id,
    name,
    enrollments,
    status,
    onViewDetailsClick,
}: AdminCourseCardProps) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' as const },
        },
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="px-2 py-4"
        >
            <Card className="w-full max-w-md min-w-xs cursor-pointer bg-white text-zinc-900 shadow-lg border-t-[12px] border-x-0 border-b-0 border-teal-800">
                {/* Header */}
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-0">
                    <CardTitle className="text-xl font-semibold truncate min-w-0" title={name}>
                        {name}
                    </CardTitle>
                    <Button variant="ghost" size="icon" asChild className="shrink-0">
                        <Link href={`/courses/${id}`} aria-label={`View ${name}`}>
                            <SquareArrowOutUpRight className="h-5 w-5 text-teal-800" />
                        </Link>
                    </Button>
                </CardHeader>

                {/* Stats */}
                <CardContent className="pb-2">
                    <div className="flex items-center justify-start space-x-4 text-sm text-slate-500">
                        <div className="flex flex-col">
                            <span className="text-xs">Enrollments</span>
                            <span className="font-semibold text-base text-zinc-800">
                                {enrollments}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs">Status</span>
                            <StatusBadge status={status as Status} />
                        </div>
                    </div>
                </CardContent>

                {/* Actions */}
                <CardFooter className="flex flex-col gap-2 pt-2">
                    <Button
                        variant="outline"
                        className="w-full shadow-sm"
                        onClick={onViewDetailsClick}
                    >
                        View Detailed Analytics
                    </Button>
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button asChild variant="outline" size="sm" className="shadow-sm">
                            <Link href={`/admin/courses/${id}`}>Edit Course</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="shadow-sm">
                            <Link href={`/admin/quizzes/${id}`}>Quiz Submissions</Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};
