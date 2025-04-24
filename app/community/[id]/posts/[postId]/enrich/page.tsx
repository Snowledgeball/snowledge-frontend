"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import EnrichmentEditor from "@/components/community/EnrichmentEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function ContributePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  const [originalContent, setOriginalContent] = useState("");
  const [modifiedContent, setModifiedContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    if (status === "unauthenticated") {
      toast.error(t("enrichment.login_required"));
      router.push(`/community/${params.id}/posts/${params.postId}`);
      return;
    }

    // Récupérer le contenu original du post
    const fetchPost = async () => {
      try {
        setLoading(true);

        // Vérifier que l'utilisateur est membre de la communauté
        const membershipResponse = await fetch(
          `/api/communities/${params.id}/membership`
        );
        if (!membershipResponse.ok) {
          toast.error(t("enrichment.membership_verification_error"));
          router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        const membershipData = await membershipResponse.json();
        if (!membershipData.isMember) {
          toast.error(t("enrichment.member_required"));
          router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        // Récupérer le post
        const postResponse = await fetch(
          `/api/communities/${params.id}/posts/${params.postId}`
        );
        if (!postResponse.ok) {
          toast.error(t("enrichment.post_fetch_error"));
          router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        const post = await postResponse.json();

        // Vérifier que le post accepte les contributions
        if (!post.accept_contributions) {
          toast.error(t("enrichment.contributions_not_accepted"));
          router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        // Vérifier que l'utilisateur n'est pas l'auteur du post
        if (post.author_id === parseInt(session?.user?.id || "0")) {
          toast.error(t("enrichment.cannot_contribute_own_post"));
          router.push(`/community/${params.id}/posts/${params.postId}`);
          return;
        }

        setOriginalContent(post.content);
        setModifiedContent(post.content); // Initialiser avec le contenu original
        setPostTitle(post.title);
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error(t("enrichment.general_error"));
        router.push(`/community/${params.id}/posts/${params.postId}`);
      }
    };

    if (session) {
      fetchPost();
    }
  }, [session, status, params.id, params.postId, router, t]);

  const handleSubmit = async () => {
    if (originalContent === modifiedContent) {
      toast.error(t("enrichment.no_changes"));
      return;
    }

    if (!description) {
      toast.error(t("enrichment.description_required"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/${params.postId}/enrichments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: description.slice(0, 60),
            content: modifiedContent,
            original_content: originalContent,
            description,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success(t("enrichment.contribution_submitted"));
      router.push(`/community/${params.id}/posts/${params.postId}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error ? error.message : t("enrichment.general_error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex justify-center items-center min-h-[70vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2">{t("loading.post")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/community/${params.id}/posts/${params.postId}`}
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("actions.back")}
        </Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {t("enrichment.contribute_to")}: {postTitle}
        </h1>

        <EnrichmentEditor
          originalContent={originalContent}
          initialModifiedContent={modifiedContent}
          description={description}
          onDescriptionChange={setDescription}
          onContentChange={setModifiedContent}
        />

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/community/${params.id}/posts/${params.postId}`)
            }
          >
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              originalContent === modifiedContent ||
              !description
            }
          >
            {isSubmitting ? t("enrichment.submitting") : t("actions.submit")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
