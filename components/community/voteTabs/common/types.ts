export type Contribution = {
  id: number;
  title: string;
  content: string;
  status: string;
  tag: "creation" | "enrichment";
  created_at: string;
  user: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
  community_posts_reviews?: Array<any>;
  original_content?: string;
  post_id?: number;
};

export interface VotingSessionProps {
  communityId: string;
}

export interface TopicProposal {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdBy: {
    name: string;
    profilePicture?: string;
  };
  createdAt: Date;
}

export interface Membership {
  isContributor: boolean;
  isCreator: boolean;
  isMember: boolean;
}

// Cache pour stocker les données
export const contributorsCache = new Map<
  string,
  { count: number; timestamp: number }
>();

// Cache pour stocker l'onglet actif
export const activeTabCache = new Map<
  string,
  { tab: string; timestamp: number }
>();

// Durée de validité du cache (2 minutes)
export const CACHE_DURATION = 2 * 60 * 1000;
