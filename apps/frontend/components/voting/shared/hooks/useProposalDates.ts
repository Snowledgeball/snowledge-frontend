import { formatDistanceToNow, formatDistance } from "date-fns";
import { Proposal } from "@/types/proposal";
import { useDateFnsLocale } from "./useDateFnsLocale";

export function useProposalDates(proposal: Proposal) {
  const dateFnsLocale = useDateFnsLocale();
  const endDate = proposal.endDate ? new Date(proposal.endDate) : null;
  const now = new Date();

  const startedAgo = proposal.createdAt
    ? formatDistanceToNow(new Date(proposal.createdAt), {
        addSuffix: true,
        locale: dateFnsLocale,
      })
    : "";

  let endsIn = "";
  if (endDate && !isNaN(endDate.getTime())) {
    endsIn = formatDistance(endDate, now, {
      addSuffix: true,
      locale: dateFnsLocale,
    });
  }

  return { startedAgo, endsIn, dateFnsLocale };
}
