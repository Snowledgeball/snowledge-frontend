export interface Community {
    id: string;
    name: string;
    role: string;
    joinDate: string;
    contributionsCount: number;
    recentActivity: {
        type: string;
        title: string;
        date: string;
        engagement: number;
    }[];
    revenue: string;
} 