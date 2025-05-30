import { User } from "./user";

export type Proposal = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  endDate: Date;
  progress: number;
  participationLevel: ParticipationLevel;
  submitter: User;
  alreadyVoted: boolean;
  quorum: { current: number; required: number };
  format?: string;
};

type ParticipationLevel = "low" | "medium" | "high";
