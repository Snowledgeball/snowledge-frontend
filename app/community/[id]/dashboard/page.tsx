"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
    Users, MessageCircle, TrendingUp, Wallet, Settings,
    BarChart2, FileText, ChevronRight, Inbox,
    Rss, Search, Bookmark, PinIcon, Link2,
    NotebookPen, Hash, Globe, BookMarked, ArrowUpRight,
    ImageIcon, Eye, PenTool
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ContributionsChart } from '@/components/shared/ContributionsChart';
import { SubscribersChart } from '@/components/shared/SubscribersChart';
import { Editor } from '@tinymce/tinymce-react';
import TinyEditor from "@/components/shared/TinyEditor";
import { Switch } from "@/components/ui/switch";

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

interface RssFeed {
    id: number;
    title: string;
    source: string;
    date: string;
    thumbnail: string;
    category: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
    type: 'Analyse technique' | 'News' | 'Rapports' | 'Brouillons';
}

const POST_TAGS = [
    { value: 'analyse-technique', label: 'Analyse Technique' },
    { value: 'analyse-macro', label: 'Analyse Macro' },
    { value: 'defi', label: 'DeFi' },
    { value: 'news', label: 'News' },
    { value: 'education', label: 'Éducation' },
    { value: 'trading', label: 'Trading' }
];

