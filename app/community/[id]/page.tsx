"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
    MessageCircle,
    ArrowLeft,
    Send,
    PlusCircle,
    HelpCircle,
    FileText,
    Settings,
    ChevronDown,
    Users,
    Lock,
    Edit,
} from "lucide-react";
import { Community } from "@/types/community";
import Image from 'next/image';
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Disclosure } from "@/components/ui/disclosure";
import ChatBox from "@/components/shared/ChatBox";

// Ajouter ces catégories de posts
const POST_CATEGORIES = [
    { id: 'general', label: 'Général' },
    { id: 'analyse-technique', label: 'Analyse technique' },
    { id: 'news', label: 'News' },
    { id: 'reports', label: 'Rapports' }
];

// Ajouter ce type avant le composant CommunityHub
type Presentation = {
    video_url?: string;
    topic_details: string;
    code_of_conduct: string;
    disclaimers: string;
};

// Ajouter l'interface Post
interface Post {
    id: number;
    title: string;
    content: string;
    cover_image_url: string | null;
    tag: string;
    created_at: string;
    accept_contributions: boolean;
    user: {
        id: number;
        fullName: string;
        profilePicture: string;
    };
}

// Ajouter ce type pour les Q&A
type QAItem = {
    id: number;
    question: string;
    answer: string;
    category: string;
};

// Ajouter ces données fictives
const faqData: QAItem[] = [
    {
        id: 1,
        question: "Quelles sont les meilleures plateformes pour faire de la DeFi quand on débute ?",
        answer: "Pour commencer en DeFi, les plateformes les plus accessibles sont Aave, Uniswap, Curve et PancakeSwap. Elles offrent une interface intuitive et une bonne liquidité. Il est conseillé d'utiliser des wallets non-custodiaux comme MetaMask ou Rabby et d'interagir avec des blockchains à faibles frais comme Polygon ou Arbitrum.",
        category: "Débutant"
    },
    {
        id: 2,
        question: "Quels sont les risques principaux en DeFi et comment s'en protéger ?",
        answer: "Les principaux risques en DeFi sont les smart contracts mal sécurisés, l'impermanent loss, la volatilité des tokens et les attaques par phishing. Pour s'en protéger : 1) Vérifiez la sécurité des protocoles en consultant des audits et la réputation du projet. 2) Utilisez plusieurs wallets (un pour l'exploration, un autre pour les fonds importants). 3) Activez un hardware wallet (ex. Ledger) pour protéger vos actifs.",
        category: "Sécurité"
    },
    {
        id: 3,
        question: "Quels sont les meilleurs moyens de générer des rendements passifs en DeFi ?",
        answer: "Les stratégies les plus courantes incluent : 1) Le staking : Verrouiller des tokens (ex. Ethereum 2.0, Cosmos). 2) Le lending : Prêter des cryptos sur des plateformes comme Aave. 3) Le yield farming : Fournir de la liquidité sur Uniswap ou Curve. 4) Les auto-compounders : Utiliser des protocoles comme Beefy Finance pour optimiser les rendements.",
        category: "Rendements"
    },
    {
        id: 4,
        question: "Comment éviter les scams et rug pulls en DeFi ?",
        answer: "Pour minimiser les risques : 1) Évitez les projets trop beaux pour être vrais (APY exagérés, pas d'audit). 2) Analysez l'équipe et la communauté : Si les fondateurs sont anonymes et absents des discussions, méfiez-vous. 3) Vérifiez le TVL (Total Value Locked) et l'historique du projet sur des plateformes comme DeFiLlama.",
        category: "Sécurité"
    },
    {
        id: 5,
        question: "Quels outils utiliser pour suivre son portefeuille DeFi ?",
        answer: "Pour suivre tes positions et ton rendement en DeFi, voici quelques outils utiles : 1) Zapper & DeBank : Visualisation multi-wallet et gestion DeFi. 2) Dune Analytics : Données et graphiques avancés sur les protocoles DeFi. 3) DefiLlama : Classement des protocoles par TVL et analyse des rendements.",
        category: "Outil"
    }
];

