"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
    Users, MessageCircle, TrendingUp, Wallet, Settings,
    BarChart2, FileText, ChevronRight, Inbox
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ContributionsChart } from '@/components/shared/ContributionsChart';
import { SubscribersChart } from '@/components/shared/SubscribersChart';

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
        authorAvatar?: string;
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

interface ContributorRequest {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string;
    justification: string;
    expertiseDomain: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
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

    const [userId, setUserId] = useState<string | null>(null);
    const [contributorRequests, setContributorRequests] = useState<ContributorRequest[]>([]);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

    useEffect(() => {
        const userId = session?.user?.id;
        if (userId) {
            setUserId(userId);
        }
    }, [session]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}`);
                if (response.ok && userId) {
                    const data = await response.json();
                    if (data.creator_id !== parseInt(userId)) {
                        toast.error("Vous n'avez pas les permissions pour accéder à cette page");
                        console.log(data.creator_id, userId);
                        router.push(`/`);
                        return;
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        };

        fetchDashboardData();
    }, [userId, communityId, router]);


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

    useEffect(() => {
        const fetchContributorRequests = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}/contributor-requests`);
                if (response.ok) {
                    const data = await response.json();
                    setContributorRequests(data.requests);
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        };

        if (session?.user && communityId) {
            fetchContributorRequests();
        }
    }, [session, communityId]);

    const handleApproveRequest = async (requestId: number) => {
        try {
            const response = await fetch(`/api/communities/${communityId}/contributor-requests/${requestId}/approve`, {
                method: 'POST',
            });

            if (response.ok) {
                toast.success('Demande approuvée avec succès');
                // Filtrer la demande approuvée de la liste
                setContributorRequests(prev =>
                    prev.filter(req => req.id !== requestId)
                );
            } else {
                toast.error('Erreur lors de l\'approbation de la demande');
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Une erreur est survenue');
        }
    };

    const handleRejectClick = (requestId: number) => {
        setSelectedRequestId(requestId);
        setIsRejectModalOpen(true);
    };

    const handleRejectRequest = async () => {
        if (!selectedRequestId || !rejectionReason.trim()) return;

        try {
            const response = await fetch(`/api/communities/${communityId}/contributor-requests/${selectedRequestId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejection_reason: rejectionReason }),
            });

            if (response.ok) {
                toast.success('Demande refusée');
                setContributorRequests(prev =>
                    prev.map(req =>
                        req.id === selectedRequestId ? { ...req, status: 'rejected' } : req
                    )
                );
                setIsRejectModalOpen(false);
                setRejectionReason('');
                setSelectedRequestId(null);
            } else {
                toast.error('Erreur lors du refus de la demande');
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Une erreur est survenue');
        }
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!dashboardData) {
        return <div>Erreur lors du chargement des données</div>;
    }

    if (isLoading) {
        return <LoadingComponent />;
    }

    if (!isAuthenticated) {
        return null;
    }

    // Composant Sidebar
    const Sidebar = () => {
        return (
            <div className="w-64 min-h-screen bg-black border-r border-gray-800 rounded-r-xl">
                {/* Logo et nom de la communauté */}
                <div className="px-4 py-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full">
                            <Image
                                src={`https://${dashboardData.community.imageUrl}`}
                                alt={dashboardData.community.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">{dashboardData.community.name}</h2>
                            <p onClick={() => router.push(`/community/${communityId}`)} className="text-xs text-gray-400 hover:underline cursor-pointer">Voir la communauté</p>
                        </div>
                    </div>
                </div>

                {/* Sections de navigation */}
                <div className="p-4">
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-purple-400 uppercase mb-3">Surveillance</h3>
                        <div className="space-y-1">
                            <button
                                className={`flex items-center w-full p-2 rounded-lg font-bold ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-white'}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <span className="mr-3 text-lg">📊</span>
                                Tableau de bord
                                <ChevronRight className="ml-auto w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <button
                                className={`flex items-center w-full p-2 rounded-lg font-bold ${activeTab === 'members' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-white'}`}
                                onClick={() => setActiveTab('members')}
                            >
                                <span className="mr-3 text-lg">👥</span>
                                Membres
                                <ChevronRight className="ml-auto w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-gray-800 my-4" />

                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-purple-400 uppercase mb-3">Création</h3>
                        <div className="space-y-1">
                            <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-800 text-white hover:text-white font-bold">
                                <span className="mr-3 text-lg">📡</span>
                                Collecte et veille
                                <ChevronRight className="ml-auto w-5 h-5" />
                            </button>
                            <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-800 text-white hover:text-white font-bold">
                                <span className="mr-3 text-lg">✍️</span>
                                Création & édition
                                <ChevronRight className="ml-auto w-5 h-5" />
                            </button>
                            <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-800 text-white hover:text-white font-bold">
                                <span className="mr-3 text-lg">📢</span>
                                Publication & diffusion
                                <ChevronRight className="ml-auto w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-gray-800 my-4" />

                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-purple-400 uppercase mb-3">Communication</h3>
                        <div className="space-y-1">
                            <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-800 text-white font-bold">
                                <span className="mr-3 text-lg">💬</span>
                                Inbox
                                <ChevronRight className="ml-auto w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* En-tête */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-6">
                                Bienvenue {session?.user?.name} 👋
                            </h1>
                            {/* Titre et nom de la communauté plus petit */}
                            <div>
                                <h2 className="text-xl font-medium">
                                    Tableau de bord - {dashboardData.community.name}
                                </h2>
                                <p className="text-gray-600 pr-2">Aujourd'hui est un bon jour pour partager ton savoir !</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push(`/community/${communityId}/settings`)}
                            className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Paramètres
                        </button>
                    </div>

                    {/* Contenu principal */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Section Revenus et Audience */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Revenus générés */}
                                <Card className="p-6 rounded-3xl">
                                    <h3 className="text-lg font-semibold mb-4">Revenus générés</h3>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="p-4 bg-gray-800 rounded-lg text-white">
                                            <p className="text-sm">Revenus totaux</p>
                                            <p className="text-xl font-bold">{dashboardData.stats.revenue}</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-white">
                                            <p className="text-sm">Rev. mensuel</p>
                                            <p className="text-xl font-bold">1,250€</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-white">
                                            <p className="text-sm">Rev. par membre</p>
                                            <p className="text-xl font-bold">8.50€</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                        Analyser mes statistiques
                                    </button>
                                </Card>

                                {/* Audience et engagement */}
                                <Card className="p-6 rounded-3xl">
                                    <h3 className="text-lg font-semibold mb-4">Audience et engagement</h3>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="p-4 bg-gray-800 rounded-lg text-white">
                                            <p className="text-sm">Total membres</p>
                                            <p className="text-xl font-bold">{dashboardData.stats.totalMembers}</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-white">
                                            <p className="text-sm">Taux d'engagement</p>
                                            <p className="text-xl font-bold">{dashboardData.stats.engagementRate}%</p>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-white">
                                            <p className="text-sm">Posts/semaine</p>
                                            <p className="text-xl font-bold">12</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                        Analyser mes posts
                                    </button>
                                </Card>
                            </div>

                            {/* Statistiques détaillées par contenu */}
                            <Card className="p-6 rounded-3xl">
                                <h3 className="text-lg font-semibold mb-4">Statistiques détaillées par contenu</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th className="pb-3 font-semibold text-gray-600">Titre du contenu</th>
                                                <th className="pb-3 font-semibold text-gray-600">Type</th>
                                                <th className="pb-3 font-semibold text-gray-600">Vues</th>
                                                <th className="pb-3 font-semibold text-gray-600">Engagement</th>
                                                <th className="pb-3 font-semibold text-gray-600">Revenus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="py-4">Analyse quotidienne BTC/USD - 17/02/2024</td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                        Analyse
                                                    </span>
                                                </td>
                                                <td className="py-4">1,234</td>
                                                <td className="py-4">
                                                    <div className="flex items-center">
                                                        <span className="text-green-600">+12%</span>
                                                        <TrendingUp className="w-4 h-4 ml-1 text-green-600" />
                                                    </div>
                                                </td>
                                                <td className="py-4">45€</td>
                                            </tr>
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="py-4">Impact des élections US sur les marchés - Scénarios</td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                        Analyse macro
                                                    </span>
                                                </td>
                                                <td className="py-4">856</td>
                                                <td className="py-4">
                                                    <div className="flex items-center">
                                                        <span className="text-red-600">-3%</span>
                                                        <TrendingUp className="w-4 h-4 ml-1 text-red-600 transform rotate-180" />
                                                    </div>
                                                </td>
                                                <td className="py-4">28€</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="py-4">Setup trading : Double bottom sur ETH/USD</td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                        Signal
                                                    </span>
                                                </td>
                                                <td className="py-4">567</td>
                                                <td className="py-4">
                                                    <div className="flex items-center">
                                                        <span className="text-green-600">+8%</span>
                                                        <TrendingUp className="w-4 h-4 ml-1 text-green-600" />
                                                    </div>
                                                </td>
                                                <td className="py-4">32€</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Section graphiques */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Graphique Contributions */}
                                <Card className="p-6 rounded-3xl">
                                    <h3 className="text-lg font-semibold mb-4">Contributions</h3>
                                    <ContributionsChart
                                        data={{ active: 65, pending: 35 }}
                                    />
                                </Card>

                                {/* Graphique Évolution des abonnés */}
                                <Card className="p-6 rounded-3xl">
                                    <h3 className="text-lg font-semibold mb-4">Évolution des abonnés</h3>
                                    <SubscribersChart
                                        data={{
                                            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                                            values: [120, 450, 280, 190, 300, 250, 180, 220, 350, 200, 150, 280]
                                        }}
                                    />
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            <Card className="p-6 bg-white shadow-sm rounded-3xl">
                                {members.length === 0 ? (
                                    <div className="text-center text-gray-500">Aucun membre trouvé</div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Membres de la communauté</h3>
                                        </div>
                                        {/* En-tête de la grille */}
                                        <div className="grid grid-cols-8 items-center p-4 text-base font-medium text-gray-500 border-b justify-items-center">
                                            <div className="col-span-2">Membre</div>
                                            <div>Statut</div>
                                            <div>Date d&apos;inscription</div>
                                            <div>Révisions</div>
                                            <div>Posts</div>
                                            <div>Gains</div>
                                            <div className="text-center">Actions</div>
                                        </div>
                                        <div className="space-y-2">
                                            {members.map((member, index) => (
                                                <div key={index} className="grid grid-cols-8 items-center p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors justify-items-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
                                                        <Image
                                                            src={member.profilePicture}
                                                            alt={member.fullName}
                                                            className="w-full h-full object-cover"
                                                            width={48}
                                                            height={48}
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
                                    </>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Justification du refus</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Veuillez expliquer la raison du refus..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter className="flex space-x-2">
                        <button
                            onClick={() => setIsRejectModalOpen(false)}
                            className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleRejectRequest}
                            disabled={!rejectionReason.trim()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirmer le refus
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 