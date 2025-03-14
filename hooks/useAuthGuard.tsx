import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader } from "@/components/ui/loader";

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader size="lg" color="gradient" text="Chargement..." variant="spinner" />
        </div>
    );

    return {
        isLoading,
        isAuthenticated,
        session,
        LoadingComponent
    };
}; 