const CommunityHub = () => {
    const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const [communityData, setCommunityData] = useState<Community | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("general");
    const [selectedPostCategory, setSelectedPostCategory] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isContributor, setIsContributor] = useState(false);
    const [pendingPostsCount, setPendingPostsCount] = useState(0);

    useEffect(() => {
        if (!session) {
            return;
        } else if (userId === null) {
            setUserId(session.user.id);
        }

        const checkMembershipAndFetchData = async () => {
            try {
                // Vérifier si l'utilisateur est membre
                const membershipResponse = await fetch(`/api/communities/${params.id}/membership`);
                const membershipData = await membershipResponse.json();

                // Récupérer les données de la communauté
                const communityResponse = await fetch(`/api/communities/${params.id}`);
                if (!communityResponse.ok) {
                    router.push('/404');
                    return;
                }
                const communityData = await communityResponse.json();
                setCommunityData(communityData);
                console.log(communityData);

                // Si l'utilisateur n'est pas membre, récupérer la présentation
                if (!membershipData.isMember) {
                    const presentationResponse = await fetch(`/api/communities/${params.id}/presentation`);
                    const presentationData = await presentationResponse.json();
                    setPresentation(presentationData);
                    setShowJoinModal(true);
                }

                // Récupérer les communautés de l'utilisateur
                const userCommunitiesResponse = await fetch(`/api/users/${session?.user?.id}/joined-communities`);
                if (userCommunitiesResponse.ok) {
                    const userCommunitiesData = await userCommunitiesResponse.json();
                    setUserCommunities(userCommunitiesData.communities);
                }

                console.log("membershipData", membershipData);

                // Vérifier si l'utilisateur est contributeur
                setIsContributor(membershipData.isContributor);

                // Si l'utilisateur est contributeur, récupérer le nombre de posts en attente
                if (membershipData.isContributor) {
                    const fetchPendingPosts = async () => {
                        try {
                            const response = await fetch(`/api/communities/${params.id}/posts/pending`);
                            if (response.ok) {
                                const data = await response.json();
                                setPendingPostsCount(data.length);
                            }
                        } catch (error) {
                            console.error('Erreur:', error);
                        }
                    };
                    fetchPendingPosts();
                }

            } catch (error) {
                if (error instanceof Error) {
                    console.log("Erreur:", error.stack);
                } else {
                    console.log("Une erreur inattendue s'est produite");
                }
                setUserCommunities([]);
            }
        };

        if (params.id) {
            checkMembershipAndFetchData();
        }
    }, [params.id, router, session]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`/api/communities/${params.id}/posts?status=PUBLISHED`);
                if (!response.ok) throw new Error('Erreur lors de la récupération des posts');
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Erreur:', error);
                toast.error('Erreur lors de la récupération des posts');
            }
        };

        fetchPosts();
    }, [params.id]);

    const handleJoinCommunity = async () => {
        try {
            const response = await fetch(`/api/communities/${params.id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setShowJoinModal(false);
            } else {
                throw new Error('Erreur lors de l\'adhésion à la communauté');
            }
        } catch (error) {
            console.error('Erreur:', error);
            // Gérer l'erreur (afficher un message à l'utilisateur)
        }
    };

    // Si en cours de chargement, afficher le loader
    if (isLoading) {
        return <LoadingComponent />;
    }

    // Si non authentifié, ne rien afficher (la redirection est gérée par le hook)
    if (!isAuthenticated) {
        return null;
    }

    // Données mockées plus réalistes
    const onlineUsers = [
        {
            id: 1,
            name: "Thomas Dubois",
            status: "online",
            role: "Expert Crypto",
            avatar: "https://ui-avatars.com/api/?name=Thomas+Dubois&background=0D8ABC&color=fff"
        },
        {
            id: 2,
            name: "Sophie Laurent",
            status: "online",
            role: "Analyste Senior",
            avatar: "https://ui-avatars.com/api/?name=Sophie+Laurent&background=7C3AED&color=fff"
        },
        {
            id: 3,
            name: "Marc Lefebvre",
            status: "online",
            role: "Contributeur",
            avatar: "https://ui-avatars.com/api/?name=Marc+Lefebvre&background=059669&color=fff"
        },
        {
            id: 4,
            name: "Julie Moreau",
            status: "online",
            role: "Modératrice",
            avatar: "https://ui-avatars.com/api/?name=Julie+Moreau&background=DC2626&color=fff"
        }
    ];

    const messages = [
        {
            id: 1,
            user: "Thomas Dubois",
            avatar: "https://ui-avatars.com/api/?name=Thomas+Dubois&background=0D8ABC&color=fff",
            content: "Le Bitcoin montre des signes de reprise intéressants sur le support des 40k$. Qu'en pensez-vous ?",
            timestamp: "10:30",
            reactions: ["👍", "🤔"]
        },
        {
            id: 2,
            user: "Sophie Laurent",
            avatar: "https://ui-avatars.com/api/?name=Sophie+Laurent&background=7C3AED&color=fff",
            content: "Les indicateurs techniques suggèrent une consolidation à court terme. Je partage une analyse détaillée dans l'après-midi.",
            timestamp: "10:31",
            reactions: ["🚀", "👀"]
        },
        {
            id: 3,
            user: "Marc Lefebvre",
            avatar: "https://ui-avatars.com/api/?name=Marc+Lefebvre&background=059669&color=fff",
            content: "Attention aux résistances importantes autour des 42k$. Le volume reste faible.",
            timestamp: "10:32",
            reactions: ["💯"]
        }
    ];

    // Ajouter ces données mockées en haut du fichier
    const postsExample = [
        {
            id: 1,
            author: {
                name: "Thomas Dubois",
                avatar: "https://ui-avatars.com/api/?name=Thomas+Dubois&background=0D8ABC&color=fff",
                role: "Expert Crypto"
            },
            content: "Analyse technique BTC/USD : Formation d'un double fond sur le support des 40k$. Objectif potentiel : 45k$ à court terme. Les volumes sont en augmentation et le RSI montre une divergence haussière.",
            image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c",
            timestamp: "Il y a 2h",
            metrics: { likes: 124, comments: 38, shares: 12 },
            tags: ["Bitcoin", "Analyse Technique", "Trading"]
        },
        {
            id: 2,
            author: {
                name: "Sophie Laurent",
                avatar: "https://ui-avatars.com/api/?name=Sophie+Laurent&background=7C3AED&color=fff",
                role: "Analyste Senior"
            },
            content: "🚨 BREAKING NEWS : La SEC approuve les ETF Bitcoin spot ! Une nouvelle ère s'ouvre pour l'adoption institutionnelle des cryptomonnaies.",
            image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
            timestamp: "Il y a 5h",
            metrics: { likes: 89, comments: 24, shares: 8 },
            tags: ["News", "Bitcoin", "Institutionnel"]
        },
        {
            id: 3,
            author: {
                name: "Marc Lefebvre",
                avatar: "https://ui-avatars.com/api/?name=Marc+Lefebvre&background=059669&color=fff",
                role: "Analyste Technique"
            },
            content: "Analyse technique ETH/USD : Triangle ascendant en formation sur le H4. Résistance majeure à 2800$. Stop loss suggéré sous 2500$.",
            image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
            timestamp: "Il y a 1h",
            metrics: { likes: 76, comments: 15, shares: 5 },
            tags: ["Ethereum", "Analyse Technique", "Trading"]
        },
        {
            id: 4,
            author: {
                name: "Julie Moreau",
                avatar: "https://ui-avatars.com/api/?name=Julie+Moreau&background=DC2626&color=fff",
                role: "Responsable Recherche"
            },
            content: "📊 Rapport mensuel : Performance des cryptomonnaies - Janvier 2024. Analyse détaillée des mouvements de capitaux et des tendances sectorielles.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
            timestamp: "Il y a 3h",
            metrics: { likes: 156, comments: 42, shares: 28 },
            tags: ["Rapport", "Analyse", "Recherche"]
        },
        {
            id: 5,
            author: {
                name: "Alexandre Martin",
                avatar: "https://ui-avatars.com/api/?name=Alexandre+Martin&background=4F46E5&color=fff",
                role: "Expert DeFi"
            },
            content: "🔥 Flash News : Nouveau record de TVL sur le protocole XYZ ! Les rendements dépassent les 15% APY.",
            timestamp: "Il y a 30min",
            metrics: { likes: 67, comments: 12, shares: 4 },
            tags: ["News", "DeFi", "Rendement"]
        },
        {
            id: 6,
            author: {
                name: "Emma Bernard",
                avatar: "https://ui-avatars.com/api/?name=Emma+Bernard&background=EA580C&color=fff",
                role: "Analyste Quantitative"
            },
            content: "📈 Rapport hebdomadaire : Analyse des corrélations entre le Bitcoin et les marchés traditionnels. Focus sur l'impact des taux d'intérêt.",
            image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7",
            timestamp: "Il y a 4h",
            metrics: { likes: 93, comments: 31, shares: 15 },
            tags: ["Rapport", "Bitcoin", "Macro"]
        }
    ];
    const getYoutubeVideoId = (url: string) => {
        const videoId = url.split('v=')[1];
        return videoId;
    }

    // Modifier la fonction de gestion du clic sur une catégorie
    const handleCategoryClick = (categoryId: string) => {
        setSelectedPostCategory(selectedPostCategory === categoryId ? null : categoryId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Modal de présentation */}
            {userId && communityData && communityData?.creator.id !== parseInt(userId) && showJoinModal && presentation && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
                        {/* En-tête avec gradient */}
                        <div className="bg-gradient-radial from-[#003E8A] to-[#16215B] -m-8 mb-6 p-6 rounded-t-xl">
                            <h2 className="text-2xl font-bold text-white text-center">{communityData?.name}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Colonne de gauche avec la vidéo */}
                            <div className="space-y-4">
                                {presentation.video_url && (
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(presentation.video_url)}`}
                                            title="Présentation de la communauté"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Colonne de droite avec les détails */}
                            <div className={`space-y-4 ${presentation.video_url ? 'col-span-1' : 'col-span-2'}`}>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                                    <h3 className="font-semibold mb-2 text-gray-900">Vocation de la communauté & détails de la thématique</h3>
                                    <p className="text-sm text-gray-600">{presentation.topic_details}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section du bas */}
                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                                <h3 className="font-semibold mb-2 text-gray-900">Code de conduite</h3>
                                <p className="text-sm text-gray-600">{presentation.code_of_conduct}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                                <h3 className="font-semibold mb-2 text-gray-900">Disclaimer</h3>
                                <p className="text-sm text-gray-600">{presentation.disclaimers}</p>
                            </div>
                        </div>

                        {/* Footer avec checkbox et bouton */}
                        <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={hasAcceptedTerms}
                                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                                />
                                <span className="text-sm text-gray-600">J&apos;ai compris et j&apos;accepte le code de conduite</span>
                            </label>

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={handleJoinCommunity}
                                    disabled={!hasAcceptedTerms}
                                    className={`px-6 py-2 rounded-lg transition-colors ${hasAcceptedTerms
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Rejoindre la communauté →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header avec gradient */}
            {communityData && (
                <div id="no-header" className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#003E8A] to-[#16215B]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => router.back()}
                                    className="text-white/80 hover:text-white mr-4 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                {/* Menu déroulant des communautés */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-white">
                                        <h1 className="text-xl font-bold">{communityData.name}</h1>
                                        {isContributor && pendingPostsCount > 0 && (
                                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                {pendingPostsCount} en attente
                                            </span>
                                        )}
                                        <ChevronDown className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                                    </button>

                                    {/* Liste déroulante des communautés */}
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <div className="p-2">
                                            {userCommunities && userCommunities.map((community) => (
                                                <button
                                                    key={community.id}
                                                    onClick={() => router.push(`/community/${community.id}`)}

                                                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors
                                                    ${String(community.id) === params.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                                                >
                                                    <div>
                                                        <div className="font-medium">{community.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {community.role === 'learner' ? 'Apprenant' : 'Contributeur'}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}

                                            {/* Séparateur */}
                                            <div className="h-px bg-gray-200 my-2" />

                                            {/* Lien pour découvrir plus de communautés */}
                                            <button
                                                onClick={() => router.push('/')}
                                                className="w-full flex items-center justify-between p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <span className="text-sm font-medium">Découvrir plus de communautés</span>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {session && communityData?.creator.id === parseInt(session?.user?.id) && (
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => router.push(`/community/${params.id}/settings`)} className="text-white/80 hover:text-white transition-colors">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Banner section */}
            {communityData && (
                <>
                    <div className="w-full h-[255px] relative overflow-hidden">
                        <Image
                            src={`https://${communityData?.image_url}`}
                            alt="Banner pattern"
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <div className="flex items-center justify-center flex-col py-8">
                        <h1 className="text-4xl font-bold text-gray-900">{communityData?.name}</h1>
                        <p className="text-gray-600 text-sm mt-2">Créé par {communityData?.creator.fullName}</p>
                    </div>
                </>
            )}

            {/* Main Content avec mise à jour du style */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar gauche */}
                    <aside className="w-full lg:w-64 order-2 lg:order-1">
                        <Card className="p-4 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-gray-900">Membres actifs</h2>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    {onlineUsers.length} en ligne
                                </span>
                            </div>
                            <div className="space-y-3">
                                {onlineUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                                    >
                                        <div className="relative">
                                            <Image
                                                src={user.avatar}
                                                alt={user.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </span>
                                            <p className="text-xs text-gray-500">{user.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </aside>

                    {/* Contenu principal */}
                    <main className="flex-1 order-1 lg:order-2">
                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex justify-center space-x-8">
                                <button
                                    className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === "general"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    onClick={() => setActiveTab("general")}
                                >
                                    Général
                                </button>
                                <button
                                    className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === "posts"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    onClick={() => setActiveTab("posts")}
                                >
                                    Les posts
                                </button>
                                {/* Bouton Cours verrouillé */}
                                <button
                                    onClick={() => toast.info("Les cours ne sont pas encore disponibles. Revenez bientôt !")}
                                    className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors opacity-60 cursor-not-allowed flex items-center gap-2
                                        ${activeTab === "courses"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500"
                                        }`}
                                >
                                    Cours
                                    <Lock className="w-4 h-4" />
                                </button>
                                {isContributor && (
                                    <button
                                        className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === "pending"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                        onClick={() => router.push(`/community/${params.id}/posts/pending`)}
                                    >
                                        Posts en attente
                                    </button>
                                )}
                            </nav>
                        </div>

                        {/* Chat Area */}
                        {activeTab === "general" ? (
                            <Card className="bg-white shadow-sm">
                                <div className="h-[600px] flex flex-col">
                                    <div className="flex-1 overflow-y-auto space-y-4 p-4">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className="flex items-start space-x-3 group">
                                                <Image
                                                    src={msg.avatar}
                                                    alt={msg.user}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {msg.user}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {msg.timestamp}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 mt-1">{msg.content}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        {msg.reactions.map((reaction, index) => (
                                                            <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                                                                {reaction}
                                                            </span>
                                                        ))}
                                                        <button onClick={() => toast.info("Cette fonctionnalité n'est pas encore définie")} className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            + 😊
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input de message amélioré */}
                                    <div className="border-t p-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                onClick={() => toast.info("Cette fonctionnalité n'est pas encore définie")}
                                                type="text"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Écrivez votre message..."
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                            <button onClick={() => toast.info("Cette fonctionnalité n'est pas encore définie")} className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-8">
                                {/* Bouton Nouveau Post pour les contributeurs */}
                                <div className="flex justify-end">
                                    {isContributor && (
                                        <button
                                            onClick={() => router.push(`/community/${params.id}/posts/create`)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            <span>Proposer un post</span>
                                        </button>
                                    )}
                                </div>

                                {/* Posts groupés par catégories */}
                                {POST_CATEGORIES.map((category) => {
                                    const categoryPosts = posts.filter(post => post.tag === category.id);
                                    if (categoryPosts.length === 0) return null;
                                    return (
                                        <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                            {/* En-tête de la catégorie */}
                                            <div className="border-b border-gray-100">
                                                <button
                                                    onClick={() => handleCategoryClick(category.id)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                        <h3 className="font-medium text-gray-900">{category.label}</h3>
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                                            {categoryPosts.length}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${selectedPostCategory === category.id ? 'rotate-180' : ''
                                                        }`} />
                                                </button>
                                            </div>

                                            {/* Liste des posts de la catégorie */}
                                            {selectedPostCategory === category.id && categoryPosts && (
                                                <div className="divide-y divide-gray-100">
                                                    {categoryPosts.map((post) => (
                                                        <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center space-x-3">
                                                                    <Image
                                                                        src={post.user.profilePicture}
                                                                        alt={post.user.fullName}
                                                                        width={32}
                                                                        height={32}
                                                                        className="rounded-full"
                                                                    />
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{post.user.fullName}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {formatDistanceToNow(new Date(post.created_at), {
                                                                                addSuffix: true,
                                                                                locale: fr
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {Number(session?.user?.id) === post.user.id && (
                                                                    <button
                                                                        onClick={() => router.push(`/community/${params.id}/posts/${post.id}/edit`)}
                                                                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h4>

                                                            {/* Image de couverture */}
                                                            {post.cover_image_url && (
                                                                <div className="mb-3 rounded-lg overflow-hidden">
                                                                    <Image
                                                                        src={`https://${post.cover_image_url}`}
                                                                        alt={post.title}
                                                                        width={800}
                                                                        height={400}
                                                                        className="w-full h-[200px] object-cover"
                                                                    />
                                                                </div>
                                                            )}

                                                            <div
                                                                className="prose prose-sm max-w-none text-gray-600 mb-3 max-h-[300px] overflow-hidden relative"
                                                            >
                                                                <div
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: post.content
                                                                    }}
                                                                    className="line-clamp-[12] p-6"
                                                                />
                                                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                {post.accept_contributions ? (
                                                                    <span className="text-sm text-green-600 flex items-center">
                                                                        <Users className="w-4 h-4 mr-1" />
                                                                        Contributions activées
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-red-600 flex items-center">
                                                                        <Users className="w-4 h-4 mr-1" />
                                                                        Contributions désactivées
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => router.push(`/community/${params.id}/posts/${post.id}#post-page`)}
                                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                                >
                                                                    Lire la suite →
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
                {session && (
                    <ChatBox user={session.user} communityId={parseInt(String(params.id))} />
                )}

                {/* Section Q&A avec Disclosure */}
                <div className="mt-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Questions fréquentes</h2>
                            <HelpCircle onClick={() => toast.info("Posez vos questions à l'équipe de la communauté")} className="cursor-pointer w-5 h-5 text-blue-500" />
                        </div>

                        <div className="space-y-4">
                            {faqData.map((item) => (
                                <Disclosure key={item.id}>
                                    {({ open }: { open: boolean }) => (
                                        <div className="border rounded-lg overflow-hidden">
                                            <Disclosure.Button className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">
                                                        Q
                                                    </span>
                                                    <h3 className="font-medium text-gray-900">{item.question}</h3>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                                            </Disclosure.Button>

                                            <Disclosure.Panel className="p-4 bg-white">
                                                <div className="flex items-start space-x-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">
                                                        R
                                                    </span>
                                                    <p className="flex-1 text-gray-600 text-sm leading-relaxed">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-3">
                                                    {item.category}
                                                </span>
                                            </Disclosure.Panel>
                                        </div>
                                    )}
                                </Disclosure>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityHub; 