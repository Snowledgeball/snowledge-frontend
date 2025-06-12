import { User } from "./user";

export type Proposal = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  endedAt: Date;
  progress: number;
  participationLevel: ParticipationLevel;
  submitter: User;
  quorum: { current: number; required: number };
  format?: string;
  status: "in_progress" | "accepted" | "rejected";
  reason?: "by_vote" | "by_expiration" | null;
  deadline: Date;
};

type ParticipationLevel = "low" | "medium" | "high";
