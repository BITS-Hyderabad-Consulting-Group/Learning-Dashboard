export type UserRole = 'learner' | 'instructor' | 'admin';

export interface UserContextType {
    user: {
        id: string;
        email: string;
        role: UserRole;
        xp: number;
        biodata?: string;
        createdAt: Date;
        updatedAt?: Date;
        name: string;
    } | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}
