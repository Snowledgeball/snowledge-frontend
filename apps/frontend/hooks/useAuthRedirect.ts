import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export const useAuthRedirect = () => {
  const { accessToken } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken && !pathname.split('/').includes('sign-in')) {
      router.push("/sign-in");
    }
  }, [accessToken, pathname, router]);
};