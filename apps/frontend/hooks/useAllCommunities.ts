import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { fetcher } from "@/lib/fetcher";

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
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/all`,
        {
          credentials: "include",
        }
      );
      return res;
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
