import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { VoteFormValues } from "./vote-schema";
import { fetcher } from "@/lib/fetcher";

export function useVote() {
  return useMutation({
    mutationFn: async (data: VoteFormValues) => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/proposal/${data.proposalId}/vote`,
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
      toast.success("Vote submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error submitting vote");
    },
  });
}
