"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";
import EnrichmentVotingSession from "./EnrichmentVotingSession";
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
    const [contributorsCount, setContributorsCount] = useState(0);
    const [postsWithPendingEnrichments, setPostsWithPendingEnrichments] = useState<PendingPost[]>([]);

    useEffect(() => {
        fetchContributorsCount();
        fetchPostsWithPendingEnrichments();
    }, [communityId]);

    // Fonction pour récupérer les données de la communauté
    const fetchContributorsCount = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/contributors/count`);
            if (response.ok) {
                const data = await response.json();
                setContributorsCount(data.count);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du nombre de contributeurs:", error);
        }
    };

    const fetchPostsWithPendingEnrichments = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/posts/with-pending-enrichments`);
            if (response.ok) {
                const data = await response.json();
                setPostsWithPendingEnrichments(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des posts avec enrichissements en attente:", error);
        }
    };

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
            </div>

            {activeTab === "creation" ? (
                <CreationVotingSession communityId={communityId} />
            ) : (
                <div className="space-y-6">
                    {postsWithPendingEnrichments.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Aucun post n'a d'enrichissement en attente de validation</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Enrichissements en attente de validation</h3>
                            <p className="text-gray-600 mb-6">
                                Votez sur les enrichissements proposés pour améliorer les posts publiés.
                            </p>

                            <div className="space-y-8">
                                {postsWithPendingEnrichments.map((post) => (
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
                                        <EnrichmentVotingSession
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