import { Card } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/tooltip";
import { Info, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { getFormatIconAndLabel } from "@/components/voting/shared/utils/format-utils";
import { useProposalDates } from "@/components/voting/shared/hooks/useProposalDates";
import { Proposal } from "@/types/proposal";

interface VotingCardRowProps {
  proposal: Proposal;
  onVoteNow?: () => void;
  alreadyVoted?: boolean;
}

const VotingCardRow = ({
  proposal,
  onVoteNow,
  alreadyVoted,
}: VotingCardRowProps) => {
  const { user } = useAuth();
  const t = useTranslations("voting");
  const { startedAgo, endsIn } = useProposalDates(proposal);

  const isQuorumReached = proposal.progress >= 100;
  const formatInfo = getFormatIconAndLabel(proposal.format);

  return (
    <Card className="flex flex-col md:flex-row items-center gap-4 p-4 shadow-md border border-muted-foreground/10">
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="font-bold text-lg hover:underline truncate"
            tabIndex={0}
            aria-label={t("view_details", { title: proposal.title })}
          >
            {proposal.title}
          </Link>
          {isQuorumReached && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
        {formatInfo && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-1 border border-muted-foreground/10">
            {formatInfo.icon}
            {formatInfo.label}
          </span>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {proposal.description.length > 150 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-xs cursor-pointer">
                  {proposal.description.slice(0, 150) + "…"}
                </span>
              </TooltipTrigger>
              <TooltipContent>{proposal.description}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="truncate max-w-xs">{proposal.description}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <Clock className="w-4 h-4" />
          <span>
            {t("started")} {startedAgo}
          </span>
          <span className="mx-1">–</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{endsIn.replace("in ", "")}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{t("completion")}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>{t("completion_tooltip")}</TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground">
                {proposal.quorum.current} / {proposal.quorum.required}{" "}
                {t("required")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={proposal.progress} className="w-40 h-2" />
              <span className="text-xs font-semibold min-w-[40px]">
                {proposal.progress}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {proposal.progress}% {t("of_required_voters")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 min-w-[150px]">
        <span className="font-medium text-sm truncate max-w-[150px]">
          {proposal.submitter.firstname} {proposal.submitter.lastname}
        </span>
        <span className="text-xs text-muted-foreground">{t("submitter")}</span>
        {proposal.submitter.id !== user.id && !alreadyVoted ? (
          <Button size="sm" className="mt-2" onClick={onVoteNow}>
            {t("vote_now")}
          </Button>
        ) : alreadyVoted ? (
          <span className="text-green-600 text-xs font-semibold mt-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {t("already_voted")}
          </span>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-gray-400 text-xs font-semibold mt-2 cursor-not-allowed">
                {t("not_eligible")}
              </span>
            </TooltipTrigger>
            <TooltipContent>{t("not_eligible_reason")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default VotingCardRow;
