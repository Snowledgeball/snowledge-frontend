import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { VoteFormValues } from "./vote-schema";
import { fetcher } from "@/lib/fetcher";

export function useCreateVote() {
  return useMutation({
    mutationFn: async (data: VoteFormValues) => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/votes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );
      if (!res.ok) {
        let err;
        try {
          err = await res.json();
        } catch {
          err = { message: "Unknown error" };
        }
        throw new Error(err.message || "Unknown error");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Vote submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error submitting vote");
    },
  });
}
