import { formatDistanceToNow, formatDistance } from "date-fns";
import { Proposal } from "@/types/proposal";
import { useDateFnsLocale } from "./useDateFnsLocale";

export function useProposalDates(proposal: Proposal) {
  const dateFnsLocale = useDateFnsLocale();
  const now = new Date();

  const startedAgo = proposal.createdAt
    ? formatDistanceToNow(new Date(proposal.createdAt), {
        addSuffix: true,
        locale: dateFnsLocale,
      })
    : "";

  let endsIn = "";
  if (proposal.deadline && !isNaN(new Date(proposal.deadline).getTime())) {
    endsIn = formatDistance(new Date(proposal.deadline), now, {
      addSuffix: true,
      locale: dateFnsLocale,
    });
  }

  const endedAgo = proposal.endedAt
    ? formatDistanceToNow(new Date(proposal.endedAt), {
        addSuffix: true,
        locale: dateFnsLocale,
      })
    : "";

  return { startedAgo, endsIn, dateFnsLocale, endedAgo };
}
