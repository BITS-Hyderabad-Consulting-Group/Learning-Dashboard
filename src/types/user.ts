export type Profile = {
    id: string;
    full_name: string | null;
    role: 'admin' | 'instructor' | 'learner';
    updated_at: string;
    created_at: string;
    xp: number;
    email: string | null;
    biodata: string | null;
    photo_url: string;
};
