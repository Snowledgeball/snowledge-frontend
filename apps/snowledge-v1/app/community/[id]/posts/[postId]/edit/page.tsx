"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTranslation } from "react-i18next";
import PostEditorContainer, {
  PostData,
} from "@/components/community/PostEditorContainer";
import { Loader } from "@/components/ui/loader";

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
  status: string;
}

// Cache pour stocker les données des posts
const postCache = new Map<string, Post>();

export default function EditPost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  const status = searchParams.get("status");
  const cacheKey = `${params.id}-${params.postId}-${status}`;

  // Fonction optimisée pour récupérer les données du post
  const fetchPost = useCallback(async () => {
    try {
      setIsLoadingPost(true);

      // Vérifier si les données sont dans le cache
      if (postCache.has(cacheKey)) {
        const cachedPost = postCache.get(cacheKey)!;
        setPost(cachedPost);
        setIsLoadingPost(false);
        return;
      }

      // Si pas dans le cache, faire la requête
      let response;
      if (status === "PUBLISHED") {
        response = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}`,
          {
            headers: {
              "Cache-Control": "max-age=120", // Cache de 2 minutes
            },
          }
        );
      } else {
        response = await fetch(
          `/api/communities/${params.id}/posts/pending/${params.postId}`,
          {
            headers: {
              "Cache-Control": "max-age=120", // Cache de 2 minutes
            },
          }
        );
      }

      if (!response.ok) throw new Error("Post non trouvé");
      const data = await response.json();

      // Mettre en cache les données
      postCache.set(cacheKey, data);
      setPost(data);
    } catch (error) {
      toast.error("Erreur lors du chargement du post");
      router.push(`/community/${params.id}`);
    } finally {
      setIsLoadingPost(false);
    }
  }, [params.id, params.postId, router, status, cacheKey]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Fonction pour mettre à jour le post
  const handleUpdatePost = async (postData: PostData) => {
    try {
      const endpoint =
        status === "PUBLISHED"
          ? `/api/communities/${params.id}/posts/${params.postId}`
          : `/api/communities/${params.id}/posts/pending/${params.postId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      // Nettoyer le cache
      postCache.delete(cacheKey);

      toast.success("Post mis à jour avec succès");

      // Rediriger vers la page de détail du post
      if (status === "PUBLISHED") {
        router.push(`/community/${params.id}/posts/${params.postId}`);
      } else {
        router.push(`/community/${params.id}/dashboard`);
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du post");
    }
  };

  if (isLoading || !isAuthenticated) {
    return <LoadingComponent />;
  }

  if (isLoadingPost || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Convertir le post en format PostData pour le composant
  const postData: PostData = {
    id: post.id,
    title: post.title,
    content: post.content,
    cover_image_url: post.cover_image_url || "",
    tag: post.tag,
    accept_contributions: post.accept_contributions,
    status: post.status,
  };

  return (
    <PostEditorContainer
      initialData={postData}
      communityId={params.id as string}
      onSubmit={handleUpdatePost}
      submitButtonText={t("actions.update")}
      showDrafts={false}
      showFeedbacks={false}
    />
  );
}
