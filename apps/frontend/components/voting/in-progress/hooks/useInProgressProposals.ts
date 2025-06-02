import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { Proposal } from "@/types/proposal";

export function useInProgressProposals(communitySlug: string) {
  return useQuery<Proposal[]>({
    queryKey: ["proposals", "in-progress", communitySlug],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/proposals`,
        { credentials: "include" }
      );
      return res;
    },
  });
}
