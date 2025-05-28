import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/general";

export function useUserCommunities(userId: number) {
  return useQuery<Community[]>({
    queryKey: ["communities", userId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/all/${userId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.json();
    },
    enabled: !!userId,
  });
}
