import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/general";

export function useAllCommunities() {
  const {
    data: communities,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery<Community[]>({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/all`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des communautés");
      return res.json();
    },
    enabled: true,
  });
  return {
    data: communities,
    isLoading,
    isError,
    isSuccess,
    refetch,
  };
}
