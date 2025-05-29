import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMembersQuery(slug: string) {
  return useQuery({
    queryKey: ["learners", slug],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners`,
        { credentials: "include" }
      );
      if (res.status == 401) {
        toast.error("Veuillez vous reconnecter pour accéder à cette page");
        window.location.href = "/";
      }
      if (!res.ok) throw new Error("Erreur lors du chargement des membres");
      return res.json();
    },
  });
}
