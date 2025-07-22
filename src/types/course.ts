// Dashboard and API types
export type EnrolledCourse = {
    id: string;
    title: string;
    modules: number;
    duration: string;
    progress: number;
};

export type AvailableCourse = {
    id: string;
    title: string;
    modules: number;
    duration: string;
};

export type CourseRow = { id: string; title: string };
export type WeekRow = { id: string; course_id: string };
export type ModuleRow = { id: string; week_id: string };
export type EnrollRow = { course_id: string; courses: CourseRow | CourseRow[] | null };
export interface Module {
    id?: string; // Add module ID for API calls
    title: string;
    type: string;
    content: string;
    duration: number; // in minutes
    completed: boolean;
    markedForReview: boolean;
}

export interface Week {
    title: string;
    duration: number; // in minutes
    modules: Module[];
}

export interface CourseData {
    title: string;
    description: string;
    updatedAt: Date;
    modulesCount: number;
    totalDuration: number;
    modulesCompleted: number;
    weeksCompleted: number;
    markedForReview: number;
    weeks: Week[];
}

// Database types
export interface DbModule {
    id: string;
    title: string;
    module_type: string;
    content: string;
    order_in_week: number;
    difficulty: string;
}

export interface DbWeek {
    id: string;
    title: string;
    week_number: number;
    created_at: string;
    modules: DbModule[];
}

export interface UserProgress {
    [moduleId: string]: boolean;
}
