"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
    Users,
    MessageCircle,
    ArrowLeft,
    Search,
    Send,
    PlusCircle,
    HelpCircle,
    FileText,
    Settings,
    Lock,
    ChevronDown,
    Play,
    Volume2,
} from "lucide-react";
import { Community } from "@/types/community";
import Image from 'next/image';


// Ajouter ces catégories de posts
const POST_CATEGORIES = [
    { id: 'general', label: 'Général' },
    { id: 'technical-analysis', label: 'Analyse technique' },
    { id: 'news', label: 'News' },
    { id: 'reports', label: 'Rapports' }
];

const CommunityHub = () => {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const [communityData, setCommunityData] = useState<Community | null>(null);
    const [activeTab, setActiveTab] = useState("general");
    const [selectedPostCategory, setSelectedPostCategory] = useState("general");
    const [message, setMessage] = useState("");
    // Nouveaux états
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [presentation, setPresentation] = useState<any>(null);
    const [hasJoined, setHasJoined] = useState(false);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);

    useEffect(() => {
        if (!session) {
            return;
        }
        const checkMembershipAndFetchData = async () => {
            try {

                // Vérifier si l'utilisateur est membre
                const membershipResponse = await fetch(`/api/communities/${params.id}/membership`);
                const membershipData = await membershipResponse.json();
                setHasJoined(membershipData.isMember);

                // Récupérer les données de la communauté
                const communityResponse = await fetch(`/api/communities/${params.id}`);
                if (!communityResponse.ok) {
                    router.push('/404');
                    return;
                }
                const communityData = await communityResponse.json();
                setCommunityData(communityData);

                // Si l'utilisateur n'est pas membre, récupérer la présentation
                if (!membershipData.isMember) {
                    const presentationResponse = await fetch(`/api/communities/${params.id}/presentation`);
                    const presentationData = await presentationResponse.json();
                    setPresentation(presentationData);
                    setShowJoinModal(true);
                }


                // Récupérer les communautés de l'utilisateur
                const userCommunitiesResponse = await fetch(`/api/users/${session?.user?.id}/joined-communities`);
                console.log("userCommunitiesResponse", userCommunitiesResponse);
                if (userCommunitiesResponse.ok) {
                    const userCommunitiesData = await userCommunitiesResponse.json();
                    setUserCommunities(userCommunitiesData.communities);
                }

            } catch (error: any) {
                console.log("Erreur:", error.stack);
                setUserCommunities([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            checkMembershipAndFetchData();
        }
    }, [params.id, router, session]);


    useEffect(() => {
        console.log("userCommunities", userCommunities);
    }, [userCommunities]);


    const handleJoinCommunity = async () => {
        try {
            const response = await fetch(`/api/communities/${params.id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setHasJoined(true);
                setShowJoinModal(false);
            } else {
                throw new Error('Erreur lors de l\'adhésion à la communauté');
            }
        } catch (error) {
            console.error('Erreur:', error);
            // Gérer l'erreur (afficher un message à l'utilisateur)
        }
    };

    // Afficher le loader pendant le chargement
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement de la communauté...</p>
                </div>
            </div>
        );
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
    const posts = [
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Modal de présentation */}
            {showJoinModal && presentation && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
                        {/* En-tête avec gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 -m-8 mb-6 p-6 rounded-t-xl">
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
                                <span className="text-sm text-gray-600">J'ai compris et j'accepte le code de conduite</span>
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600">
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
                                                            {community.role === 'LEARNER' ? 'Apprenant' : 'Contributeur'}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}

                                            {/* Séparateur */}
                                            <div className="h-px bg-gray-200 my-2" />

                                            {/* Lien pour découvrir plus de communautés */}
                                            <button
                                                onClick={() => router.push('/communities')}
                                                className="w-full flex items-center justify-between p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <span className="text-sm font-medium">Découvrir plus de communautés</span>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="text-white/80 hover:text-white transition-colors">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content avec mise à jour du style */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar des utilisateurs avec style amélioré */}
                    <div className="col-span-3">
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
                    </div>

                    {/* Zone principale de chat avec style amélioré */}
                    <div className="col-span-6">
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
                                                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                type="text"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Écrivez votre message..."
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                            <button className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Navigation secondaire pour les catégories de posts */}
                                <div className="flex space-x-2 mb-6">
                                    {POST_CATEGORIES.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedPostCategory(category.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium
                                                ${selectedPostCategory === category.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                                } transition-colors`}
                                        >
                                            <span>{category.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Bouton Nouveau Post */}
                                <div className="flex justify-end">
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Nouveau post</span>
                                    </button>
                                </div>

                                {/* Liste des posts filtrée par catégorie */}
                                <div className="space-y-6">
                                    {posts
                                        .filter(post => {
                                            switch (selectedPostCategory) {
                                                case 'technical-analysis':
                                                    return post.tags.includes('Analyse Technique');
                                                case 'news':
                                                    return post.tags.includes('News');
                                                case 'reports':
                                                    return post.tags.includes('Rapport');
                                                default:
                                                    return true;
                                            }
                                        })
                                        .map((post) => (
                                            <Card key={post.id} className="bg-white shadow-sm p-6">
                                                {/* En-tête du post */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Image
                                                            src={post.author.avatar}
                                                            alt={post.author.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full"
                                                        />
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium text-gray-900">{post.author.name}</span>
                                                                <span className="text-sm text-gray-500">{post.author.role}</span>
                                                            </div>
                                                            <span className="text-sm text-gray-500">{post.timestamp}</span>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <Settings className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Contenu du post */}
                                                <p className="text-gray-800 mb-4">{post.content}</p>
                                                {post.image && (
                                                    <div className="mb-4 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={post.image}
                                                            alt="Post illustration"
                                                            width={500}
                                                            height={300}
                                                            className="w-full h-auto"
                                                        />
                                                    </div>
                                                )}

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {post.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Métriques et actions */}
                                                <div className="flex items-center justify-between pt-4 border-t">
                                                    <div className="flex items-center space-x-6">
                                                        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                                                            <MessageCircle className="w-5 h-5" />
                                                            <span>{post.metrics.comments}</span>
                                                        </button>
                                                        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600">
                                                            <ArrowLeft className="w-5 h-5 rotate-45" />
                                                            <span>{post.metrics.shares}</span>
                                                        </button>
                                                        <button className="flex items-center space-x-2 text-gray-500 hover:text-red-600">
                                                            <span>♥</span>
                                                            <span>{post.metrics.likes}</span>
                                                        </button>
                                                    </div>
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                        Voir les commentaires
                                                    </button>
                                                </div>
                                            </Card>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Q&A */}
                    <div className="col-span-3">
                        <Card className="p-4 bg-white mb-4">
                            <h2 className="font-semibold text-gray-900 mb-4">Q&A général</h2>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-2">
                                        <HelpCircle className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-gray-700">FAQ</span>
                                    </div>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-gray-700">Documentation</span>
                                    </div>
                                </button>
                            </div>
                        </Card>

                        <Card className="p-4 bg-white">
                            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                                <PlusCircle className="w-4 h-4" />
                                <span>Créer un post</span>
                            </button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityHub; 