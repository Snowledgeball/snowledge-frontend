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
        id: number;
        fullName: string;
        userName: string;
        profilePicture: string;
    };
    recentActivity: {
        type: string;
        title: string;
        date: string;
        engagement: number;
    }[];
    revenue: string;
} 