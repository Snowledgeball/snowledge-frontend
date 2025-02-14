export interface Community {
    [x: string]: any;
    id: number;
    name: string;
    description: string;
    category: string;
    role: string;
    joinDate: string;
    contributionsCount: number;
    creator: {
        creator_id: number;
    };
    recentActivity: {
        type: string;
        title: string;
        date: string;
        engagement: number;
    }[];
    revenue: string;
} 