import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Profile } from '@/types/user';

export function withRoleAccess(
    WrappedComponent: React.ComponentType,
    allowedRoles: Profile['role'][]
) {
    return function WithRoleAccessComponent(props: any) {
        const { user, loading } = useUser();
        const router = useRouter();

        if (loading) {
            return <div>Loading...</div>;
        }

        if (!user) {
            router.push('/');
            return null;
        }

        if (!user.role || !allowedRoles.includes(user.role as Profile['role'])) {
            router.push('/unauthorized');
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}
