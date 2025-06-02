"use client";
import VotingCardRow from "@/components/voting/in-progress/VotingCardRow";
import type { Proposal } from "@/types/proposal";
import { useState } from "react";
import VoteScreen from "./VoteScreen";
import { useTranslations } from "next-intl";
import { useVotedProposalIds } from "@/components/voting/in-progress/hooks/useVotedProposalIds";
import { useAuth } from "@/contexts/auth-context";
import { useInProgressProposals } from "./hooks/useInProgressProposals";
import { useUserVotes } from "./hooks/useUserVotes";

const VotingInProgressList = ({ communitySlug }: { communitySlug: string }) => {
  const t = useTranslations("voting");
  const [selectedVote, setSelectedVote] = useState<Proposal | null>(null);
  const { user } = useAuth();

  const {
    data: proposals,
    isLoading,
    isError,
  } = useInProgressProposals(communitySlug);
  const {
    data: userVotes,
    isLoading: isLoadingVotes,
    isError: isErrorVotes,
  } = useUserVotes(communitySlug, user?.id);

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
