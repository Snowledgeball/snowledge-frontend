import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { useTranslation } from "react-i18next";

export const useAuthGuard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    if (status === "unauthenticated") {
      const shouldShowToast = !timeout;

      if (shouldShowToast) {
        toast.error("Vous devez être connecté pour accéder à cette page", {
          id: "auth-guard-toast",
        });
      }

      timeout = setTimeout(() => {
        router.push("/");
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [status, router]);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const LoadingComponent = () => (
    <div className="flex justify-center items-center min-h-screen">
      <Loader
        size="lg"
        color="gradient"
        text={t("loading.default")}
        variant="spinner"
      />
    </div>
  );

  return {
    isLoading,
    isAuthenticated,
    session,
    LoadingComponent,
  };
};
