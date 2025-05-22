import { useQuery } from "@tanstack/react-query";
import { Community } from "../community-context";

export function useUserCommunities(userId: number) {
  const { data: communities } = useQuery<Community[]>({
    queryKey: ["communities", userId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/all/${userId}`
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des communautés");
      return res.json();
    },
    enabled: !!userId,
  });
  return {
    data: communities,
    isLoading: !communities,
    isError: !!communities,
    isSuccess: !!communities,
  };
}
