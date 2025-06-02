import { useMutation } from "@tanstack/react-query";

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (communitySlug: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/learners/accept-invitation`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) throw new Error("Erreur lors de l'acceptation");
      return res.json();
    },
  });
}
