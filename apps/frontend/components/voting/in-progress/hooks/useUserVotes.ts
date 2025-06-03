import { useQuery } from "@tanstack/react-query";
import type { Vote } from "@/types/vote";
import { useAuth } from "@/contexts/auth-context";

export function useUserVotes(communitySlug: string, userId?: string) {
    const { fetcher } = useAuth();

  return useQuery<Vote[]>({
    queryKey: ["votes", userId, communitySlug],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/votes`,
        { credentials: "include" }
      );
      return res;
    },
    enabled: !!userId,
  });
}
