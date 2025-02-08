import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuthGuard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;

        if (status === 'unauthenticated') {
            const shouldShowToast = !timeout;

            if (shouldShowToast) {
                toast.error("Vous devez être connecté pour accéder à cette page", {
                    id: 'auth-guard-toast',
                });
            }

            timeout = setTimeout(() => {
                router.push('/');
            }, 3000);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [status, router]);

    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    const LoadingComponent = () => (
        <div className="min-h-screen flex items-center justify-center" >
            <div className="text-center" >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" > </div>
                < p className="mt-4 text-gray-600" > Chargement...</p>
            </div>
        </div>
    );

    return {
        isLoading,
        isAuthenticated,
        session,
        LoadingComponent
    };
}; 