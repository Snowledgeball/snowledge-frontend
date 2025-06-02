import { useQuery } from "@tanstack/react-query";

export function useMyInvitations() {
  return useQuery({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/user/my-invitations`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des invitations");
      return res.json();
    },
  });
}
