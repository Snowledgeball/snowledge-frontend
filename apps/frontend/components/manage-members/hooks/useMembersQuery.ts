import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";

export function useMembersQuery(slug: string) {
  return useQuery({
    queryKey: ["learners", slug],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners`,
        { credentials: "include" }
      );
      return res;
    },
  });
}
