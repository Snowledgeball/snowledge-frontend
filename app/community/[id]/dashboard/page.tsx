"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
    Users, MessageCircle, TrendingUp, Wallet, Settings,
    BarChart2, FileText, ChevronRight
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface DashboardData {
    stats: {
        totalMembers: number;
        membersTrend: string;
        totalPosts: number;
        postsTrend: string;
        engagementRate: number;
        engagementTrend: string;
        revenue: string;
        revenueTrend: string;
    };
    recentActivity: {
        id: number;
        type: string;
        text: string;
        author: string;
        engagement: number;
        time: string;
    }[];
    community: {
        id: number;
        name: string;
        description: string;
        imageUrl: string | null;
    };
}

interface Member {
    id: number;
    fullName: string;
    userName: string;
    profilePicture: string;
    status: 'Contributeur' | 'Apprenant';
    joinedAt: string | Date | null;
    revisions: number;
    posts: number;
    gains: number;
}

export default function CommunityDashboard() {
    const router = useRouter();
    const params = useParams();

    const communityId = params.id;
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();

    if (isLoading) {
        return <LoadingComponent />;
    }

    if (!isAuthenticated) {
        return null;
    }

    useEffect(() => {
        const fetchMembers = async () => {
            if (activeTab === 'members') {

                try {
                    const response = await fetch(`/api/communities/${communityId}/members`);
                    if (response.ok) {
                        const data = await response.json();
                        setMembers(data);
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des membres:', error);
                }
            }
        };

        fetchMembers();
    }, [activeTab, communityId]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}/dashboard`);
                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                } else {
                    console.error('Erreur lors de la récupération des données');
                }
            } catch (error) {
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user && communityId) {
            fetchDashboardData();
        }
    }, [session, communityId]);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!dashboardData) {
        return <div>Erreur lors du chargement des données</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* En-tête */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Tableau de bord - {dashboardData.community.name}
                        </h1>
                        <p className="text-gray-600">{dashboardData.community.description}</p>
                    </div>
                    <button
                        onClick={() => router.push(`/community/${communityId}/settings`)}
                        className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Paramètres
                    </button>
                </div>

                {/* Navigation */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart2 },
                            { id: 'members', label: 'Membres', icon: Users },
                            { id: 'content', label: 'Contenu', icon: FileText },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200 
                                    ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenu principal */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Statistiques principales */}
                        <div className="grid grid-cols-4 gap-6">
                            {[
                                {
                                    label: "Membres totaux",
                                    value: dashboardData.stats.totalMembers,
                                    trend: dashboardData.stats.membersTrend,
                                    icon: Users,
                                    color: "text-blue-500"
                                },
                                {
                                    label: "Posts",
                                    value: dashboardData.stats.totalPosts,
                                    trend: dashboardData.stats.postsTrend,
                                    icon: MessageCircle,
                                    color: "text-green-500"
                                },
                                {
                                    label: "Engagement",
                                    value: `${dashboardData.stats.engagementRate}%`,
                                    trend: dashboardData.stats.engagementTrend,
                                    icon: TrendingUp,
                                    color: "text-purple-500"
                                },
                                {
                                    label: "Revenus du mois",
                                    value: dashboardData.stats.revenue,
                                    trend: dashboardData.stats.revenueTrend,
                                    icon: Wallet,
                                    color: "text-amber-500"
                                },
                            ].map((stat, index) => (
                                <Card key={index} className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color} bg-gray-50`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-sm font-medium ${parseFloat(stat.trend) > 0 ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <p className="text-gray-600 text-sm">{stat.label}</p>
                                </Card>
                            ))}
                        </div>

                        {/* Activité récente */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                            <div className="space-y-4">
                                {dashboardData.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <FileText className="w-4 h-4 text-green-500 mr-3" />
                                            <div>
                                                <span className="text-gray-700">{activity.text}</span>
                                                <p className="text-sm text-gray-500">
                                                    par {activity.author} • {activity.engagement} interactions
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(activity.time).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-6">
                        <Card className="p-6 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Membres de la communauté</h3>
                            </div>
                            {/* En-tête de la grille */}
                            <div className="grid grid-cols-8 items-center p-4 text-base font-medium text-gray-500 border-b justify-items-center">
                                <div className="col-span-2">Membre</div>
                                <div>Statut</div>
                                <div>Date d'inscription</div>
                                <div>Révisions</div>
                                <div>Posts</div>
                                <div>Gains</div>
                                <div className="text-center">Actions</div>
                            </div>
                            <div className="space-y-2">

                                {members.map((member, index) => (
                                    <div key={index} className="grid grid-cols-8 items-center p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors justify-items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
                                            <img
                                                src={member.profilePicture}
                                                alt={member.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-gray-900">{member.fullName}</p>
                                            <p className="text-sm text-gray-500">@{member.userName}</p>
                                        </div>

                                        <div>
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${member.status === 'Contributeur'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {member.status}
                                            </span>
                                        </div>
                                        <div className="text-base text-gray-600">
                                            {member.joinedAt ?
                                                new Date(member.joinedAt).toLocaleDateString('fr-FR')
                                                : 'Date inconnue'
                                            }
                                        </div>
                                        <div className="text-base text-gray-600">{member.revisions} révisions</div>
                                        <div className="text-base text-gray-600">{member.posts} posts</div>
                                        <div className="text-base font-medium text-gray-900">{member.gains}€</div>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors justify-self-center">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>

                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
} 