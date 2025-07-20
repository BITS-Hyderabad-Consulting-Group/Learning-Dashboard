import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { UserRole } from '@/types/auth';

export function withRoleAccess(WrappedComponent: React.ComponentType, allowedRoles: UserRole[]) {
    return function WithRoleAccessComponent(props: any) {
        const { user, isLoading } = useUser();
        const router = useRouter();

        if (isLoading) {
            return <div>Loading...</div>;
        }

        if (!user) {
            router.push('/'); // Redirect to home/login page
            return null;
        }

        if (!allowedRoles.includes(user.role)) {
            router.push('/unauthorized'); // Redirect to unauthorized page
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}
