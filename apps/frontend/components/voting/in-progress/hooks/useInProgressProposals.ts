import { useQuery } from "@tanstack/react-query";
import type { Proposal } from "@/types/proposal";
import { useAuth } from "@/contexts/auth-context";

export function useInProgressProposals(communitySlug: string) {
    const { fetcher } = useAuth();

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
