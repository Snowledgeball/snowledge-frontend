"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import EnrichmentReview from "@/components/community/EnrichmentReview";
import { Loader } from "@/components/ui/loader";
import ReviewsSidebar from "@/components/community/ReviewsSidebar";
import { Columns, GitCompare } from "lucide-react";
import GoogleDocsStyleDiff from "@/components/shared/GoogleDocsStyleDiff";
import TinyMCEStyledText from "@/components/shared/TinyMCEStyledText";

interface Enrichment {
  id: number;
  title: string;
  content: string;
  original_content: string;
  created_at: string;
  user: {
    id: number;
    fullName: string;
  };
}

export default function ReviewContribution() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [enrichment, setEnrichment] = useState<Enrichment | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [viewMode, setViewMode] = useState("suggestion"); // "suggestion" ou "parallel"

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      toast.error("Vous devez être connecté pour accéder à cette page");
      router.push(`/community/${params.id}/posts/${params.postId}`);
      return;
    }

    // Vérifier si on est en mode créateur
    const creator = searchParams.get("creator");
    if (creator === "true") {
      setIsCreatorMode(true);
    }

    const fetchData = async () => {
      try {
        // Récupérer la session
        if (!session?.user?.id) return;

        // Vérifier que l'utilisateur est contributeur
        const membershipResponse = await fetch(
          `/api/communities/${params.id}/membership`
        );
        const membershipData = await membershipResponse.json();

        if (!membershipData.isContributor && !membershipData.isCreator) {
          toast.error(
            "Vous devez être contributeur ou créateur pour réviser un enrichissement"
          );
          router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        // Récupérer les données de la enrichment
        const enrichmentResponse = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`
        );

        if (!enrichmentResponse.ok) {
          toast.error("Erreur lors de la récupération de l'enrichissement");
          router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        const enrichmentData = await enrichmentResponse.json();
        setEnrichment(enrichmentData);

        // Vérifier si l'utilisateur est l'auteur de la enrichment
        if (
          (creator == null || creator == "false") &&
          enrichmentData.user_id === parseInt(session.user.id)
        ) {
          console.log("isCreatorMode", isCreatorMode);
          toast.error("Vous ne pouvez pas réviser votre propre enrichissement");
          //   router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        // Récupérer les données de la communauté
        const communityResponse = await fetch(`/api/communities/${params.id}`);
        const communityData = await communityResponse.json();

        // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
        const isContributor = communityData.community_contributors.some(
          (contributor: any) =>
            contributor.contributor_id === parseInt(session?.user?.id || "0")
        );
        const isCreator =
          communityData.creator.id === parseInt(session?.user?.id || "0");

        // Permettre l'accès à la page de revue si l'utilisateur est contributeur OU créateur
        if (!isContributor && !isCreator) {
          toast.error(
            "Vous n'avez pas les permissions pour accéder à cette page"
          );
        }

        // Vérifier si l'utilisateur a déjà voté
        const hasVotedResponse = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}/reviews/user`
        );

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
              toast.info("Vous avez déjà voté sur cet enrichissement", {
                description: `Votre vote: ${
                  hasVotedData.review.status === "APPROVED"
                    ? "Approuvé"
                    : "Rejeté"
                }`,
                duration: 5000,
                action: {
                  label: "Modifier",
                  onClick: () =>
                    router.push(
                      `/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}/review?edit=true`
                    ),
                },
              });
              router.push(`/community/${params.id}/posts/${params.postId}`);
            }
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Une erreur est survenue");
        router.push(`/community/${params.id}/posts/${params.postId}`);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [
    params.id,
    params.postId,
    params.enrichmentId,
    router,
    searchParams,
    session,
    status,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader
          size="lg"
          color="gradient"
          text="Chargement..."
          variant="spinner"
        />
      </div>
    );
  }

  if (!session || !enrichment) return null;

  // Si l'utilisateur a déjà voté et n'est pas en mode édition, afficher un message
  if (hasAlreadyVoted && !isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">
              Vous avez déjà voté sur cet enrichissement
            </h2>
            <p className="mb-6">
              Votre vote:{" "}
              {existingReview?.status === "APPROVED" ? "Approuvé" : "Rejeté"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() =>
                  router.push(`/community/${params.id}/posts/${params.postId}`)
                }
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour au post
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}/review?edit=true`
                  )
                }
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

  if (isCreatorMode) {
    return (
      <div className="flex">
        {/* On affiche le contenu du post simplement */}
        <div className="mb-6 max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Comparaison du contenu</h2>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Mode d'affichage:</span>
              <button
                onClick={() => setViewMode("suggestion")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
                  viewMode === "suggestion"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>Suggestion</span>
              </button>
              <button
                onClick={() => setViewMode("parallel")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
                  viewMode === "parallel"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Columns className="w-4 h-4" />
                <span>Côte à côte</span>
              </button>
            </div>
          </div>

          {viewMode === "suggestion" && (
            <div className="border rounded-lg overflow-hidden">
              <GoogleDocsStyleDiff
                oldHtml={enrichment.original_content}
                newHtml={enrichment.content}
                showControls={false}
                readOnly={true}
                description="Modifications proposées"
              />
            </div>
          )}

          {viewMode === "parallel" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium mb-2 text-gray-700">
                  Contenu original
                </h3>
                <TinyMCEStyledText content={enrichment.original_content} />
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-medium mb-2 text-blue-700">
                  Contenu modifié
                </h3>
                <TinyMCEStyledText content={enrichment.content} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar des reviews */}
        {enrichment && (
          <div className="w-80">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">
                  Conseils pour l'édition
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Consultez les feedbacks des contributeurs pour améliorer votre
                  enrichissement et augmenter vos chances d'approbation.
                </p>
              </div>

              <ReviewsSidebar
                communityId={params.id as string}
                postId={params.postId as string}
                type="enrichment"
                enrichmentId={params.enrichmentId as string}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Si l'utilisateur est en mode édition, afficher le formulaire d'édition
  if (isEditMode && existingReview && !isCreatorMode) {
    return (
      <EnrichmentReview
        enrichmentId={parseInt(params.enrichmentId as string)}
        postId={parseInt(params.postId as string)}
        communityId={params.id as string}
        enrichmentTitle={enrichment.title || "Enrichissement sans titre"}
        originalContent={enrichment.original_content}
        modifiedContent={enrichment.content}
        authorName={enrichment.user.fullName}
        authorId={enrichment.user.id}
        existingReview={existingReview}
      />
    );
  }

  // Sinon, afficher le formulaire de vote initial
  return (
    <EnrichmentReview
      enrichmentId={parseInt(params.enrichmentId as string)}
      postId={parseInt(params.postId as string)}
      communityId={params.id as string}
      enrichmentTitle={enrichment.title || "Enrichissement sans titre"}
      originalContent={enrichment.original_content}
      modifiedContent={enrichment.content}
      authorName={enrichment.user.fullName}
      authorId={enrichment.user.id}
    />
  );
}
