import { Community } from "./community";
import { User } from "./user";

export type Learner = {
  id: number;
  userId: number;
  communityId: number;
  status: "member" | "invited" | "banned" | "invitation_rejected";
  isContributor: boolean;
  user: User;
  community: Community;
  invitedAt: Date;
  created_at: Date;
  updated_at: Date;
};
