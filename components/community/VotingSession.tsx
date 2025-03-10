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

    useEffect(() => {
        fetchPendingPosts();
        fetchContributorsCount();
        fetchCommunityData();
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

            {postsToDisplay.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Aucun post en attente de vote dans cette catégorie
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">État</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Votes</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approbation</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {postsToDisplay.map((post, index) => {
                                const participationRate = getParticipationRate(post);
                                const approvalRate = getApprovalRate(post);
                                const isAuthor = isPostAuthor(post);
                                const userVoted = hasUserVoted(post);
                                const publishable = canPublish(post);

                                return (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-gray-900 font-medium">{index + 1}</span>
                                                <div className="ml-2">
                                                    {publishable ? (
                                                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                                            <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 relative overflow-hidden rounded-full">
                                                    <Image
                                                        src={post.user.profilePicture}
                                                        alt={post.user.fullName}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full blur-[5px]"
                                                    />
                                                </div>
                                                <div className="ml-3">
                                                    {isAuthor ? (
                                                        <div className="text-sm font-medium text-gray-900">{post.user.fullName}</div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-gray-500 blur-sm select-none">
                                                            {post.user.fullName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="cursor-help">
                                                            {post.community_posts_reviews.length}/{contributorsCount}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Pour: {post.community_posts_reviews.filter(r => r.status === "APPROVED").length}</p>
                                                        <p>Contre: {post.community_posts_reviews.filter(r => r.status === "REJECTED").length}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${participationRate >= 50 ? "bg-green-600" :
                                                        participationRate >= 25 ? "bg-yellow-400" :
                                                            "bg-red-500"
                                                        }`}
                                                    style={{ width: `${participationRate}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {participationRate}% {participationRate < 50 && "(min 50% requis)"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${approvalRate >= (isContributorsCountEven ? 50 + (100 / contributorsCount) : 50)
                                                        ? "bg-green-600"
                                                        : approvalRate >= 50
                                                            ? "bg-yellow-400"
                                                            : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${approvalRate}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {approvalRate}%
                                                {isContributorsCountEven && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="ml-1 cursor-help text-blue-500">
                                                                    ({post.community_posts_reviews.filter(r => r.status === "APPROVED").length}/{(contributorsCount / 2) + 1} requis)
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Comme le nombre de contributeurs est pair ({contributorsCount}),
                                                                    il faut une majorité stricte de {(contributorsCount / 2) + 1} votes positifs.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {!isContributorsCountEven && (
                                                    <span className="ml-1">
                                                        ({post.community_posts_reviews.filter(r => r.status === "APPROVED").length}/{Math.ceil(contributorsCount / 2)} requis)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                {isPostAuthor(post) && (
                                                    <>
                                                        <Link
                                                            href={`/community/${communityId}/posts/${post.id}/edit`}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            Modifier
                                                        </Link>

                                                        {canPublish(post) && (
                                                            <button
                                                                onClick={() => handlePublish(post.id)}
                                                                className="text-green-600 hover:text-green-800 ml-3"
                                                            >
                                                                Publier
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {!isPostAuthor(post) && (
                                                    <div className="flex justify-end space-x-2">
                                                        {userVoted ? (
                                                            <div className="mt-4">
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    Vous avez déjà voté sur ce post.
                                                                </p>
                                                                <Link
                                                                    href={`/community/${communityId}/posts/${post.id}/review?edit=true`}
                                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                                >
                                                                    Modifier mon vote
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                href={`/community/${communityId}/posts/${post.id}/review`}
                                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                            >
                                                                Voter sur ce post
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
} 