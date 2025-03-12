"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Trash } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface EnrichmentVotingSessionProps {
    communityId: string;
    postId: string;
}

interface Contribution {
    id: number;
    title: string;
    content: string;
    original_content: string;
    created_at: string;
    user: {
        id: number;
        fullName: string;
        profilePicture: string;
    };
    community_posts_enrichment_review: {
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

export default function EnrichmentVotingSession({
    communityId,
    postId,
}: EnrichmentVotingSessionProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
    const [contributorsCount, setContributorsCount] = useState(0);
    const [isContributorsCountEven, setIsContributorsCountEven] = useState(false);
    const [loading, setLoading] = useState(true);
    const [community, setCommunity] = useState<any>(null);

    useEffect(() => {
        fetchPendingContributions();
        fetchContributorsCount();
        fetchCommunityData();
    }, [communityId, postId]);

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

    // Récupérer les contributions en attente
    const fetchPendingContributions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/communities/${communityId}/posts/${postId}/enrichments/pending`);

            if (response.ok) {
                const data = await response.json();
                setPendingContributions(data);
            } else {
                console.error("Erreur lors de la récupération des contributions");
            }
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    // Récupérer le nombre de contributeurs
    const fetchContributorsCount = async () => {
        try {
            const response = await fetch(`/api/communities/${communityId}/contributors/count`);
            if (response.ok) {
                const { count, isEven } = await response.json();
                setContributorsCount(count);
                setIsContributorsCountEven(isEven);
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    // Approuver une contribution
    const handleApprove = async (enrichmentId: number) => {
        try {
            const response = await fetch(`/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/approve`, {
                method: "POST",
            });

            if (response.ok) {
                toast.success("Enrichissement publié");
                fetchPendingContributions();
            } else {
                const data = await response.json();
                toast.error(data.error || "Erreur lors de la publication de l'enrichissement");
            }
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Une erreur est survenue");
        }
    };

    // Rejeter une contribution
    const handleReject = async (enrichmentId: number) => {
        try {
            const response = await fetch(`/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/reject`, {
                method: "POST",
            });

            if (response.ok) {
                toast.success("Enrichissement rejeté");
                fetchPendingContributions();
            } else {
                const data = await response.json();
                toast.error(data.error || "Erreur lors du rejet de l'enrichissement");
            }
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Une erreur est survenue");
        }
    };

    // Calculer le taux de participation pour une contribution
    const getParticipationRate = (contribution: Contribution) => {
        const totalReviews = contribution.community_posts_enrichment_review.length;
        return contributorsCount === 0 ? 0 : Math.round((totalReviews / contributorsCount) * 100);
    };

    // Calculer le taux d'approbation pour une contribution
    const getApprovalRate = (contribution: Contribution) => {
        const totalReviews = contribution.community_posts_enrichment_review.length;
        if (totalReviews === 0) return 0;

        const approvedReviews = contribution.community_posts_enrichment_review.filter(r => r.status === "APPROVED").length;
        return Math.round((approvedReviews / totalReviews) * 100);
    };

    // Vérifier si l'utilisateur est l'auteur de la contribution
    const isContributionAuthor = (contribution: Contribution) => {
        return contribution.user.id === parseInt(session?.user?.id || "0");
    };

    // Vérifier si l'utilisateur a déjà voté sur une contribution
    const hasUserVoted = (contribution: Contribution) => {
        return contribution.community_posts_enrichment_review.some(r => r.user.id === parseInt(session?.user?.id || "0"));
    };

    // Vérifier si la contribution peut être publiée
    const canPublish = (contribution: Contribution) => {
        const participationRate = getParticipationRate(contribution);
        if (participationRate < 50) return false;

        const approvedReviews = contribution.community_posts_enrichment_review.filter(r => r.status === "APPROVED").length;
        const requiredApprovals = isContributorsCountEven
            ? (contributorsCount / 2) + 1
            : Math.ceil(contributorsCount / 2);

        return approvedReviews >= requiredApprovals;
    };

    // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
    const isContributor = community?.contributors?.some(
        (contributor: any) => contributor.userId === session?.user?.id
    ) || false;

    const isCreator = community?.createdBy === session?.user?.id || false;

    if (loading) {
        return (
            <div className="mt-4 text-center" id="enrichment-loading">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-gray-600">Chargement des contributions...</p>
            </div>
        );
    }

    if (pendingContributions.length === 0) {
        return (
            <div className="mt-4 bg-white rounded-lg shadow-sm p-6 text-center" id="enrichment-empty">
                <p className="text-gray-600">Aucune contribution en attente de validation</p>
            </div>
        );
    }

    return (
        <div className="mt-4" id="enrichment-contributions-list">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Contributions en attente
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {pendingContributions.length}
                            </span>
                        </h2>
                        <div className="text-sm text-gray-600 flex items-center">
                            <span>Contributeurs: {contributorsCount}</span>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                        Votez pour approuver ou rejeter les contributions proposées
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contribution
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Auteur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Approbation
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingContributions.map((contribution) => (
                                <tr key={contribution.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">
                                                {contribution.title || "Contribution sans titre"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 mr-3">
                                                <Image
                                                    src={contribution.user.profilePicture || "/images/default-avatar.png"}
                                                    alt={contribution.user.fullName}
                                                    width={32}
                                                    height={32}
                                                    className="h-full w-full object-cover blur-[5px]"
                                                />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 blur-sm">
                                                {contribution.user.fullName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {format(new Date(contribution.created_at), "d MMMM yyyy", { locale: fr })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="text-sm text-gray-900 mb-1 cursor-help">
                                                            {getParticipationRate(contribution)}% ({contribution.community_posts_enrichment_review.length}/{contributorsCount})
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Pour: {contribution.community_posts_enrichment_review.filter(r => r.status === "APPROVED").length}</p>
                                                        <p>Contre: {contribution.community_posts_enrichment_review.filter(r => r.status === "REJECTED").length}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${getParticipationRate(contribution) >= 50 ? "bg-green-600" :
                                                        getParticipationRate(contribution) >= 25 ? "bg-yellow-400" :
                                                            "bg-red-500"
                                                        }`}
                                                    style={{ width: `${getParticipationRate(contribution)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {getParticipationRate(contribution) < 50 && "(min 50% requis)"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm text-gray-900 mb-1">
                                                {getApprovalRate(contribution)}%
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${getApprovalRate(contribution) >= (isContributorsCountEven ? 50 + (100 / contributorsCount) : 50)
                                                        ? "bg-green-600"
                                                        : getApprovalRate(contribution) >= 50
                                                            ? "bg-yellow-400"
                                                            : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${getApprovalRate(contribution)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {isContributorsCountEven && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="ml-1 cursor-help text-blue-500">
                                                                    ({contribution.community_posts_enrichment_review.filter(r => r.status === "APPROVED").length}/{(contributorsCount / 2) + 1} requis)
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
                                                        ({contribution.community_posts_enrichment_review.filter(r => r.status === "APPROVED").length}/{Math.ceil(contributorsCount / 2)} requis)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            {isContributionAuthor(contribution) ? (
                                                // Bouton pour modifier mon enrichissement et le publier si c'est validé
                                                <Link
                                                    href={`/community/${communityId}/posts/${postId}/enrichments/${contribution.id}?edit=true`}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                                >
                                                    Modifier mon enrichissement
                                                </Link>
                                            ) : (
                                                <>
                                                    {hasUserVoted(contribution) ? (
                                                        <Link
                                                            href={`/community/${communityId}/posts/${postId}/enrichments/${contribution.id}/review?edit=true`}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                                        >
                                                            Modifier mon vote
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            href={`/community/${communityId}/posts/${postId}/enrichments/${contribution.id}/review`}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                                        >
                                                            Voter
                                                        </Link>
                                                    )}
                                                </>
                                            )}

                                            {canPublish(contribution) && (isCreator || isContributor) && (
                                                <button
                                                    onClick={() => handleApprove(contribution.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Publier
                                                </button>
                                            )}

                                            {isCreator && (
                                                <button
                                                    onClick={() => handleReject(contribution.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                                >
                                                    <Trash className="h-4 w-4 mr-1" />
                                                    Rejeter
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 