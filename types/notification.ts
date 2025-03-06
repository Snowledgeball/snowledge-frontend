export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date | string;
  link?: string;
  metadata?: {
    communityId?: string;
    postId?: string;
    creatorId?: string;
  };
}

export enum NotificationType {
  NEW_POST = "new_post",
  NEW_POST_PENDING = "new_post_pending",
  CONTRIBUTION_SUBMITTED = "contribution_submitted",
  CONTRIBUTION_APPROVED = "contribution_approved",
  CONTRIBUTION_REJECTED = "contribution_rejected",
  COMMENT_ON_POST = "comment_on_post",
  REPLY_TO_COMMENT = "reply_to_comment",
  MENTION = "mention",
  COMMUNITY_INVITATION = "community_invitation",
  ROLE_CHANGE = "role_change",
  BAN = "ban",
  CONTRIBUTOR_ACCEPTED = "contributor_accepted",
  CONTRIBUTOR_REFUSED = "contributor_refused",
}
