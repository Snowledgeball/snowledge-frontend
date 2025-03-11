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
  COMMENT_ON_POST = "comment_on_post",
  REPLY_TO_COMMENT = "reply_to_comment",
  MENTION = "mention",
  COMMUNITY_INVITATION = "community_invitation",
  ROLE_CHANGE = "role_change",
  BAN = "ban",
  FEEDBACK = "feedback",
  APPROVAL = "approval",
  WARNING = "warning",
  INFO = "info",

  CONTRIBUTOR_ACCEPTED = "contributor_accepted",
  CONTRIBUTOR_REFUSED = "contributor_refused",
  CONTRIBUTOR_REQUEST = "contributor_request",

  NEW_POST_PENDING = "new_post_pending",
  POST_READY_PUBLISH = "post_ready_publish",
  POST_REJECTED = "post_rejected",

  NEW_ENRICHMENT_PENDING = "new_enrichment_pending",
  ENRICHMENT_UPDATED = "enrichment_updated",
  ENRICHMENT_APPROVED = "enrichment_approved",
  ENRICHMENT_REJECTED = "enrichment_rejected",
  REVIEW_VOTE = "review_vote",

}
