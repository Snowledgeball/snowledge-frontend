export interface Community {
    [x: string]: any;
    id: number;
    name: string;
    description: string;
    category: string;
    image_url: string;
    joinDate: string;
    contributionsCount: number;
    creator: {
        id: number;
        fullName: string;
    };
    recentActivity: {
        type: string;
        title: string;
        date: string;
        engagement: number;
    }[];
    revenue: string;
    community_presentation: {
        video_url: string;
        topic_details: string;
        code_of_conduct: string;
        disclaimers: string;
    };
    community_posts: {
        id: number;
        title: string;
        content: string;
        cover_image_url: string;
        tag: string;
    }[];
    community_contributors: {
        contributor_id: number;
    }[];
    community_learners: {
        learner_id: number;
    }[];
}