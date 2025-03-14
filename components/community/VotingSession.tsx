"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";
import EnrichmentVotingSession from "./EnrichmentVotingSession";
import CreationVotingSession from "./CreationVotingSession";
import { Loader } from "@/components/ui/loader";

// Cache pour stocker les données
const contributorsCache = new Map<string, { count: number, timestamp: number }>();
const pendingEnrichmentsCache = new Map<string, { data: any[], timestamp: number }>();
const postsWithPendingEnrichmentsCache = new Map<string, { data: any[], timestamp: number }>();

// Cache pour stocker l'onglet actif
const activeTabCache = new Map<string, { tab: string, timestamp: number }>();

// Durée de validité du cache (2 minutes)
const CACHE_DURATION = 2 * 60 * 1000;

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
}

export default function VotingSession({ communityId }: VotingSessionProps) {
    const [contributorsCount, setContributorsCount] = useState(0);
    const [postsWithPendingEnrichments, setPostsWithPendingEnrichments] = useState<PendingPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Mémoriser l'ID de la communauté pour éviter les re-rendus inutiles
    const memoizedCommunityId = useMemo(() => communityId, [communityId]);

    // Récupérer l'onglet actif depuis le cache ou utiliser "creation" par défaut
    const getInitialTab = useCallback(() => {
        const cacheKey = `voting-tab-${memoizedCommunityId}`;
        const now = Date.now();

        if (activeTabCache.has(cacheKey)) {
            const cachedData = activeTabCache.get(cacheKey)!;
            if (now - cachedData.timestamp < CACHE_DURATION) {
                return cachedData.tab;
            }
        }

        // Si pas de cache ou cache expiré, utiliser "creation" par défaut
        return "creation";
    }, [memoizedCommunityId]);

    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Fonction optimisée pour récupérer le nombre de contributeurs
    const fetchContributorsCount = useCallback(async (forceRefresh = false) => {
        try {
            const cacheKey = `contributors-count-${memoizedCommunityId}`;
            const now = Date.now();

            // Vérifier si les données sont dans le cache et si elles sont encore valides
            if (!forceRefresh && contributorsCache.has(cacheKey)) {
                const cachedData = contributorsCache.get(cacheKey)!;
                if (now - cachedData.timestamp < CACHE_DURATION) {
                    setContributorsCount(cachedData.count);
                    return;
                }
            }

            const response = await fetch(`/api/communities/${memoizedCommunityId}/contributors/count`, {
                headers: {
                    'Cache-Control': 'max-age=120', // Cache de 2 minutes
                }
            });

            if (response.ok) {
                const data = await response.json();
                setContributorsCount(data.count);

                // Mettre en cache les données avec un timestamp
                contributorsCache.set(cacheKey, {
                    count: data.count,
                    timestamp: now
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du nombre de contributeurs:", error);
        }
    }, [memoizedCommunityId]);

    // Fonction optimisée pour récupérer les posts avec enrichissements en attente
    const fetchPostsWithPendingEnrichments = useCallback(async (forceRefresh = false) => {
        try {
            const cacheKey = `posts-with-pending-enrichments-${memoizedCommunityId}`;
            const now = Date.now();

            // Vérifier si les données sont dans le cache et si elles sont encore valides
            if (!forceRefresh && postsWithPendingEnrichmentsCache.has(cacheKey)) {
                const cachedData = postsWithPendingEnrichmentsCache.get(cacheKey)!;
                if (now - cachedData.timestamp < CACHE_DURATION) {
                    setPostsWithPendingEnrichments(cachedData.data);
                    return;
                }
            }

            const response = await fetch(`/api/communities/${memoizedCommunityId}/posts/with-pending-enrichments`, {
                headers: {
                    'Cache-Control': 'max-age=120', // Cache de 2 minutes
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPostsWithPendingEnrichments(data);

                // Mettre en cache les données avec un timestamp
                postsWithPendingEnrichmentsCache.set(cacheKey, {
                    data,
                    timestamp: now
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des posts avec enrichissements en attente:", error);
        }
    }, [memoizedCommunityId]);

    // Fonction pour charger toutes les données nécessaires
    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([
            fetchContributorsCount(),
            fetchPostsWithPendingEnrichments()
        ]);
        setIsLoading(false);
    }, [fetchContributorsCount, fetchPostsWithPendingEnrichments]);

    // Effet pour charger les données initiales
    useEffect(() => {
        loadAllData();

        // Mettre en place un intervalle pour rafraîchir les données toutes les 2 minutes
        const intervalId = setInterval(() => {
            loadAllData();
        }, CACHE_DURATION);

        // Nettoyer l'intervalle lors du démontage du composant
        return () => clearInterval(intervalId);
    }, [loadAllData]);

    // Mettre à jour le cache lorsque l'onglet change
    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);

        // Mettre en cache l'onglet actif
        const cacheKey = `voting-tab-${memoizedCommunityId}`;
        activeTabCache.set(cacheKey, {
            tab: value,
            timestamp: Date.now()
        });
    }, [memoizedCommunityId]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6" id="voting-sessions">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Sessions de vote</h2>

                <div className="border-b border-gray-200 mb-6">
                    <div className="flex space-x-8">
                        <button
                            id="creation-tab"
                            className={`border-b-2 py-2 px-4 text-sm font-medium transition-colors ${activeTab === "creation" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
                                }`}
                            onClick={() => handleTabChange("creation")}
                        >
                            Création
                        </button>
                        <button
                            id="enrichissement-tab"
                            className={`border-b-2 py-2 px-4 text-sm font-medium transition-colors ${activeTab === "enrichissement" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
                                }`}
                            onClick={() => handleTabChange("enrichissement")}
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

            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader size="md" color="gradient" text="Chargement..." variant="spinner" />
                </div>
            ) : (
                <>
                    {/* Précharger les deux composants mais n'afficher que celui qui est actif */}
                    <div className={activeTab === "creation" ? "block" : "hidden"} id="creation-content">
                        <CreationVotingSession communityId={memoizedCommunityId} />
                    </div>

                    <div className={activeTab === "enrichissement" ? "block" : "hidden"} id="enrichissement-content">
                        {postsWithPendingEnrichments.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Aucun post n'a d'enrichissement en attente de validation</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {postsWithPendingEnrichments.map((post) => (
                                    <div key={post.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
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
                                            communityId={memoizedCommunityId}
                                            postId={post.id.toString()}
                                            key={`enrichment-${post.id}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
} 