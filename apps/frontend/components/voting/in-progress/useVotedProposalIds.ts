import { useMemo } from "react";
import type { Proposal } from "@/types/proposal";
import type { Vote } from "@/types/vote";

/**
 * Retourne un Set des ids des propositions déjà votées par l'utilisateur.
 */
export function useVotedProposalIds(userVotes: Vote[]) {
  // On crée un Set des ids des propositions déjà votées
  return useMemo(() => {
    return new Set(
      userVotes.map(
        (vote) =>
          typeof vote.proposal === "object" ? vote.proposal.id : vote.proposal // au cas où ce serait juste l'id
      )
    );
  }, [userVotes]);
}
