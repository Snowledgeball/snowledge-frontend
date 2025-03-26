"use client";

import {
  useParams,
  useSearchParams,
  useRouter,
  redirect,
} from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import ReviewCreation from "@/components/community/ReviewCreation";
import EditReviewCreation from "@/components/community/EditReviewCreation";
import { useSession } from "next-auth/react";
import ReviewsSidebar from "@/components/community/ReviewsSidebar";
import TinyMCEStyledText from "@/components/shared/TinyMCEStyledText";

export default function ReviewPost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isContributor, setIsContributor] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatorMode, setIsCreatorMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier que l'utilisateur est contributeur
        const membershipResponse = await fetch(
          `/api/communities/${params.id}/membership`
        );
        if (!membershipResponse.ok) {
          throw new Error(`HTTP error! status: ${membershipResponse.status}`);
        }

        const membershipData = await membershipResponse.json();
        setIsContributor(membershipData.isContributor);
        setIsCreator(membershipData.isCreator);

        if (!membershipData.isContributor && !membershipData.isCreator) {
          toast.error("Vous devez être contributeur pour réviser un post");
          router.push(`/community/${params.id}`);
          return;
        }
        // Vérifier si on est en mode créateur
        const creator = searchParams.get("creator");
        if (creator === "true") {
          setIsCreatorMode(true);
        }

        // Récupérer les données du post
        const postResponse = await fetch(
          `/api/communities/${params.id}/posts/pending/${params.postId}`
        );

        if (!postResponse.ok) {
          toast.error("Erreur lors de la récupération du post");
          console.log("iciErreur");
          router.push(`/community/${params.id}`);
          return;
        }

        const postData = await postResponse.json();
        setPost(postData);

        // Récupérer les données de la communauté
        const communityResponse = await fetch(`/api/communities/${params.id}`);
        const communityData = await communityResponse.json();

        // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
        const isContributor = membershipData.isContributor;
        const isCreator = communityData.creator_id == session?.user?.id;

        // Permettre l'accès à la page de revue si l'utilisateur est contributeur OU créateur
        if (!isContributor && !isCreator) {
          toast.error(
            "Vous n'avez pas les permissions pour accéder à cette page"
          );
          router.push(`/community/${params.id}`);
        }
        // Empecher l'accès à la page de revue si l'utilisateur est l'auteur du post si y a pas ?creator=true
        if (postData.authorId === session?.user?.id && !creator) {
          toast.error("Vous ne pouvez pas voter sur votre propre post");
          router.push(`/community/${params.id}`);
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
                      `/community/${params.id}/posts/${params.postId}/review?authorId=${postData.authorId}&edit=true`
                    ),
                },
              });
            }
          }
        }
      } catch (error) {
        console.log("ici");
        console.log("Error fetching data:", error);
        toast.error("ici");
        // router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  if (isLoading || loading || status === "loading") {
    return <LoadingComponent />;
  }
  if (!isAuthenticated || !post) return null;

  // Si l'utilisateur a déjà voté et n'est pas en mode édition, afficher un message
  if (hasAlreadyVoted && !isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">
              Vous avez déjà voté sur ce post
            </h2>
            <p className="mb-6">
              Votre vote:{" "}
              {existingReview?.status === "APPROVED" ? "Approuvé" : "Rejeté"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push(`/community/${params.id}`)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à la communauté
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/community/${params.id}/posts/${params.postId}/review?authorId=${post.authorId}&edit=true`
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
        <div className="w-full">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            {/* Contenu */}
            <TinyMCEStyledText content={post.content} />
          </div>
        </div>

        {/* Sidebar des reviews */}
        {post && post.status === "PENDING" && (
          <div className="w-80">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <h3 className="text-lg font-medium mb-2">
                  Conseils pour l'édition
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Consultez les feedbacks des contributeurs pour améliorer votre
                  post et augmenter vos chances d'approbation.
                </p>
              </div>

              <ReviewsSidebar
                communityId={params.id as string}
                postId={params.postId as string}
                type="post"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

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
