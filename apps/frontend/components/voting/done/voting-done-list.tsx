import { Card } from "@repo/ui/components/card";
import { CheckCircle, XCircle, Clock, Flame } from "lucide-react";
import { getFormatIconAndLabel } from "@/components/voting/in-progress/voting-card-row";
import { formatDistance, formatDistanceToNow } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import type { Proposal } from "@/types/proposal";
import { enUS } from "date-fns/locale";
import { fr } from "date-fns/locale";

// ============
// Function: VotingDoneList
// ------------
// DESCRIPTION: Displays a list of finished votes (validated or invalidated), with reason (vote or expiration) and metrics.
// PARAMS: None (uses mock data for now)
// RETURNS: JSX.Element (the done voting list UI)
// ============

const STATUS_LABELS = {
  in_progress: {
    label: "in_progress",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
  },
  accepted: {
    label: "accepted",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
  rejected: {
    label: "rejected",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="w-4 h-4 text-red-500" />,
  },
};

const REASON_LABELS = {
  by_vote: {
    label: "by_vote",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
  by_expiration: {
    label: "by_expiration",
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
  },
};

const PARTICIPATION_LABELS = {
  low: {
    label: "low",
    color: "bg-gray-400",
    icon: <Flame className="w-4 h-4 text-gray-400" />,
  },
  medium: {
    label: "medium",
    color: "bg-orange-400",
    icon: <Flame className="w-4 h-4 text-orange-400" />,
  },
  high: {
    label: "high",
    color: "bg-green-500",
    icon: <Flame className="w-4 h-4 text-green-500" />,
  },
};

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
        doneProposals.map((proposal) => {
          const formatInfo = getFormatIconAndLabel(proposal.format);
          const status = STATUS_LABELS[proposal.status];
          const participation =
            PARTICIPATION_LABELS[
              proposal.progress < 50
                ? "low"
                : proposal.progress < 80
                  ? "medium"
                  : "high"
            ];
          const participationLabel = t(participation.label);
          const reason = REASON_LABELS[proposal.reason || "by_vote"];
          const reasonLabel = t(reason.label);

          const locale = useLocale();
          const dateFnsLocale = locale === "fr" ? fr : enUS;

          return (
            <Card
              key={proposal.id}
              className="flex flex-col md:flex-row items-center gap-4 p-4 border border-muted-foreground/10"
            >
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg truncate">
                    {proposal.title}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ml-2 ${status.color}`}
                  >
                    {status.icon}
                    {t(status.label)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ml-2 bg-muted text-muted-foreground border border-muted-foreground/10">
                    {reason.icon}
                    {reasonLabel}
                  </span>
                </div>
                {formatInfo && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-1 border border-muted-foreground/10">
                    {formatInfo.icon}
                    {formatInfo.label}
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate max-w-xs">
                    {proposal.description}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>
                    {t("ended")}{" "}
                    {formatDistanceToNow(new Date(proposal.endDate), {
                      addSuffix: true,
                      locale: dateFnsLocale,
                    })}{" "}
                  </span>
                  <span className="mx-1">–</span>
                  <span className="flex items-center gap-1">
                    {t("quorum")}:{" "}
                    <span className="font-semibold">
                      {proposal.quorum.current} / {proposal.quorum.required}
                    </span>
                  </span>
                  <span className="mx-1">–</span>
                  <span className="flex items-center gap-1">
                    {t("participation")}:{participation.icon}
                    <span className="font-semibold">{proposal.progress}%</span>
                    <span className="ml-1">{participationLabel}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 min-w-[150px]">
                <span className="font-medium text-sm truncate max-w-[150px]">
                  {proposal.submitter.firstname} {proposal.submitter.lastname}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("submitter")}
                </span>
              </div>
            </Card>
          );
        })
      ) : (
        <div>{t("no_proposals_done")}</div>
      )}
    </div>
  );
};

export default VotingDoneList;
