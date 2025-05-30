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
};
type VoteFormat = "for" | "against";
