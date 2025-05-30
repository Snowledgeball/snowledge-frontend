import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Progress } from "@repo/ui/components/progress";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/avatar";
import {
  Info,
  Flame,
  Clock,
  CheckCircle,
  Check,
  X,
  FileText,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import type { Proposal } from "@/types/proposal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/tooltip";
import { formatDistanceToNow, formatDistance } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { fr, enUS } from "date-fns/locale";

// ============
// Function: VoteScreen
// ------------
// DESCRIPTION: Displays all info about a vote, allows user to vote for/against, leave feedback, and submit.
// PARAMS: vote: Vote (the selected vote object)
// RETURNS: JSX.Element (the vote screen UI)
// ============

const getProgressColor = (progress: number, daysLeft: number) => {
  if (progress >= 100) return "bg-green-500";
  if (progress >= 70) return "bg-green-400";
  if (progress >= 50) return "bg-orange-400";
  if (daysLeft <= 1 && progress < 100) return "bg-red-500";
  return "bg-gray-300";
};

// ============
// Function: getFormatIconAndLabel
// ------------
// DESCRIPTION: Returns the icon (JSX) and label for a given format.
// PARAMS: format: string (the vote format)
// RETURNS: { icon: JSX.Element, label: string }
// ============
const getFormatIconAndLabel = (format?: string) => {
  if (!format) return null;
  switch (format.toLowerCase()) {
    case "masterclass":
      return {
        icon: <GraduationCap className="mr-2 w-4 h-4 text-indigo-500" />,
        label: "Masterclass",
      };
    case "white paper":
      return {
        icon: <BookOpen className="mr-2 w-4 h-4 text-emerald-600" />,
        label: "White paper",
      };
    default:
      return {
        icon: <FileText className="mr-2 w-4 h-4 text-muted-foreground" />,
        label: format.charAt(0).toUpperCase() + format.slice(1),
      };
  }
};

function VoteScreen({
  proposal,
  onBack,
}: {
  proposal: Proposal;
  onBack?: () => void;
}) {
  const t = useTranslations("voting");
  const [choice, setChoice] = useState<"for" | "against" | null>(null);
  const [formatChoice, setFormatChoice] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [formatFeedback, setFormatFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormatSubmitting, setIsFormatSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formatError, setFormatError] = useState("");

  const locale = useLocale();
  const dateFnsLocale = locale === "fr" ? fr : enUS;

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

  const isQuorumReached = proposal.progress >= 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!choice) {
      setError("Please select For or Against for the subject.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setFeedback("");
    }, 1200);
  };

  const handleFormatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormatError("");
    setFormatSuccess(false);
    if (formatChoice === null) {
      setFormatError("Please select Yes or No for the format.");
      return;
    }
    setIsFormatSubmitting(true);
    setTimeout(() => {
      setIsFormatSubmitting(false);
      setFormatSuccess(true);
      setFormatFeedback("");
    }, 1200);
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <header className="pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold truncate">{proposal.title}</h1>
          {isQuorumReached && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
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
          <span className="font-medium text-sm truncate max-w-[80px]">
            {proposal.submitter.firstname} {proposal.submitter.lastname}
          </span>

          <span className="text-xs text-muted-foreground">
            {t("submitter")}
          </span>
        </div>
      </header>
      {/* Bloc 1 : Vote pour le sujet */}
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
        aria-label={t("vote_for_subject")}
      >
        <div className="font-semibold text-base mb-1">
          {t("vote_for_subject")}
        </div>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={choice === "for" ? "default" : "outline"}
            className={
              choice === "for"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : ""
            }
            onClick={() => setChoice("for")}
            aria-pressed={choice === "for"}
            aria-label={t("vote_for")}
          >
            <Check className="mr-2 w-4 h-4" />
            {t("for")}
          </Button>
          <Button
            type="button"
            variant={choice === "against" ? "default" : "outline"}
            className={
              choice === "against"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : ""
            }
            onClick={() => setChoice("against")}
            aria-pressed={choice === "against"}
            aria-label={t("vote_against")}
          >
            <X className="mr-2 w-4 h-4" />
            {t("against")}
          </Button>
        </div>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t("leave_comment_optional")}
          aria-label={t("feedback_on_choice")}
          maxLength={400}
          className="min-h-[80px]"
        />
        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {t(error)}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm" role="status">
            {t("vote_submitted_success")}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!choice || isSubmitting}
            aria-disabled={!choice || isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit_my_vote")}
          </Button>
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              aria-label={t("back_to_list")}
            >
              {t("back")}
            </Button>
          )}
        </div>
      </form>
      {/* Bloc 2 : Vote pour le format */}
      {proposal.format && (
        <form
          className="flex flex-col gap-6 border-t pt-6"
          onSubmit={handleFormatSubmit}
          aria-label={t("vote_for_format")}
        >
          <div className="font-semibold text-base mb-1 flex items-center gap-2">
            {t("vote_for_format")}
            {(() => {
              const info = getFormatIconAndLabel(proposal.format);
              return info ? info.icon : null;
            })()}
            <span className="text-sm font-normal text-muted-foreground">
              {(() => {
                const info = getFormatIconAndLabel(proposal.format);
                return info ? info.label : proposal.format;
              })()}
            </span>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={formatChoice === true ? "default" : "outline"}
              className={
                formatChoice === true
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : ""
              }
              onClick={() => setFormatChoice(true)}
              aria-pressed={formatChoice === true}
              aria-label={t("yes_for_format")}
            >
              <Check className="mr-2 w-4 h-4" />
              {t("yes")}
            </Button>
            <Button
              type="button"
              variant={formatChoice === false ? "default" : "outline"}
              className={
                formatChoice === false
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : ""
              }
              onClick={() => setFormatChoice(false)}
              aria-pressed={formatChoice === false}
              aria-label={t("no_for_format")}
            >
              <X className="mr-2 w-4 h-4" />
              {t("no")}
            </Button>
          </div>
          <Textarea
            value={formatFeedback}
            onChange={(e) => setFormatFeedback(e.target.value)}
            placeholder={t("leave_comment_format_optional")}
            aria-label={t("feedback_on_format")}
            maxLength={400}
            className="min-h-[80px]"
          />
          {formatError && (
            <div className="text-red-500 text-sm" role="alert">
              {t(formatError)}
            </div>
          )}
          {formatSuccess && (
            <div className="text-green-600 text-sm" role="status">
              {t("format_vote_submitted_success")}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={formatChoice === null || isFormatSubmitting}
              aria-disabled={formatChoice === null || isFormatSubmitting}
            >
              {isFormatSubmitting ? t("submitting") : t("submit_format_vote")}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

export default VoteScreen;
