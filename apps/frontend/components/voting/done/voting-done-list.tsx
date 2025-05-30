import { Card } from "@repo/ui/components/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/avatar";
import { CheckCircle, XCircle, Clock, Flame } from "lucide-react";
import {
  getFormatIconAndLabel,
  type Vote,
} from "@/components/voting/shared/voting-card-row";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

// ============
// Function: VotingDoneList
// ------------
// DESCRIPTION: Displays a list of finished votes (validated or invalidated), with reason (vote or expiration) and metrics.
// PARAMS: None (uses mock data for now)
// RETURNS: JSX.Element (the done voting list UI)
// ============

const doneVotes: (Vote & {
  status: "validated" | "invalidated";
  reason: "vote" | "expiration";
  finalResult: "accepted" | "rejected";
  endDate: Date;
})[] = [
  {
    id: "1",
    title: "Automation Strategies for Small Businesses",
    description:
      "Exploring how automation tools can save time, reduce errors, and scale operations — from CRM to marketing workflows.",
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    progress: 100,
    participationLevel: "high",
    submitter: {
      name: "Alice Johnson",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      profileUrl: "#",
    },
    eligible: true,
    alreadyVoted: true,
    quorum: { current: 72, required: 70 },
    format: "masterclass",
    status: "validated",
    reason: "vote",
    finalResult: "accepted",
  },
  {
    id: "2",
    title: "Building a Personal Brand as a Knowledge Worker",
    description:
      "Understanding the key elements of visibility, credibility, and community-building to grow your audience and influence.",
    startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    progress: 60,
    participationLevel: "medium",
    submitter: {
      name: "Bob Smith",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      profileUrl: "#",
    },
    eligible: false,
    alreadyVoted: false,
    quorum: { current: 42, required: 70 },
    format: "white paper",
    status: "invalidated",
    reason: "expiration",
    finalResult: "rejected",
  },
  {
    id: "3",
    title: "Structuring and Pricing Online Services Effectively",
    description:
      "Investigating best practices to package, price, and position digital services for freelancers, consultants, and creators.",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    progress: 100,
    participationLevel: "high",
    submitter: {
      name: "Carol Lee",
      avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      profileUrl: "#",
    },
    eligible: true,
    alreadyVoted: true,
    quorum: { current: 75, required: 70 },
    format: "masterclass",
    status: "validated",
    reason: "vote",
    finalResult: "accepted",
  },
];

const STATUS_LABELS = {
  validated: {
    label: "Validated",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
  invalidated: {
    label: "Invalidated",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="w-4 h-4 text-red-500" />,
  },
};

const REASON_LABELS = {
  vote: {
    label: "By vote",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
  expiration: {
    label: "By expiration",
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
  },
};

const PARTICIPATION_LABELS = {
  low: {
    label: "Low",
    color: "bg-gray-400",
    icon: <Flame className="w-4 h-4 text-gray-400" />,
  },
  medium: {
    label: "Medium",
    color: "bg-orange-400",
    icon: <Flame className="w-4 h-4 text-orange-400" />,
  },
  high: {
    label: "High",
    color: "bg-green-500",
    icon: <Flame className="w-4 h-4 text-green-500" />,
  },
};

const VotingDoneList = () => {
  return (
    <div className="flex flex-col gap-6">
      {doneVotes.map((vote) => {
        const formatInfo = getFormatIconAndLabel(vote.format);
        const status = STATUS_LABELS[vote.status];
        const reason = REASON_LABELS[vote.reason];
        const participation = PARTICIPATION_LABELS[vote.participationLevel];
        return (
          <Card
            key={vote.id}
            className="flex flex-col md:flex-row items-center gap-4 p-4 border border-muted-foreground/10"
          >
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg truncate">{vote.title}</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ml-2 ${status.color}`}
                >
                  {status.icon}
                  {status.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ml-2 bg-muted text-muted-foreground border border-muted-foreground/10">
                  {reason.icon}
                  {reason.label}
                </span>
              </div>
              {formatInfo && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-1 border border-muted-foreground/10">
                  {formatInfo.icon}
                  {formatInfo.label}
                </span>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate max-w-xs">{vote.description}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span>
                  Ended {formatDistanceToNow(vote.endDate, { addSuffix: true })}
                </span>
                <span className="mx-1">–</span>
                <span className="flex items-center gap-1">
                  Quorum:{" "}
                  <span className="font-semibold">
                    {vote.quorum.current} / {vote.quorum.required}
                  </span>
                </span>
                <span className="mx-1">–</span>
                <span className="flex items-center gap-1">
                  Participation: {participation.icon}
                  <span className="font-semibold">{vote.progress}%</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
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
          </Card>
        );
      })}
    </div>
  );
};

export default VotingDoneList;
