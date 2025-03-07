"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { User } from "lucide-react";

interface PendingPost {
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
    const { data: session } = useSession();
    const [creationPosts, setCreationPosts] = useState<PendingPost[]>([]);
    const [enrichissementPosts, setEnrichissementPosts] = useState<PendingPost[]>([]);

    useEffect(() => {
        const fetchPendingPosts = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}/posts/pending`);
                if (!response.ok) throw new Error("Erreur lors de la récupération des posts");
                const data = await response.json();

                // Pour l'instant, tous les posts sont considérés comme des créations
                // Dans le futur, il faudra ajouter un champ pour distinguer les types
                setCreationPosts(data);
                // setCreationPosts(data.filter((post: PendingPost) => !post.accept_contributions));
                // setEnrichissementPosts(data.filter((post: PendingPost) => post.accept_contributions));
            } catch (error) {
                toast.error("Erreur lors de la récupération des posts en attente");
            }
        };

        fetchPendingPosts();
    }, [communityId]);

    const handlePublish = async (postId: number) => {
        try {
            const response = await fetch(
                `/api/communities/${communityId}/posts/pending/${postId}/publish`,
                { method: "POST" }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de la publication");
            }

            toast.success("Post publié avec succès");
            // setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
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
        const approvedCount = post.community_posts_reviews.filter(r => r.status === "APPROVED").length;
        const totalReviews = post.community_posts_reviews.length;

        if (totalReviews === 0) return 0;
        return Math.round((approvedCount / totalReviews) * 100);
    };

    // Fonction pour vérifier si l'utilisateur est l'auteur du post
    const isPostAuthor = (post: PendingPost) => {
        return post.user.id === parseInt(session?.user?.id || "0");
    };

    // Déterminer quels posts afficher en fonction de l'onglet actif
    const postsToDisplay = activeTab === "creation" ? creationPosts : enrichissementPosts;

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

                <p className="text-sm text-gray-600 mb-4">
                    Toutes les contributions de la communauté ("session de vote")
                </p>
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Nb de votes</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux de participation vote</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {postsToDisplay.map((post, index) => {
                                const participationRate = getParticipationRate(post);
                                const isAuthor = isPostAuthor(post);

                                return (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-gray-900 font-medium">{index + 1}</span>
                                                <div className="ml-2">
                                                    {post.community_posts_reviews.length >= 2 && participationRate >= 50 ? (
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
                                                {/* Afficher l'image floutée ou l'icône utilisateur si ce n'est pas l'auteur */}
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
                                            {post.community_posts_reviews.length}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${participationRate >= 75 ? "bg-green-600" :
                                                        participationRate >= 50 ? "bg-yellow-400" :
                                                            "bg-red-500"
                                                        }`}
                                                    style={{ width: `${participationRate}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{participationRate}%</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isAuthor ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/community/${communityId}/posts/${post.id}/edit`)}
                                                        className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1 transition-colors"
                                                    >
                                                        Modifier la session de vote
                                                    </button>
                                                    {post.community_posts_reviews.length >= 2 && participationRate >= 50 && (
                                                        <button
                                                            onClick={() => handlePublish(post.id)}
                                                            className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1 transition-colors"
                                                        >
                                                            Continuer la session vote
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => router.push(`/community/${communityId}/posts/${post.id}/review?authorId=${post.user.id}`)}
                                                    className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1 transition-colors"
                                                >
                                                    {post.community_posts_reviews.some(r => r.user.id === parseInt(session?.user?.id || "0"))
                                                        ? "Voir ma révision"
                                                        : "Commencer la session de vote"}
                                                </button>
                                            )}
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