"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import ContributionReview from "@/components/community/ContributionReview";
import { redirect } from "next/navigation";

export default function ReviewContribution() {
    const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [contribution, setContribution] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isContributor, setIsContributor] = useState(false);
    const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
    const [existingReview, setExistingReview] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer la session en premier
                const sessionResponse = await fetch('/api/auth/session');
                const sessionData = await sessionResponse.json();

                // Vérifier que l'utilisateur est contributeur
                const membershipResponse = await fetch(
                    `/api/communities/${params.id}/membership`
                );
                const membershipData = await membershipResponse.json();
                setIsContributor(membershipData.isContributor);

                if (!membershipData.isContributor) {
                    toast.error("Vous devez être contributeur pour réviser une contribution");
                    router.push(`/community/${params.id}`);
                    return;
                }

                console.log("membershipData", membershipData);

                // Récupérer les données de la contribution
                const contributionResponse = await fetch(
                    `/api/communities/${params.id}/posts/${params.postId}/contributions/${params.contributionId}`
                );

                if (!contributionResponse.ok) {
                    toast.error("Erreur lors de la récupération de la contribution");
                    router.push(`/community/${params.id}/posts/${params.postId}`);
                    return;
                }

                const contributionData = await contributionResponse.json();
                setContribution(contributionData);

                // Vérifier si l'utilisateur est l'auteur de la contribution
                if (contributionData.user.id === parseInt(sessionData?.user?.id || "0")) {
                    toast.error("Vous ne pouvez pas réviser votre propre contribution");
                    router.push(`/community/${params.id}/posts/${params.postId}`);
                    return;
                }
                // Récupérer les données de la communauté
                const communityResponse = await fetch(`/api/communities/${params.id}`);
                const communityData = await communityResponse.json();

                console.log("communityData", communityData);

                // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
                const isContributor = communityData.community_contributors.some(
                    (contributor: any) => contributor.contributor_id === parseInt(sessionData?.user?.id || "0")
                );

                console.log("isContributor", isContributor);

                const isCreator = communityData.creator.id === parseInt(sessionData?.user?.id || "0");

                console.log("isCreator", isCreator);

                // Permettre l'accès à la page de revue si l'utilisateur est contributeur OU créateur
                if (!isContributor && !isCreator) {
                    console.log("redirect");
                    redirect(`/community/${params.id}`);
                }

                // Vérifier si l'utilisateur a déjà voté    
                const hasVotedResponse = await fetch(
                    `/api/communities/${params.id}/posts/${params.postId}/contributions/${params.contributionId}/reviews/user`
                );

                console.log("hasVotedResponse", hasVotedResponse);

                if (hasVotedResponse.ok) {
                    const hasVotedData = await hasVotedResponse.json();
                    setHasAlreadyVoted(hasVotedData.hasVoted);

                    if (hasVotedData.hasVoted && hasVotedData.review) {
                        setExistingReview(hasVotedData.review);

                        // Vérifier si on est en mode édition
                        const edit = searchParams.get("edit");
                        if (edit === "true") {
                            setIsEditMode(true);
                        } else {
                            toast.info("Vous avez déjà voté sur cette contribution", {
                                description: `Votre vote: ${hasVotedData.review.status === "APPROVED" ? "Approuvé" : "Rejeté"}`,
                                duration: 5000,
                                action: {
                                    label: "Modifier",
                                    onClick: () => router.push(`/community/${params.id}/posts/${params.postId}/contributions/${params.contributionId}/review?edit=true`),
                                },
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur:", error);
                toast.error("Une erreur est survenue");
                // router.push(`/community/${params.id}/posts/${params.postId}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id, params.postId, params.contributionId, router, searchParams]);

    if (isLoading || loading) return <LoadingComponent />;
    if (!isAuthenticated || !contribution) return null;

    // Si l'utilisateur a déjà voté et n'est pas en mode édition, afficher un message
    if (hasAlreadyVoted && !isEditMode) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="bg-white p-8 rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-4">Vous avez déjà voté sur cette contribution</h2>
                        <p className="mb-6">Votre vote: {existingReview?.status === "APPROVED" ? "Approuvé" : "Rejeté"}</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => router.push(`/community/${params.id}/posts/${params.postId}`)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Retour au post
                            </button>
                            <button
                                onClick={() => router.push(`/community/${params.id}/posts/${params.postId}/contributions/${params.contributionId}/review?edit=true`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Modifier mon vote
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Si l'utilisateur est en mode édition, afficher le formulaire d'édition
    if (isEditMode && existingReview) {
        return (
            <ContributionReview
                contributionId={parseInt(params.contributionId as string)}
                postId={parseInt(params.postId as string)}
                communityId={params.id as string}
                contributionTitle={contribution.title || "Contribution sans titre"}
                originalContent={contribution.original_content}
                modifiedContent={contribution.content}
                authorName={contribution.user.fullName}
                authorId={contribution.user.id}
                existingReview={existingReview}
            />
        );
    }

    // Sinon, afficher le formulaire de vote initial
    return (
        <ContributionReview
            contributionId={parseInt(params.contributionId as string)}
            postId={parseInt(params.postId as string)}
            communityId={params.id as string}
            contributionTitle={contribution.title || "Contribution sans titre"}
            originalContent={contribution.original_content}
            modifiedContent={contribution.content}
            authorName={contribution.user.fullName}
            authorId={contribution.user.id}
        />
    );
} 