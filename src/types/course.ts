export interface Module {
    id?: string; // Add module ID for API calls
    title: string;
    type: string;
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
