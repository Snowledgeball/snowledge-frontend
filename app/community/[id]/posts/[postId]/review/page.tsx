"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import ReviewCreation from "@/components/community/ReviewCreation";
import EditReviewCreation from "@/components/community/EditReviewCreation";
// import EnrichmentReview from "@/components/community/EnrichmentReview"; // Ce composant sera créé plus tard pour les contributions
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ReviewPost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isContributor, setIsContributor] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { data: session } = useSession();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier que l'utilisateur est contributeur
        const membershipResponse = await fetch(
          `/api/communities/${params.id}/membership`
        );
        const membershipData = await membershipResponse.json();
        setIsContributor(membershipData.isContributor);
        setIsCreator(membershipData.isCreator);

        if (!membershipData.isContributor && !membershipData.isCreator) {
          toast.error("Vous devez être contributeur pour réviser un post");
          router.push(`/community/${params.id}`);
          return;
        }

        // Récupérer les données du post
        const postResponse = await fetch(
          `/api/communities/${params.id}/posts/pending/${params.postId}`
        );

        console.log("postResponse", postResponse);
        if (!postResponse.ok) {
          toast.error("Erreur lors de la récupération du post");
          router.push(`/community/${params.id}`);
          return;
        }

        const postData = await postResponse.json();
        setPost(postData);
        console.log("postData", postData);

        // Récupérer les données de la communauté
        const communityResponse = await fetch(`/api/communities/${params.id}`);
        const communityData = await communityResponse.json();

        console.log("communityData", communityData);

        // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
        const isContributor = membershipData.isContributor;
        const isCreator = communityData.creator_id == session?.user?.id;

        console.log("communityData.creator_id", communityData.creator_id);
        console.log("session?.user.id", session?.user.id);

        console.log("isContributor", isContributor);
        console.log("isCreator", isCreator);

        // Permettre l'accès à la page de revue si l'utilisateur est contributeur OU créateur
        if (!isContributor && !isCreator) {
          redirect(`/community/${params.id}`);
        }

        // Vérifier si l'utilisateur est l'auteur du post
        if (postData.authorId === session?.user?.id) {
          redirect(`/community/${params.id}/posts/${params.postId}`);
        }

        // Vérifier si l'utilisateur a déjà voté    
        const hasVotedResponse = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}/reviews/user`
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
              toast.info("Vous avez déjà voté sur ce post", {
                description: `Votre vote: ${hasVotedData.review.status === "APPROVED" ? "Approuvé" : "Rejeté"}`,
                duration: 5000,
                action: {
                  label: "Modifier",
                  onClick: () => router.push(`/community/${params.id}/posts/${params.postId}/review?authorId=${postData.authorId}&edit=true`),
                },
              });
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log("Erreur:", error.stack);
        } else {
          console.log("Une erreur inattendue s'est produite");
        }
        toast.error("Une erreur est survenue");
        router.push(`/community/${params.id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.postId, router, searchParams]);

  if (isLoading || loading) return <LoadingComponent />;
  if (!isAuthenticated || !post) return null;

  // Si l'utilisateur a déjà voté et n'est pas en mode édition, afficher un message
  if (hasAlreadyVoted && !isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Vous avez déjà voté sur ce post</h2>
            <p className="mb-6">Votre vote: {existingReview?.status === "APPROVED" ? "Approuvé" : "Rejeté"}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push(`/community/${params.id}`)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à la communauté
              </button>
              <button
                onClick={() => router.push(`/community/${params.id}/posts/${params.postId}/review?authorId=${post.authorId}&edit=true`)}
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
      <EditReviewCreation
        postId={parseInt(params.postId as string)}
        communityId={params.id as string}
        postTitle={post.title}
        postContent={post.content}
        coverImageUrl={post.cover_image_url}
        authorName={post.user.fullName}
        authorId={post.authorId}
        existingReview={existingReview}
      />
    );
  }

  // Sinon, afficher le formulaire de vote initial
  return (
    <ReviewCreation
      postId={parseInt(params.postId as string)}
      communityId={params.id as string}
      postTitle={post.title}
      postContent={post.content}
      coverImageUrl={post.cover_image_url}
      authorName={post.user.fullName}
      authorId={post.authorId}
    />
  );
}
