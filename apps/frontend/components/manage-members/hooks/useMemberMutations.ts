import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMemberMutations(slug: string) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners", slug] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async ({
      userId,
      isContributor,
    }: {
      userId: number;
      isContributor: boolean;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${slug}/learners/${userId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isContributor }),
        }
      );
      if (!res.ok) throw new Error("Erreur lors de la modification du statut");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners", slug] });
    },
  });

  return { deleteMutation, promoteMutation };
}
