"use client";
import VotingCardRow from "@/components/voting/in-progress/voting-card-row";
import type { Proposal } from "@/types/proposal";
import { useState } from "react";
import VoteScreen from "./vote-screen";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useVotedProposalIds } from "@/components/voting/in-progress/hooks/useVotedProposalIds";
import type { Vote } from "@/types/vote";
import { useAuth } from "@/contexts/auth-context";

// ============
// Function: VotingInProgressList
// ------------
// DESCRIPTION: Displays a list of ongoing votes using VotingCardRow for each vote. Uses mock data for now. Handles navigation to VoteScreen.
// PARAMS: None
// RETURNS: JSX.Element (the voting list UI)
// ============

const VotingInProgressList = ({ communitySlug }: { communitySlug: string }) => {
  const t = useTranslations("voting");
  const [selectedVote, setSelectedVote] = useState<Proposal | null>(null);
  const { user } = useAuth();

  const {
    data: proposals,
    isLoading,
    isError,
  } = useQuery<Proposal[]>({
    queryKey: ["proposals", "in-progress"],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/proposals`,
        { credentials: "include" }
      );
      return res;
    },
  });

  // Récupère les votes de l'utilisateur courant
  const {
    data: userVotes,
    isLoading: isLoadingVotes,
    isError: isErrorVotes,
  } = useQuery<Vote[]>({
    queryKey: ["votes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/votes`,
        { credentials: "include" }
      );
      return res;
    },
    enabled: !!user?.id,
  });

  const votedProposalIds = useVotedProposalIds(userVotes || []);

  if (isLoading || isLoadingVotes) return <div>{t("loading")}</div>;
  if (isError || isErrorVotes)
    return <div className="text-red-500">{t("error")}</div>;

  if (selectedVote) {
    return (
      <VoteScreen
        closeVoteScreen={() => setSelectedVote(null)}
        communitySlug={communitySlug}
        proposal={selectedVote}
        onBack={() => setSelectedVote(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {proposals && proposals.length > 0 ? (
        proposals
          .filter((proposal: Proposal) => proposal.status === "in_progress")
          .map((proposal: Proposal) => (
            <VotingCardRow
              key={proposal.id}
              proposal={proposal}
              alreadyVoted={votedProposalIds.has(proposal.id)}
              onVoteNow={() => setSelectedVote(proposal)}
            />
          ))
      ) : (
        <div>{t("no_proposals")}</div>
      )}
    </div>
  );
};

export default VotingInProgressList;
