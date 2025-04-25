"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DraftFeedbacks from "@/components/community/DraftFeedbacks";
import { Eye, ImageIcon, Save, ThumbsDown, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TextEditor } from "@/components/shared/TextEditor";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import PostEditorContainer, {
  PostData,
} from "@/components/community/PostEditorContainer";

export default function CreatePost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // État général de gestion des posts
  const [drafts, setDrafts] = useState<PostData[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<PostData | null>(null);

  // Initialiser les données du post à partir des paramètres d'URL (pour duplication)
  // Déplacé ici pour garantir l'ordre constant des hooks
  const initialData = useMemo(() => {
    const originalTitle = searchParams.get("title");
    const originalContent = searchParams.get("content");
    const originalCoverImage = searchParams.get("coverImageUrl");
    const originalTag = searchParams.get("tag");

    if (originalTitle || originalContent || originalCoverImage || originalTag) {
      return {
        title: originalTitle || "",
        content: originalContent || "",
        cover_image_url: originalCoverImage || "",
        tag: originalTag || "",
        accept_contributions: false,
      };
    }

    return undefined;
  }, [searchParams]);

  // Initialisation des données de post
  useEffect(() => {
    if (isAuthenticated) {
      checkContributorStatus();
      fetchDrafts();
    }
  }, [isAuthenticated]);

  // Charger le brouillon sélectionné
  useEffect(() => {
    const draftId = searchParams.get("draft_id");

    if (draftId && drafts.length > 0) {
      const draftToEdit = drafts.find(
        (draft) => draft.id === parseInt(draftId)
      );

      if (draftToEdit) {
        setSelectedDraft(draftToEdit);
      }
    }
  }, [searchParams, drafts]);

  // Vérifier le statut de contributeur
  const checkContributorStatus = async () => {
    try {
      const response = await fetch(`/api/communities/${params.id}/membership`);
      const data = await response.json();

      if (!data.isContributor) {
        toast.error(t("community_posts.contributor_required"));
        router.push(`/community/${params.id}`);
      }
    } catch (error) {
      console.error(t("community_posts.error"), error);
      router.push(`/community/${params.id}`);
    }
  };

  // Récupérer les brouillons
  const fetchDrafts = async () => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/drafts`
      );
      if (response.ok) {
        const data = await response.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error(t("community_posts.error_drafts"), error);
    }
  };

  // Soumettre le post
  const handleSubmitPost = async (postData: PostData) => {
    // Validation améliorée des champs obligatoires
    if (!postData.title.trim()) {
      toast.info(t("post_editor.title_required"));
      return;
    }

    if (!postData.tag) {
      toast.info(t("post_editor.category_required"));
      return;
    }

    if (typeof postData.content === "string" && postData.content.length < 100) {
      toast.info(t("post_editor.content_too_short"));
      return;
    }

    if (!postData.cover_image_url) {
      toast.info(t("post_editor.cover_image_required"));
      return;
    }

    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/pending`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) throw new Error(t("community_posts.error_create"));

      toast.success(t("community_posts.post_submitted"));

      if (selectedDraft?.id) {
        await fetch(
          `/api/communities/${params.id}/posts/drafts/${selectedDraft.id}`,
          {
            method: "DELETE",
          }
        );
      }

      router.push(`/community/${params.id}`);
    } catch (error) {
      toast.info(t("community_posts.error_create_post"));
    }
  };

  // Sauvegarder un brouillon
  const handleSaveDraft = async (draftData: PostData) => {
    try {
      const url = draftData.id
        ? `/api/communities/${params.id}/posts/drafts/${draftData.id}`
        : `/api/communities/${params.id}/posts/drafts`;

      const method = draftData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) throw new Error(t("community_posts.error_save_draft"));

      toast.success(t("community_posts.draft_saved"));
      fetchDrafts();

      // Si c'était un nouveau brouillon, réinitialiser la sélection
      if (!draftData.id) {
        setSelectedDraft(null);
      }
    } catch (error) {
      toast.error(t("community_posts.error_save_draft"));
    }
  };

  // Supprimer un brouillon
  const handleDeleteDraft = async (draftId: number) => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/drafts/${draftId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok)
        throw new Error(t("community_posts.error_delete_draft"));

      toast.success(t("community_posts.draft_deleted"));
      fetchDrafts();

      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
      }
    } catch (error) {
      toast.error(t("community_posts.error_delete_draft"));
    }
  };

  // Éditer un brouillon
  const handleEditDraft = (draft: PostData) => {
    setSelectedDraft(draft);
  };

  // Créer un nouveau brouillon
  const handleNewDraft = () => {
    setSelectedDraft(null);
  };

  // Retourner à la liste des brouillons
  const handleBackToDrafts = () => {
    // On garde le brouillon sélectionné mais on change juste l'affichage
    if (selectedDraft) {
      router.push(`/community/${params.id}/posts/create?view=drafts`);
    }
  };

  // Surveiller le paramètre de la vue
  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "drafts" && selectedDraft) {
      // Force l'affichage de l'onglet des brouillons même si un brouillon est sélectionné
      setSelectedDraft(null);
    }
  }, [searchParams]);

  // Rendu conditionnel pour l'authentification et le chargement
  if (isLoading || !isAuthenticated) return <LoadingComponent />;

  return (
    <PostEditorContainer
      initialData={initialData}
      communityId={params.id as string}
      onSubmit={handleSubmitPost}
      onSaveDraft={handleSaveDraft}
      submitButtonText={t("community_posts.propose_post")}
      showDrafts={true}
      drafts={drafts}
      onNewDraft={handleNewDraft}
      onEditDraft={handleEditDraft}
      onDeleteDraft={handleDeleteDraft}
      selectedDraft={selectedDraft}
      showFeedbacks={true}
      onBackToDrafts={handleBackToDrafts}
    />
  );
}
