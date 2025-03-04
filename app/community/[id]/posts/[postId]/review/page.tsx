"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import TinyEditor from "@/components/shared/TinyEditor";
import { useSession } from "next-auth/react";
import { CheckCircle, XCircle } from "lucide-react";

interface Post {
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
}

export default function ReviewPost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">(
    "APPROVED"
  );
  const authorId = searchParams.get("authorId");
  const isNotAuthor = authorId !== session?.user?.id;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/posts/pending/${params.postId}`
        );
        if (!response.ok) throw new Error("Post non trouvé");
        const data = await response.json();
        setPost(data);
      } catch (error) {
        toast.error("Erreur lors de la récupération du post");
        router.push(`/community/${params.id}/posts/pending`);
      }
    };

    fetchPost();
  }, [params.id, params.postId, router]);

  const handleSubmitReview = async () => {
    // try {
    //     const response = await fetch(`/api/communities/${params.id}/posts/pending/${params.postId}/reviews`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             content: reviewContent,
    //             status: reviewStatus
    //         }),
    //     });
    //     if (!response.ok) {
    //         const data = await response.json();
    //         throw new Error(data.error || 'Erreur lors de la soumission');
    //     }
    //     toast.success('Révision soumise avec succès');
    //     router.push(`/community/${params.id}/posts/pending`);
    // } catch (error) {
    //     if (error instanceof Error) {
    //         toast.error(error.message);
    //     } else {
    //         toast.error("Erreur lors de la soumission de la révision");
    //     }
    // }
  };

  if (isLoading || !post) return <LoadingComponent />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Réviser le post</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setReviewStatus("APPROVED")}
                  className={`flex-1 p-4 rounded-lg border ${
                    reviewStatus === "APPROVED"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      reviewStatus === "APPROVED"
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  />
                  <p className="text-center mt-2">Approuver</p>
                </button>

                <button
                  onClick={() => setReviewStatus("REJECTED")}
                  className={`flex-1 p-4 rounded-lg border ${
                    reviewStatus === "REJECTED"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200"
                  }`}
                >
                  <XCircle
                    className={`w-6 h-6 ${
                      reviewStatus === "REJECTED"
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                  <p className="text-center mt-2">Rejeter</p>
                </button>
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={!reviewContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Soumettre la révision
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            {/* En-tête du post */}
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src={post.user.profilePicture}
                alt={post.user.fullName}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{post.user.fullName}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>

            {/* Image de couverture */}
            {post.cover_image_url && (
              <div className="w-full h-48 relative mb-6 rounded-lg overflow-hidden">
                <Image
                  src={`https://${post.cover_image_url}`}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Titre */}
            <h2 className="text-2xl font-bold mb-6">{post.title}</h2>

            {/* Contenu avec TinyMCE en mode commentaire */}
            <TinyEditor
              // value={post.content}
              initialValue={post.content}
              onChange={() => {}} // Lecture seule
              commentMode={isNotAuthor}
              communityId={params.id as string}
              postId={params.postId as string}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
