import { Card } from "@repo/ui/components/card";
import { getFormatIconAndLabel } from "@/components/voting/shared/utils/format-utils";
import type { Proposal } from "@/types/proposal";
import { useTranslations } from "next-intl";
import React from "react";
import { STATUS_LABELS } from "./labels/status-labels";
import { REASON_LABELS } from "./labels/reason-labels";
import { PARTICIPATION_LABELS } from "./labels/participation-labels";
import { useProposalDates } from "../shared/hooks/useProposalDates";

function getParticipationLabel(progress: number) {
  if (progress < 50) return "low";
  if (progress < 80) return "medium";
  return "high";
}

type VotingDoneCardProps = {
  proposal: Proposal;
};

const VotingDoneCard: React.FC<VotingDoneCardProps> = ({ proposal }) => {
  const t = useTranslations("voting");
  const formatInfo = getFormatIconAndLabel(proposal.format);
  const status = STATUS_LABELS[proposal.status];
  const participationKey = getParticipationLabel(proposal.progress);
  const participation = PARTICIPATION_LABELS[participationKey];
  const participationLabel = t(participation.label);
  const reason =
    REASON_LABELS[proposal.reason as keyof typeof REASON_LABELS] ||
    REASON_LABELS.by_vote;
  const reasonLabel = t(reason.label);
  const { endedAgo } = useProposalDates(proposal);
  return (
    <Card
      key={proposal.id}
      className="flex flex-col md:flex-row items-center gap-4 p-4 border border-muted-foreground/10"
    >
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg truncate">{proposal.title}</span>
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
          <span className="truncate max-w-xs">{proposal.description}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span>
            {t("ended")} {endedAgo}
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
        <span className="text-xs text-muted-foreground">{t("submitter")}</span>
      </div>
    </Card>
  );
};

export default VotingDoneCard;
