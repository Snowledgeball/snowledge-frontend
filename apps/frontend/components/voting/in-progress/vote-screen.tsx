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
import Link from "next/link";
import type { Vote } from "@/components/voting/shared/voting-card-row";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/tooltip";
import { formatDistanceToNow, formatDistance } from "date-fns";

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

function VoteScreen({ vote, onBack }: { vote: Vote; onBack?: () => void }) {
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

  const now = new Date();
  const daysLeft = Math.ceil(
    (vote.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const startedAgo = formatDistanceToNow(vote.startDate, { addSuffix: true });
  const endsIn = formatDistance(vote.endDate, now, { addSuffix: true });
  const progressColor = getProgressColor(vote.progress, daysLeft);
  const isQuorumReached = vote.progress >= 100;

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
          <h1 className="text-2xl font-bold truncate">{vote.title}</h1>
          {isQuorumReached && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
        <p className="text-muted-foreground max-w-xl mb-2">
          {vote.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <Clock className="w-4 h-4" />
          <span>Started {startedAgo}</span>
          <span className="mx-1">–</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{endsIn.replace("in ", "")} left</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Completion</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                Percentage of required voters who have participated.
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-muted-foreground">
              {vote.quorum.current} / {vote.quorum.required} required
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={vote.progress} className="w-40 h-2" />
            <span className="text-xs font-semibold min-w-[40px]">
              {vote.progress}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {vote.progress}% of required voters have participated
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Link
            href={vote.submitter.profileUrl}
            className="flex items-center gap-2 hover:underline"
            tabIndex={0}
            aria-label={`View profile of ${vote.submitter.name}`}
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
          <span className="text-xs text-muted-foreground">Submitter</span>
        </div>
      </header>
      {/* Bloc 1 : Vote pour le sujet */}
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit}
        aria-label="Vote for this subject"
      >
        <div className="font-semibold text-base mb-1">Vote for the subject</div>
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
            aria-label="Vote for"
          >
            <Check className="mr-2 w-4 h-4" />
            For
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
            aria-label="Vote against"
          >
            <X className="mr-2 w-4 h-4" />
            Against
          </Button>
        </div>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Leave a comment (optional)"
          aria-label="Feedback on your choice"
          maxLength={400}
          className="min-h-[80px]"
        />
        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm" role="status">
            Vote submitted successfully!
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!choice || isSubmitting}
            aria-disabled={!choice || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit my vote"}
          </Button>
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              aria-label="Back to list"
            >
              Back
            </Button>
          )}
        </div>
      </form>
      {/* Bloc 2 : Vote pour le format */}
      {vote.format && (
        <form
          className="flex flex-col gap-6 border-t pt-6"
          onSubmit={handleFormatSubmit}
          aria-label="Vote for the format"
        >
          <div className="font-semibold text-base mb-1 flex items-center gap-2">
            Vote for the format
            {(() => {
              const info = getFormatIconAndLabel(vote.format);
              return info ? info.icon : null;
            })()}
            <span className="text-sm font-normal text-muted-foreground">
              {(() => {
                const info = getFormatIconAndLabel(vote.format);
                return info ? info.label : vote.format;
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
              aria-label="Yes for format"
            >
              <Check className="mr-2 w-4 h-4" />
              Yes
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
              aria-label="No for format"
            >
              <X className="mr-2 w-4 h-4" />
              No
            </Button>
          </div>
          <Textarea
            value={formatFeedback}
            onChange={(e) => setFormatFeedback(e.target.value)}
            placeholder="Leave a comment about the format (optional)"
            aria-label="Feedback on the format"
            maxLength={400}
            className="min-h-[80px]"
          />
          {formatError && (
            <div className="text-red-500 text-sm" role="alert">
              {formatError}
            </div>
          )}
          {formatSuccess && (
            <div className="text-green-600 text-sm" role="status">
              Format vote submitted successfully!
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={formatChoice === null || isFormatSubmitting}
              aria-disabled={formatChoice === null || isFormatSubmitting}
            >
              {isFormatSubmitting ? "Submitting..." : "Submit format vote"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

export default VoteScreen;
