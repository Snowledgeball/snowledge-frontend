import { Card, CardContent } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/tooltip";
import {
  Info,
  Flame,
  Clock,
  CheckCircle,
  FileText,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

// ============
// Function: VotingCardRow
// ------------
// DESCRIPTION: Displays a single vote as a data card row with all required info and actions.
// PARAMS: vote: {
//   id: string,
//   title: string,
//   description: string,
//   startDate: Date,
//   endDate: Date,
//   progress: number,
//   participationLevel: 'low' | 'medium' | 'high',
//   submitter: { name: string, avatarUrl: string, profileUrl: string },
//   eligible: boolean,
//   alreadyVoted: boolean,
//   quorum: { current: number, required: number },
// }
// RETURNS: JSX.Element (the voting card row UI)
// ============

import { formatDistanceToNow, formatDistance } from "date-fns";

type ParticipationLevel = "low" | "medium" | "high";

interface Vote {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  participationLevel: ParticipationLevel;
  submitter: { name: string; avatarUrl: string; profileUrl: string };
  eligible: boolean;
  alreadyVoted: boolean;
  quorum: { current: number; required: number };
  format?: string;
}

const getProgressColor = (progress: number, daysLeft: number) => {
  if (progress >= 100) return "bg-green-500";
  if (progress >= 70) return "bg-green-400";
  if (progress >= 50) return "bg-orange-400";
  if (daysLeft <= 1 && progress < 100) return "bg-red-500";
  return "bg-gray-300";
};

interface VotingCardRowProps {
  vote: Vote;
  onVoteNow?: () => void;
}

// ============
// Function: getFormatIconAndLabel
// ------------
// DESCRIPTION: Returns the icon (JSX) and label for a given format.
// PARAMS: format: string (the vote format)
// RETURNS: { icon: JSX.Element, label: string }
// ============
export const getFormatIconAndLabel = (format?: string) => {
  if (!format) return null;
  switch (format.toLowerCase()) {
    case "masterclass":
      return {
        icon: <GraduationCap className="w-4 h-4 text-indigo-500" />,
        label: "Masterclass",
      };
    case "white paper":
      return {
        icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
        label: "White paper",
      };
    default:
      return {
        icon: <FileText className="w-4 h-4 text-muted-foreground" />,
        label: format.charAt(0).toUpperCase() + format.slice(1),
      };
  }
};

const VotingCardRow = ({ vote, onVoteNow }: VotingCardRowProps) => {
  const t = useTranslations("voting");
  const now = new Date();
  const daysLeft = Math.ceil(
    (vote.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const startedAgo = formatDistanceToNow(vote.startDate, { addSuffix: true });
  const endsIn = formatDistance(vote.endDate, now, { addSuffix: true });
  const progressColor = getProgressColor(vote.progress, daysLeft);
  const isQuorumReached = vote.progress >= 100;
  const formatInfo = getFormatIconAndLabel(vote.format);

  return (
    <Card className="flex flex-col md:flex-row items-center gap-4 p-4 shadow-md border border-muted-foreground/10">
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="font-bold text-lg hover:underline truncate"
            tabIndex={0}
            aria-label={t("view_details", { title: vote.title })}
          >
            {vote.title}
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
          {vote.description.length > 150 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-xs cursor-pointer">
                  {vote.description.slice(0, 150) + "…"}
                </span>
              </TooltipTrigger>
              <TooltipContent>{vote.description}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="truncate max-w-xs">{vote.description}</span>
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
            <span>
              {endsIn.replace("in ", "")} {t("left")}
            </span>
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
                {vote.quorum.current} / {vote.quorum.required} {t("required")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={vote.progress} className="w-40 h-2" />
              <span className="text-xs font-semibold min-w-[40px]">
                {vote.progress}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {vote.progress}% {t("of_required_voters")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 min-w-[120px]">
        <Link
          href={vote.submitter.profileUrl}
          className="flex items-center gap-2 hover:underline"
          tabIndex={0}
          aria-label={t("view_profile", { name: vote.submitter.name })}
        >
          <Avatar>
            <AvatarImage
              src={vote.submitter.avatarUrl}
              alt={vote.submitter.name}
            />
            <AvatarFallback>{vote.submitter.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm truncate max-w-[80px]">
            {vote.submitter.name}
          </span>
        </Link>
        <span className="text-xs text-muted-foreground">{t("submitter")}</span>
        {vote.eligible && !vote.alreadyVoted ? (
          <Button size="sm" className="mt-2" onClick={onVoteNow}>
            {t("vote_now")}
          </Button>
        ) : vote.alreadyVoted ? (
          <span className="text-green-600 text-xs font-semibold mt-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {t("already_voted")}
          </span>
        ) : (
          <span className="text-gray-400 text-xs font-semibold mt-2">
            {t("not_eligible")}
          </span>
        )}
      </div>
    </Card>
  );
};

export default VotingCardRow;

export type { Vote };
