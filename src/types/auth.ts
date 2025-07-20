export type UserRole = 'learner' | 'instructor' | 'admin';

export interface UserContextType {
    user: {
        id: string;
        email: string;
        role: UserRole;
        name: string;
    } | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}
