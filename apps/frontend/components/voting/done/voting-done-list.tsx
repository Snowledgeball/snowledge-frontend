import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { Proposal } from "@/types/proposal";
import VotingDoneCard from "./VotingDoneCard";

// ============
// Function: VotingDoneList
// ------------
// DESCRIPTION: Displays a list of finished votes (validated or invalidated), with reason (vote or expiration) and metrics.
// PARAMS: None (uses mock data for now)
// RETURNS: JSX.Element (the done voting list UI)
// ============

const VotingDoneList = ({ communitySlug }: { communitySlug: string }) => {
  const t = useTranslations("voting");
  const {
    data: proposals,
    isLoading,
    isError,
  } = useQuery<Proposal[]>({
    queryKey: ["proposals", "done"],
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

  const doneProposals = (proposals || []).filter(
    (proposal) =>
      proposal.status === "accepted" || proposal.status === "rejected"
  );

  return (
    <div className="flex flex-col gap-6">
      {doneProposals.length > 0 ? (
        doneProposals.map((proposal) => (
          <VotingDoneCard key={proposal.id} proposal={proposal} />
        ))
      ) : (
        <div>{t("no_proposals_done")}</div>
      )}
    </div>
  );
};

export default VotingDoneList;
