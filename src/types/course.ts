// Dashboard and API types
export type EnrolledCourse = {
    id: string;
    title: string;
    modules: number;
    total_duration: number;
    progress?: number;
    is_active: boolean;
    weeks: {
        modules: { id: string; type?: string; content?: string }[];
    }[];
};

export type AvailableCourse = {
    id: string;
    title: string;
    modules: number;
    total_duration: number;
    is_active: boolean;
    domain?: string;
    weeks: {
        modules: { id: string; type?: string; content?: string }[];
    }[];
};

export type PaginationInfo = {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type LearningApiResponse = {
    enrolledCourses: EnrolledCourse[];
    availableCourses: AvailableCourse[];
    pagination: PaginationInfo;
};

export type CourseRow = { id: string; title: string; total_duration: number };
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
    courseObjectives: string[];
    title: string;
    enrolled: boolean;
    activeLearners: number | null;
    completedModules: string[];
    instructor: string;
    description: string;
    updatedAt: Date;
    modulesCount: number;
    totalDuration: number;
    modulesCompleted: number;
    weeksCompleted: number;
    markedForReview: number;
    weeks: Week[];
}

export interface CourseWithInstructor {
    id: string;
    title: string;
    description: string;
    objectives: string[];
    updated_at: string;
    instructor: { full_name: string } | null;
}

// Database types
export interface DbModule {
    id: string;
    title: string;
    module_type: string;
    content: string;
    order_in_week: number;
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
