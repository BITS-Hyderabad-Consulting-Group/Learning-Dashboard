import WeekList from '@/components/WeekList';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock } from 'lucide-react';

interface Module {
    title: string;
    type: string;
    completed: boolean;
    markedForReview: boolean;
}

interface Week {
    title: string;
    duration: number; // in minutes (converted to "X hr Y min" format)
    modules: Module[];
}

interface CourseData {
    title: string;
    description: string;
    modulesCount: number;
    totalDuration: number;
    modulesCompleted: number;
    weeksCompleted: number;
    markedForReview: number;
    weeks: Week[];
}

//Convert the total duration from minutes to "X hr Y min" format
function formatDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
}

//Main component to display the course page
export default async function CoursePage() {
    // Load the JSON data
    const data: CourseData = await import('./APIdata.json').then((mod) => mod.default);

    return (
        <main className="max-w-6xl mx-auto p-4">
            {/* Header section: Course Info + Progress */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Left Card: Course Info */}
                <Card className="flex-1 bg-[#B4DEDD] shadow-md">
                    <CardContent className="pt-2 px-4 pb-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="bg-[#007C6A] text-white px-3 py-1.5 rounded-md text-xl font-bold w-fit">
                                {data.title}
                            </div>

                            {/* (Modules + Duration) */}
                            <div className="flex items-center gap-4 text-[#005F5F] font-medium text-sm">
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{data.modulesCount} Modules</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(data.totalDuration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Course description */}
                        <p className="text-base font-medium text-[#333] leading-relaxed">
                            {data.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Right Card: Progress Summary */}
                <Card className="w-full lg:w-64 bg-[#B4DEDD] shadow-md">
                    <CardContent className="pt-2 px-4 pb-3">
                        {/* Status */}
                        <h2 className="text-center text-base text-black font-bold">Status</h2>
                        <hr className="my-2 border-gray-300" />

                        {/* Rows */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-[#007C6A] text-xs font-medium">
                                    Modules Completed
                                </p>
                                <p className="text-black text-lg font-bold">
                                    {data.modulesCompleted}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-[#007C6A] text-xs font-medium">
                                    Weeks Completed
                                </p>
                                <p className="text-black text-lg font-bold">
                                    {data.weeksCompleted} / {data.weeks.length}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-[#007C6A] text-xs font-medium">
                                    Marked for Review
                                </p>
                                <p className="text-black text-lg font-bold">
                                    {data.markedForReview}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* WeekList */}
            <WeekList weeks={data.weeks} />
        </main>
    );
}
