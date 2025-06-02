import { Progress } from "@repo/ui/components/progress";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/tooltip";
import { Info, Clock, CheckCircle } from "lucide-react";
import type { Proposal } from "@/types/proposal";
import { useProposalDates } from "@/components/voting/shared/hooks/useProposalDates";

function ProposalHeader({ proposal, t }: { proposal: Proposal; t: any }) {
  const { startedAgo, endsIn } = useProposalDates(proposal);
  const isQuorumReached = proposal.progress >= 100;
  return (
    <header className="pt-4 pb-2">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-2xl font-bold truncate">{proposal.title}</h1>
        {isQuorumReached && <CheckCircle className="w-5 h-5 text-green-500" />}
      </div>
      <p className="text-muted-foreground max-w-xl mb-2">
        {proposal.description}
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
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
      <div className="flex flex-col gap-1 mb-2">
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
      <div className="flex items-center gap-2 mt-2">
        <span className="font-medium text-sm truncate max-w-[120px]">
          {proposal.submitter.firstname} {proposal.submitter.lastname}
        </span>
        <span className="text-xs text-muted-foreground">{t("submitter")}</span>
      </div>
    </header>
  );
}
export default ProposalHeader;
