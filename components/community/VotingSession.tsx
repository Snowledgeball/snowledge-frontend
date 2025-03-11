"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { User, AlertCircle, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import ContributionVotingSession from "./ContributionVotingSession";
import CreationVotingSession from "./CreationVotingSession";

interface PendingPost {
    status: string;
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
    community_posts_reviews: {
        id: number;
        content: string;
        status: string;
        created_at: string;
        is_validated: boolean;
        user: {
            id: number;
            fullName: string;
            profilePicture: string;
        };
    }[];
}

interface VotingSessionProps {
    communityId: string;
    onTabChange: (tab: "creation" | "enrichissement") => void;
    activeTab: "creation" | "enrichissement";
}

export default function VotingSession({ communityId, onTabChange, activeTab }: VotingSessionProps) {
    const router = useRouter();
    const session = useSession();
    const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
    const [contributorsCount, setContributorsCount] = useState(0);
    const [isContributorsCountEven, setIsContributorsCountEven] = useState(false);
    const [loading, setLoading] = useState(true);
    const [community, setCommunity] = useState<any>(null);
    const [creationPosts, setCreationPosts] = useState<PendingPost[]>([]);
    const [enrichissementPosts, setEnrichissementPosts] = useState<PendingPost[]>([]);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [publishedPosts, setPublishedPosts] = useState<PendingPost[]>([]);
    const [postsWithPendingContributions, setPostsWithPendingContributions] = useState<PendingPost[]>([]);

    useEffect(() => {
        fetchCommunityData();
        fetchPendingPosts();
        fetchContributorsCount();
        fetchPostsWithPendingContributions();
    }, [communityId]);

    // Fonction pour récupérer les données de la communauté
    const fetchCommunityData = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}`);
            const data = await response.json();
            if (response.ok) {
                setCommunity(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données de la communauté:", error);
        }
    };

    const fetchPendingPosts = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/posts/pending`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des posts");
            const data = await response.json();

            // Pour l'instant, tous les posts sont considérés comme des créations
            // Dans le futur, il faudra ajouter un champ pour distinguer les types
            setCreationPosts(data);
            // setEnrichissementPosts(data.filter((post: PendingPost) => post.accept_contributions));
        } catch (error) {
            toast.error("Erreur lors de la récupération des posts en attente");
        }
    };

    const fetchContributorsCount = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/contributors/count`);
            if (response.ok) {
                const data = await response.json();
                setContributorsCount(data.count);
                setIsContributorsCountEven(data.count % 2 === 0);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du nombre de contributeurs:", error);
        }
    };

    const fetchPostsWithPendingContributions = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/posts/with-pending-contributions`);
            if (response.ok) {
                const data = await response.json();
                setPostsWithPendingContributions(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des posts avec contributions en attente:", error);
        }
    };

    const handlePublish = async (postId: number) => {
        try {
            setPublishError(null);
            const response = await fetch(
                `/api/communities/${communityId}/posts/pending/${postId}/publish`,
                { method: "POST" }
            );

            if (!response.ok) {
                const data = await response.json();
                if (data.details) {
                    setPublishError(`${data.error}. ${data.details.currentVotes}/${data.details.requiredVotes} votes requis.`);
                } else {
                    throw new Error(data.error || "Erreur lors de la publication");
                }
                return;
            }

            toast.success("Post publié avec succès");
            setCreationPosts((prev) => prev.filter((p) => p.id !== postId));
            setEnrichissementPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Erreur lors de la publication du post");
            }
        }
    };

    // Calcul du taux de participation pour chaque post
    const getParticipationRate = (post: PendingPost) => {
        const totalReviews = post.community_posts_reviews.length;
        if (contributorsCount === 0) return 0;
        return Math.round((totalReviews / contributorsCount) * 100);
    };

    // Calcul du taux d'approbation pour chaque post
    const getApprovalRate = (post: PendingPost) => {
        const approvedCount = post.community_posts_reviews.filter(r => r.status === "APPROVED").length;
        const totalReviews = post.community_posts_reviews.length;
        if (totalReviews === 0) return 0;
        return Math.round((approvedCount / totalReviews) * 100);
    };

    // Fonction pour vérifier si l'utilisateur est l'auteur du post
    const isPostAuthor = (post: PendingPost) => {
        return post.user.id === parseInt(session?.data?.user?.id || "0");
    };

    // Fonction pour vérifier si l'utilisateur a déjà voté
    const hasUserVoted = (post: PendingPost) => {
        return post.community_posts_reviews.some(r => r.user.id === parseInt(session?.data?.user?.id || "0"));
    };

    // Vérifier si le post peut être publié
    const canPublish = (post: PendingPost) => {
        const participationRate = getParticipationRate(post);
        const approvedCount = post.community_posts_reviews.filter(r => r.status === "APPROVED").length;

        // Si pas assez de participation, on ne peut pas publier
        if (participationRate < 50) return false;

        // Calculer le nombre de votes nécessaires pour une majorité stricte
        const requiredApprovals = isContributorsCountEven
            ? (contributorsCount / 2) + 1
            : Math.ceil(contributorsCount / 2);

        // Vérifier si le post a suffisamment de votes positifs
        return approvedCount >= requiredApprovals;
    };

    // Déterminer quels posts afficher en fonction de l'onglet actif
    const postsToDisplay = activeTab === "creation" ? creationPosts : enrichissementPosts;

    // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
    const isContributor = community?.contributors?.some(
        (contributor: any) => contributor.userId === session?.data?.user?.id
    ) || false;

    const isCreator = community?.createdBy === session?.data?.user?.id || false;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Sessions de vote</h2>

                <div className="border-b border-gray-200 mb-6">
                    <div className="flex space-x-8">
                        <button
                            className={`border-b-2 py-2 px-4 text-sm font-medium transition-colors ${activeTab === "creation" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
                                }`}
                            onClick={() => onTabChange("creation")}
                        >
                            Création
                        </button>
                        <button
                            className={`border-b-2 py-2 px-4 text-sm font-medium transition-colors ${activeTab === "enrichissement" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
                                }`}
                            onClick={() => onTabChange("enrichissement")}
                        >
                            Enrichissement
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                        Toutes les contributions de la communauté ("session de vote")
                    </p>
                    <div className="text-sm text-gray-600 flex items-center">
                        <Info className="w-4 h-4 mr-1 text-blue-500" />
                        <span>Nombre de contributeurs: {contributorsCount}</span>
                    </div>
                </div>

                {publishError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                        {publishError}
                    </div>
                )}
            </div>

            {activeTab === "creation" ? (
                <CreationVotingSession communityId={communityId} />
            ) : (
                <div className="space-y-6">
                    {postsWithPendingContributions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Aucun post n'a de contributions en attente de validation</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Contributions en attente de validation</h3>
                            <p className="text-gray-600 mb-6">
                                Votez sur les modifications proposées pour améliorer les posts publiés.
                            </p>

                            <div className="space-y-8">
                                {postsWithPendingContributions.map((post) => (
                                    <div key={post.id} className="border-t pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-medium">{post.title}</h4>
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 mr-2">
                                                    <Image
                                                        src={post.user.profilePicture || "/images/default-avatar.png"}
                                                        alt={post.user.fullName}
                                                        width={32}
                                                        height={32}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {post.user.fullName}
                                                </span>
                                            </div>
                                        </div>
                                        <ContributionVotingSession
                                            communityId={communityId}
                                            postId={post.id.toString()}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 