const POST_EMOJIS = [
    { value: '📊', label: 'Graphique' },
    { value: '📈', label: 'Tendance' },
    { value: '💡', label: 'Idée' },
    { value: '🔍', label: 'Analyse' },
    { value: '📰', label: 'News' },
    { value: '💰', label: 'Finance' }
];

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
    const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([
        {
            id: 1,
            title: "Bitcoin atteint un nouveau record historique",
            source: "CoinDesk",
            date: "Il y a 2h",
            thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
            category: "Crypto"
        },
        {
            id: 2,
            title: "La Fed maintient ses taux directeurs",
            source: "Bloomberg",
            date: "Il y a 4h",
            thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
            category: "Macro"
        },
        {
            id: 3,
            title: "Ethereum 2.0 : Les développeurs annoncent une mise à jour majeure",
            source: "CryptoNews",
            date: "Il y a 8h",
            thumbnail: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05",
            category: "Crypto"
        },
        {
            id: 4,
            title: "L'inflation en zone euro atteint son plus bas niveau depuis 2021",
            source: "Financial Times",
            date: "Il y a 12h",
            thumbnail: "https://images.unsplash.com/photo-1574607383476-f517f260d30b",
            category: "Macro"
        },
        {
            id: 5,
            title: "Microsoft dévoile sa nouvelle stratégie IA pour 2024",
            source: "TechCrunch",
            date: "Il y a 14h",
            thumbnail: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec",
            category: "Tech"
        }
    ]);
    const [posts, setPosts] = useState<Post[]>([
        { id: 1, title: 'Post 1', content: '', type: 'Brouillons' },
        { id: 2, title: 'Post 2', content: '', type: 'Analyse technique' },
        { id: 3, title: 'Post 3', content: '', type: 'News' },
    ]);
    const [editorContent, setEditorContent] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [contributionsEnabled, setContributionsEnabled] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [coverImage, setCoverImage] = useState('');
    const [selectedTag, setSelectedTag] = useState('');

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

    const handleEditorChange = (content: string) => {
        setEditorContent(content);
    };

    const handleCreatePost = () => {
        const newPost = {
            id: posts.length + 1,
            title: postTitle || 'Nouveau post',
            content: editorContent,
            type: 'Brouillons' as const
        };
        setPosts([...posts, newPost]);
        setPostTitle('');
        setEditorContent('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'upload');
            }

            const data = await response.json();
            setCoverImage(data.url);
            toast.success('Image uploadée avec succès');
        } catch (error) {
            toast.error('Erreur lors de l\'upload de l\'image');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmitPost = async () => {
        if (!postTitle || !editorContent || !selectedTag) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        if (editorContent.length < 100) {
            toast.error('Le contenu doit contenir au moins 100 caractères');
            return;
        }

        try {
            const response = await fetch(`/api/communities/${communityId}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: postTitle,
                    content: editorContent,
                    cover_image_url: coverImage,
                    tag: selectedTag,
                    accept_contributions: contributionsEnabled
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la publication');
            }

            toast.success('Post publié avec succès');
            // Réinitialiser les champs
            setPostTitle('');
            setEditorContent('');
            setCoverImage('');
            setSelectedTag('');
        } catch (error) {
            toast.error('Erreur lors de la publication du post');
            console.error(error);
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
            <div className="w-64 min-h-screen bg-black border-r border-gray-800 rounded-r-3xl shadow-2xl">
                {/* Logo et nom */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full">
                            {dashboardData?.community?.imageUrl && (
                                <Image
                                    src={`https://${dashboardData.community.imageUrl}`}
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">{dashboardData.community.name}</h2>
                            <p onClick={() => router.push(`/community/${communityId}`)} className="text-xs text-gray-400 hover:underline cursor-pointer">Voir la communauté</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-4 space-y-6">
                    <div>
                        <h3 className="text-purple-400 text-xs font-medium mb-2">Surveillance</h3>
                        <div className="space-y-1">
                            <button
                                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === 'overview' ? 'bg-gray-800' : 'hover:bg-gray-800'
                                    }`}
                                onClick={() => setActiveTab('overview')}
                            >
                                📊 Tableau de bord
                                <ChevronRight className="ml-auto w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-purple-400 text-xs font-medium mb-2">Création</h3>
                        <div className="space-y-1">
                            <button
                                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === 'veille' ? 'bg-gray-800' : 'hover:bg-gray-800'
                                    }`}
                                onClick={() => setActiveTab('veille')}
                            >
                                📡 Collecte et veille
                                <ChevronRight className="ml-auto w-4 h-4" />
                            </button>
                            <button
                                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === 'creation' ? 'bg-gray-800' : 'hover:bg-gray-800'
                                    }`}
                                onClick={() => setActiveTab('creation')}
                            >
                                ✍️ Création & édition
                                <ChevronRight className="ml-auto w-4 h-4" />
                            </button>
                            <button className="w-full flex items-center text-white p-2 rounded-lg hover:bg-gray-800">
                                📢 Publication & diffusion
                                <ChevronRight className="ml-auto w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-purple-400 text-xs font-medium mb-2">Communication</h3>
                        <div className="space-y-1">
                            <button className="w-full flex items-center text-white p-2 rounded-lg hover:bg-gray-800">
                                💬 Inbox
                                <ChevronRight className="ml-auto w-4 h-4" />
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

                    {activeTab === 'veille' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-bold">Collecte et veille</h1>
                                <div className="flex space-x-4">
                                    <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                                        <Rss className="w-4 h-4 mr-2" />
                                        Ajouter un flux RSS
                                    </button>
                                    <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                        <Link2 className="w-4 h-4 mr-2" />
                                        Nouvelle source
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-6">
                                {/* Sidebar de gauche */}
                                <div className="col-span-1 space-y-6">
                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <h3 className="font-medium mb-4 flex items-center">
                                            <Search className="w-4 h-4 mr-2" />
                                            Outils de veille
                                        </h3>
                                        <div className="space-y-2">
                                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                                                <Rss className="w-4 h-4 mr-2" />
                                                Flux RSS
                                            </button>
                                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                                                <Globe className="w-4 h-4 mr-2" />
                                                Sites web
                                            </button>
                                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                                                <Hash className="w-4 h-4 mr-2" />
                                                Mots-clés
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <h3 className="font-medium mb-4 flex items-center">
                                            <BookMarked className="w-4 h-4 mr-2" />
                                            Organisation
                                        </h3>
                                        <div className="space-y-2">
                                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                                                <Bookmark className="w-4 h-4 mr-2" />
                                                Bookmarks
                                            </button>
                                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                                                <PinIcon className="w-4 h-4 mr-2" />
                                                Épinglés
                                            </button>
                                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                                                <NotebookPen className="w-4 h-4 mr-2" />
                                                Notes
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenu principal */}
                                <div className="col-span-3">
                                    <div className="bg-white rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold">Flux RSS</h2>
                                            <div className="flex space-x-2">
                                                <select className="px-3 py-2 border rounded-lg text-sm">
                                                    <option>Tous les flux</option>
                                                    <option>Crypto</option>
                                                    <option>Macro</option>
                                                    <option>Tech</option>
                                                </select>
                                                <select className="px-3 py-2 border rounded-lg text-sm">
                                                    <option>Plus récents</option>
                                                    <option>Plus pertinents</option>
                                                    <option>Plus commentés</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {rssFeeds.map((feed) => (
                                                <div key={feed.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={feed.thumbnail}
                                                            alt={feed.title}
                                                            width={96}
                                                            height={96}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-purple-600">{feed.category}</span>
                                                            <span className="text-sm text-gray-500">{feed.date}</span>
                                                        </div>
                                                        <h3 className="font-medium mt-1 mb-2">{feed.title}</h3>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">{feed.source}</span>
                                                            <div className="flex space-x-2">
                                                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                                    <Bookmark className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'creation' && (
                        <div className="flex-1 p-6">
                            <div className="flex justify-end items-center mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 ">
                                        <Switch
                                            checked={contributionsEnabled}
                                            onCheckedChange={setContributionsEnabled}
                                            className="data-[state=checked]:bg-green-600"
                                        />
                                        <label className="text-gray-600 flex items-center">
                                            Contributions
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleSubmitPost}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg">
                                        Publier
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6">
                                <div className="flex w-full space-x-4">
                                    <div className="flex items-center space-x-2 flex-1">
                                        <input
                                            type="file"
                                            id="cover-image"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        {coverImage ? (
                                            <Image
                                                src={`https://${coverImage}`}
                                                alt="Cover Image"
                                                width={50}
                                                height={50}
                                                className="rounded-lg"
                                            />
                                        ) : (
                                            <label
                                                htmlFor="cover-image"
                                                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-center">
                                                {isUploading ? 'Upload...' : 'Ajouter une image de couverture'}
                                            </label>
                                        )}
                                        {coverImage && (
                                            <label
                                                htmlFor="cover-image"
                                                className={`px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                Modifier
                                            </label>
                                        )}
                                    </div>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-lg bg-white"
                                    >
                                        <option defaultValue={POST_TAGS[0].value}>Choisir une catégorie</option>
                                        {POST_TAGS.map((tag) => (
                                            <option key={tag.value} value={tag.value}>
                                                {tag.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    placeholder="Titre de l'article"
                                    className="mt-8 w-full text-2xl font-bold border border-gray-200 mb-4 px-4 py-2 rounded-lg"
                                />


                                <TinyEditor
                                    value={editorContent}
                                    onChange={setEditorContent}
                                />
                            </div>
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