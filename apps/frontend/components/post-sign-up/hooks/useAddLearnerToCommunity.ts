import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type AddLearnerToCommunityParams = {
  communitySlug: string;
};

export function useAddLearnerToCommunity() {
  const { user } = useAuth();
  const t = useTranslations("postSignUp");

  return useMutation({
    mutationFn: async ({ communitySlug }: AddLearnerToCommunityParams) => {
      const id = user?.id;
      if (!id) throw new Error("Utilisateur non authentifié");
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/learners/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
          credentials: "include",
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success(t("success_joined"));
    },
    onError: (err: any) => {
      let errorMsg = t("error");
      try {
        const error = JSON.parse(err.message);
        errorMsg =
          error.message || error.error || error.statusCode || "Erreur inconnue";
      } catch {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    },
  });
}
