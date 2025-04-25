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

// Import avec rendu côté client uniquement sans SSR
const PreviewRenderer = dynamic(
  () => import("@/components/shared/PreviewRenderer"),
  { ssr: false }
);

export interface PostData {
  created_at?: string;
  was_rejected?: any;
  updated_at?: string;
  id?: number;
  title: string;
  content: string;
  cover_image_url: string;
  tag: string;
  accept_contributions?: boolean;
  status?: string;
}

interface Category {
  id: string;
  name: string;
  label?: string;
}

export default function CreatePost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // État général de gestion des posts
  const [drafts, setDrafts] = useState<PostData[]>([]);
  const [activeTab, setActiveTab] = useState("new");
  const [selectedDraft, setSelectedDraft] = useState<PostData | null>(null);

  // États de l'éditeur de post (anciennement dans PostEditor)
  const [postTitle, setPostTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [contributionsEnabled, setContributionsEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewHTML, setPreviewHTML] = useState("");

  // Initialisation des données de post
  useEffect(() => {
    if (isAuthenticated) {
      checkContributorStatus();
      fetchDrafts();
      fetchCategories();
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
        setPostTitle(draftToEdit.title || "");
        setEditorContent(draftToEdit.content || "");
        setCoverImage(draftToEdit.cover_image_url || "");
        setSelectedTag(draftToEdit.tag || "");
        setContributionsEnabled(draftToEdit.accept_contributions || false);
        setActiveTab("edit");
      }
    }
  }, [searchParams, drafts]);

  // Récupérer les données du post original (pour duplication)
  useEffect(() => {
    const originalTitle = searchParams.get("title");
    const originalContent = searchParams.get("content");
    const originalCoverImage = searchParams.get("coverImageUrl");
    const originalTag = searchParams.get("tag");

    if (originalTitle) setPostTitle(originalTitle);
    if (originalContent) setEditorContent(originalContent);
    if (originalCoverImage) setCoverImage(originalCoverImage);
    if (originalTag) setSelectedTag(originalTag);
  }, [searchParams]);

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

  // Récupérer les catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/communities/${params.id}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
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

  // Gérer l'upload d'image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(t("post_editor.upload_error"));

      const data = await response.json();
      setCoverImage(data.url);
      toast.success(t("post_editor.image_uploaded"));
    } catch (error) {
      toast.error(t("post_editor.image_upload_error"));
    } finally {
      setIsUploading(false);
    }
  };

  // Soumettre le post
  const handleSubmitPost = async () => {
    if (!postTitle || !editorContent || !selectedTag) {
      toast.error(t("post_editor.fill_all_fields"));
      return;
    }

    if (typeof editorContent === "string" && editorContent.length < 100) {
      toast.error(t("post_editor.content_too_short"));
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        title: postTitle,
        content: editorContent,
        cover_image_url: coverImage,
        tag: selectedTag,
        accept_contributions: contributionsEnabled,
      };

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
      toast.error(t("community_posts.error_create_post"));
    } finally {
      setIsSaving(false);
    }
  };

  // Sauvegarder comme brouillon
  const handleSaveDraft = async () => {
    if (!postTitle && !editorContent && !selectedTag) {
      toast.error(t("post_editor.fill_one_field"));
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        title: postTitle,
        content: editorContent,
        cover_image_url: coverImage,
        tag: selectedTag,
        accept_contributions: contributionsEnabled,
        status: "DRAFT",
      };

      const method = selectedDraft?.id ? "PUT" : "POST";
      const url = selectedDraft?.id
        ? `/api/communities/${params.id}/posts/drafts/${selectedDraft.id}`
        : `/api/communities/${params.id}/posts/drafts`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error(t("community_posts.error_save"));

      toast.success(t("community_posts.draft_saved"));
      fetchDrafts();

      if (!selectedDraft?.id) {
        const data = await response.json();
        setSelectedDraft({ ...postData, id: data.id });
      }
    } catch (error) {
      toast.error(t("community_posts.error_save_draft"));
    } finally {
      setIsSaving(false);
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

      if (!response.ok) throw new Error(t("community_posts.error_delete"));

      toast.success(t("community_posts.draft_deleted"));
      fetchDrafts();

      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
        setActiveTab("new");
      }
    } catch (error) {
      toast.error(t("community_posts.error_delete_draft"));
    }
  };

  // Éditer un brouillon
  const handleEditDraft = (draft: PostData) => {
    setSelectedDraft(draft);
    setPostTitle(draft.title || "");
    setEditorContent(draft.content || "");
    setCoverImage(draft.cover_image_url || "");
    setSelectedTag(draft.tag || "");
    setContributionsEnabled(draft.accept_contributions || false);
    setActiveTab("edit");
  };

  // Contenu de la prévisualisation mémorisé
  const previewContent = useMemo(() => {
    return (
      <div className="py-4">
        {/* Image de couverture */}
        {coverImage && (
          <div className="w-full h-48 relative mb-6 rounded-lg overflow-hidden">
            <Image
              src={`https://${coverImage}`}
              alt={t("post_editor.cover")}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Tag */}
        {selectedTag && (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm mb-4">
            {categories.find((t) => t.id === selectedTag)?.name || selectedTag}
          </span>
        )}

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {postTitle || t("post_editor.untitled")}
        </h1>

        {/* Contenu */}
        <div dangerouslySetInnerHTML={{ __html: previewHTML }} />

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {contributionsEnabled
                ? `✅ ${t("community_posts.contributions_enabled")}`
                : `❌ ${t("community_posts.contributions_disabled")}`}
            </span>
            <span>
              {new Date().toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }, [
    coverImage,
    selectedTag,
    postTitle,
    previewHTML,
    contributionsEnabled,
    categories,
    t,
  ]);

  // Rendu conditionnel pour l'authentification et le chargement
  if (isLoading) return <LoadingComponent />;
  if (!isAuthenticated) return null;

  // Fonction pour rendre l'éditeur (utilisée pour les onglets "new" et "edit")
  const renderEditor = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
            <Switch
              checked={contributionsEnabled}
              onCheckedChange={setContributionsEnabled}
              className="data-[state=checked]:bg-green-600"
            />
            <label className="text-gray-600 flex items-center">
              {t("voting.contributions")}
            </label>
          </div>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md flex items-center gap-2"
          >
            <Eye size={18} />
            {t("post_editor.preview")}
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {t("community_posts.save_draft")}
          </button>

          <button
            onClick={handleSubmitPost}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t("actions.publish")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <div className="flex w-full space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="file"
              id="cover-image"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {coverImage ? (
              <Image
                src={`https://${coverImage}`}
                alt="Cover Image"
                width={75}
                height={75}
                className="rounded-lg"
              />
            ) : (
              <label
                htmlFor="cover-image"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-center"
              >
                {isUploading ? "Upload..." : t("post_editor.add_cover_image")}
              </label>
            )}
            {coverImage && (
              <label
                htmlFor="cover-image"
                className={`px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {t("post_editor.modify")}
              </label>
            )}
          </div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">{t("post_editor.choose_category")}</option>
            {categories.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.label || tag.name}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          placeholder={t("post_editor.article_title")}
          className="mt-8 w-full text-2xl font-bold border border-gray-200 mb-4 px-4 py-2 rounded-lg"
        />
        <TextEditor value={editorContent} onChange={setEditorContent} />
      </div>

      {/* Modal de prévisualisation avec composant client-side uniquement */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{t("post_editor.post_preview")}</DialogTitle>
          </DialogHeader>
          {isPreviewOpen && (
            <PreviewRenderer
              editorContent={editorContent}
              onHtmlGenerated={setPreviewHTML}
            />
          )}
          {previewContent}
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[85rem] mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger
              value="new"
              onClick={() =>
                router.push(`/community/${params.id}/posts/create`)
              }
            >
              {t("community_posts.new_post")}
            </TabsTrigger>
            <TabsTrigger value="drafts">
              {t("community_posts.drafts")} ({drafts.length})
            </TabsTrigger>
            {selectedDraft && (
              <TabsTrigger value="edit">
                {t("community_posts.edit_draft")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="new">{renderEditor()}</TabsContent>

          <TabsContent value="drafts">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {t("community_posts.my_drafts")}
              </h2>
              {drafts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {t("community_posts.no_drafts")}
                </p>
              ) : (
                <div className="space-y-6">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {draft.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t("community_posts.last_modified")}:{" "}
                            {new Date(
                              draft.updated_at || draft.created_at || ""
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDraft(draft)}
                          >
                            {t("actions.edit")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDraft(draft.id!)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {t("actions.delete")}
                          </Button>
                        </div>
                      </div>

                      {draft.was_rejected && (
                        <DraftFeedbacks
                          communityId={params.id as string}
                          postId={draft.id!}
                          variant="inline"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            {selectedDraft && (
              <div className="flex gap-6">
                <div className="flex-1">{renderEditor()}</div>

                {selectedDraft.was_rejected && searchParams.get("draft_id") && (
                  <div className="w-80">
                    <div className="sticky top-6">
                      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <h3 className="text-lg font-medium mb-2">
                          {t("community_posts.feedbacks_received")}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {t("community_posts.feedback_description")}
                        </p>
                      </div>

                      <DraftFeedbacks
                        communityId={params.id as string}
                        postId={selectedDraft.id!}
                        expanded={true}
                        variant="sidebar"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
