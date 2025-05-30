import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { VoteFormValues } from "./vote-schema";
import { fetcher } from "@/lib/fetcher";
import { useTranslations } from "next-intl";
import { Vote } from "@/types/vote";

export function useCreateVote(communitySlug: string) {
  const t = useTranslations("voting");
  return useMutation({
    mutationFn: async (data: VoteFormValues): Promise<Vote> => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/votes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success(t("vote_submitted_successfully"));
    },
    onError: (error: any) => {
      toast.error(t("error_submitting_vote"));
    },
  });
}
