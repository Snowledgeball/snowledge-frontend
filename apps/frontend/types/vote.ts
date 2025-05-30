export type Vote = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  endDate: Date;
  progress: number;
  participationLevel: ParticipationLevel;
  submitter: { name: string; avatarUrl: string; profileUrl: string };
  eligible: boolean;
  alreadyVoted: boolean;
  quorum: { current: number; required: number };
  format?: string;
};

type ParticipationLevel = "low" | "medium" | "high";
