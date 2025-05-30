"use client";
import VotingCardRow from "@/components/voting/shared/voting-card-row";
import type { Proposal } from "@/types/proposal";
import { useState } from "react";
import VoteScreen from "./vote-screen";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

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

  const {
    data: votes,
    isLoading,
    isError,
  } = useQuery<Proposal[]>({
    queryKey: ["votes", "in-progress"],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}/proposals`,
        { credentials: "include" }
      );
      return res;
    },
  });

  if (isLoading) return <div>{t("loading")}</div>;
  if (isError) return <div className="text-red-500">{t("error")}</div>;

  if (selectedVote) {
    return (
      <VoteScreen
        proposal={selectedVote}
        onBack={() => setSelectedVote(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {votes && votes.length > 0 ? (
        votes.map((proposal: Proposal) => (
          <VotingCardRow
            key={proposal.id}
            proposal={proposal}
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
