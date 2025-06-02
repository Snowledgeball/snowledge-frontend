import { Proposal } from "./proposal";
import { User } from "./user";

export type Vote = {
  id: number;
  proposalId: number;
  userId: number;
  choice: VoteFormat;
  comment?: string;
  formatChoice?: VoteFormat;
  formatComment?: string;
  createdAt: string;
  updatedAt: string;
  proposal: Proposal;
  user: User;
};
type VoteFormat = "for" | "against";
