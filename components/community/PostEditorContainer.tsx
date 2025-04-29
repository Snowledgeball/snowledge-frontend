"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, ImageIcon, Save } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { TextEditor } from "@/components/shared/TextEditor";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DraftFeedbacks from "@/components/community/DraftFeedbacks";
import { Loader } from "@/components/ui/loader";

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
  id: number;
  name: string;
  label?: string;
}

export interface PostEditorContainerProps {
  initialData?: PostData;
  communityId: string;
  onSubmit?: (data: PostData) => void;
  onContentChange?: (content: string) => void;
  onSaveDraft?: (data: PostData) => void;
  submitButtonText?: string;
  showDrafts?: boolean;
  drafts?: PostData[];
  onNewDraft?: () => void;
  onEditDraft?: (draft: PostData) => void;
  onDeleteDraft?: (draftId: number) => void;
  selectedDraft?: PostData | null;
  showFeedbacks?: boolean;
  showPreview?: boolean;
  readOnly?: boolean;
  onlyContent?: boolean;
}

export default function PostEditorContainer({
  initialData,
  communityId,
  onSubmit,
  onContentChange,
  onSaveDraft,
  submitButtonText,
  showDrafts = false,
  drafts = [],
  onNewDraft,
  onEditDraft,
  onDeleteDraft,
  selectedDraft = null,
  showFeedbacks = false,
  showPreview = true,
  readOnly = false,
  onlyContent = false,
}: PostEditorContainerProps) {
  const { t } = useTranslation();

  // États pour l'édition
  const [postTitle, setPostTitle] = useState(initialData?.title || "");
  const [editorContent, setEditorContent] = useState(
    initialData?.content || ""
  );
  const [coverImage, setCoverImage] = useState(
    initialData?.cover_image_url || ""
  );
  const [selectedTag, setSelectedTag] = useState(initialData?.tag || "");
  const [contributionsEnabled, setContributionsEnabled] = useState(
    initialData?.accept_contributions || false
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null); // ID du brouillon en cours de suppression
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewHTML, setPreviewHTML] = useState("");
  const [activeTab, setActiveTab] = useState(selectedDraft ? "edit" : "new");

  const buttonText = submitButtonText || t("post_editor.submit_post");

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setPostTitle("");
    setEditorContent("");
    setCoverImage("");
    setSelectedTag("");
    setContributionsEnabled(false);
    setPreviewHTML("");
  };

  // Fonction pour gérer le clic sur "nouveau"
  const handleNewDraftClick = () => {
    resetForm();
    setActiveTab("new");
    if (onNewDraft) {
      onNewDraft();
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/categories`
        );
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error(t("post_editor.error_categories"));
      }
    };
    fetchCategories();
  }, [communityId, t]);

  // Mettre à jour les valeurs lorsque le brouillon sélectionné change
  useEffect(() => {
    if (selectedDraft) {
      setPostTitle(selectedDraft.title || "");
      setEditorContent(selectedDraft.content || "");
      setCoverImage(selectedDraft.cover_image_url || "");
      setSelectedTag(selectedDraft.tag || "");
      setContributionsEnabled(selectedDraft.accept_contributions || false);
      // Passer automatiquement à l'onglet d'édition lorsqu'un brouillon est sélectionné
      setActiveTab("edit");
    } else if (initialData && !selectedDraft) {
      // Si pas de brouillon sélectionné mais on a des données initiales
      setPostTitle(initialData.title || "");
      setEditorContent(initialData.content || "");
      setCoverImage(initialData.cover_image_url || "");
      setSelectedTag(initialData.tag || "");
      setContributionsEnabled(initialData.accept_contributions || false);
    } else if (!initialData && !selectedDraft && activeTab === "new") {
      // Si on passe à l'onglet nouveau et qu'on n'a ni brouillon ni données initiales
      resetForm();
    }
  }, [selectedDraft, initialData, activeTab]);

  // Handler pour la soumission du formulaire
  const handleSubmit = () => {
    if (!onSubmit) return;

    if (!postTitle.trim() || !editorContent || !selectedTag) {
      toast.info(t("post_editor.fill_all_fields"));
      return;
    }

    setIsSubmitting(true);

    const postData = {
      id: initialData?.id || selectedDraft?.id,
      title: postTitle,
      content: editorContent,
      cover_image_url: coverImage,
      tag: selectedTag,
      accept_contributions: contributionsEnabled,
      status: initialData?.status,
    };

    try {
      onSubmit(postData);
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.info(t("post_editor.submission_error"));
      setIsSubmitting(false); // Assurer que isSubmitting est remis à false en cas d'erreur
    }
  };

  // Handler pour la sauvegarde comme brouillon
  const handleSaveDraft = () => {
    if (!onSaveDraft) return;

    // Liste des champs manquants
    const missingFields = [];

    if (!postTitle.trim()) {
      missingFields.push(t("post_editor.field_title"));
    }

    if (!editorContent || editorContent.length < 10) {
      missingFields.push(t("post_editor.field_content"));
    }

    if (!selectedTag) {
      missingFields.push(t("post_editor.field_category"));
    }

    // Si tous les champs sont manquants, afficher un message global
    if (missingFields.length === 4) {
      toast.info(t("post_editor.all_fields_empty"));
      return;
    }

    // Si certains champs sont manquants, afficher lesquels
    if (missingFields.length > 0) {
      toast.info(
        `${t("post_editor.missing_fields")}: ${missingFields.join(", ")}`
      );
      return;
    }

    setIsSavingDraft(true);

    const draftData = {
      id: selectedDraft?.id,
      title: postTitle,
      content: editorContent,
      cover_image_url: coverImage,
      tag: selectedTag,
      accept_contributions: contributionsEnabled,
      status: "DRAFT",
    };

    try {
      onSaveDraft(draftData);
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.info(t("post_editor.save_error"));
    } finally {
      setIsSavingDraft(false);
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

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setCoverImage(data.url);
      toast.success(t("post_editor.image_uploaded"));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.info(t("post_editor.image_upload_error"));
    } finally {
      setIsUploading(false);
    }
  };

  // Mémoriser le contenu de prévisualisation
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
            {categories.find((t) => t.id === Number(selectedTag))?.label}
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

  // Fonction pour rendre l'éditeur
  const renderEditor = () => (
    <>
      {onlyContent ? (
        <div>
          <TextEditor
            value={editorContent}
            onChange={(value) => {
              setEditorContent(value);
              onContentChange?.(value);
            }}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 p-6 rounded-xl">
          {!readOnly && (
            <div className="flex justify-end items-center mb-6 gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                  <Switch
                    checked={contributionsEnabled}
                    onCheckedChange={setContributionsEnabled}
                    className="data-[state=checked]:bg-green-600"
                    disabled={readOnly}
                  />
                  <label className="text-gray-700 flex items-center font-medium">
                    {t("voting.contributions")}
                  </label>
                </div>

                {showPreview && (
                  <button
                    onClick={() => {
                      // Vérifier que des contenus sont disponibles pour la prévisualisation
                      if (
                        !postTitle.trim() &&
                        !editorContent &&
                        !selectedTag &&
                        !coverImage
                      ) {
                        toast.info(t("post_editor.preview_needs_content"));
                        return;
                      }
                      setIsPreviewOpen(true);
                    }}
                    className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {t("post_editor.preview")}
                  </button>
                )}

                {onSaveDraft && (
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isSubmitting || readOnly}
                    className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingDraft ? (
                      <Loader size="sm" color="gradient" variant="spinner" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    )}
                    {isSavingDraft
                      ? t("post_editor.saving")
                      : t("community_posts.save_draft")}
                  </button>
                )}

                {onSubmit && (
                  <button
                    onClick={handleSubmit}
                    disabled={isSavingDraft || isSubmitting || readOnly}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader size="sm" color="gradient" variant="spinner" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                    {isSubmitting ? t("post_editor.processing") : buttonText}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="flex w-full flex-col md:flex-row gap-4 mb-6">
              {!readOnly && (
                <div className="flex flex-col space-y-2 flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("post_editor.cover_image")}
                  </label>
                  <input
                    type="file"
                    id="cover-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={readOnly}
                  />
                  {coverImage ? (
                    <div className="relative">
                      <Image
                        src={`https://${coverImage}`}
                        alt="Cover Image"
                        width={150}
                        height={100}
                        className="rounded-lg object-cover mb-2 border border-gray-200"
                      />
                      {!readOnly && (
                        <label
                          htmlFor="cover-image"
                          className={`px-4 py-2 text-sm text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border border-blue-200 inline-block ${
                            isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isUploading ? (
                            <span className="flex items-center gap-2">
                              <Loader
                                size="sm"
                                color="gradient"
                                variant="spinner"
                              />
                              {t("post_editor.uploading")}
                            </span>
                          ) : (
                            t("post_editor.modify")
                          )}
                        </label>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="cover-image"
                      className={`w-full h-32 px-4 py-2 flex flex-col items-center justify-center text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-2 border-dashed border-blue-200 ${
                        readOnly ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader
                            size="md"
                            color="gradient"
                            variant="spinner"
                          />
                          <span>{t("post_editor.uploading")}</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 mb-2 text-blue-400" />
                          {t("post_editor.add_cover_image")}
                        </>
                      )}
                    </label>
                  )}
                </div>
              )}

              {!readOnly && (
                <div className="flex flex-col space-y-2 flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("community_posts.drafts")}
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={readOnly}
                  >
                    <option value="">{t("post_editor.choose_category")}</option>
                    {categories.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.label || tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t("voting.title")}
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder={t("post_editor.article_title")}
              className="w-full text-2xl font-bold border border-gray-200 shadow-sm mb-6 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={readOnly}
            />

            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t("voting.content")}
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-12">
              <TextEditor value={editorContent} onChange={setEditorContent} />
            </div>
          </div>

          {/* Modal de prévisualisation avec composant client-side uniquement */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {t("post_editor.post_preview")}
                </DialogTitle>
              </DialogHeader>
              {isPreviewOpen && !previewHTML && (
                <div className="flex justify-center py-12">
                  <Loader
                    size="lg"
                    color="gradient"
                    variant="spinner"
                    text={t("post_editor.generating_preview")}
                  />
                </div>
              )}
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
      )}
    </>
  );

  // Afficher la liste des brouillons
  const renderDraftsList = () => (
    <Card className="p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {t("community_posts.my_drafts")}
      </h2>
      {drafts === undefined ? (
        <div className="flex justify-center py-16">
          <Loader
            size="lg"
            color="gradient"
            variant="spinner"
            text={t("community_posts.loading_drafts")}
          />
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="mb-3 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
          </div>
          <p className="text-gray-500 text-lg">
            {t("community_posts.no_drafts")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {draft.title || t("post_editor.untitled")}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("community_posts.last_modified")}:{" "}
                    {new Date(
                      draft.updated_at || draft.created_at || ""
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditDraft && onEditDraft(draft)}
                    className="font-medium"
                  >
                    {t("actions.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onDeleteDraft &&
                      draft.id &&
                      handleDeleteDraftClick(draft.id)
                    }
                    className="text-red-600 border-red-200 hover:bg-red-50 font-medium"
                    disabled={isDeleting === draft.id}
                  >
                    {isDeleting === draft.id ? (
                      <Loader size="sm" color="gradient" variant="spinner" />
                    ) : (
                      t("actions.delete")
                    )}
                  </Button>
                </div>
              </div>

              {draft.was_rejected && onEditDraft && (
                <DraftFeedbacks
                  communityId={communityId}
                  postId={draft.id!}
                  variant="inline"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  // Fonction pour gérer la suppression d'un brouillon
  const handleDeleteDraftClick = async (draftId: number) => {
    if (!onDeleteDraft) return;

    setIsDeleting(draftId);
    try {
      await onDeleteDraft(draftId);
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error(t("post_editor.delete_error"));
    } finally {
      setIsDeleting(null);
    }
  };

  // Si on n'affiche pas les brouillons, on montre uniquement l'éditeur
  if (!showDrafts) {
    return renderEditor();
  }

  // Sinon on montre les onglets avec l'éditeur et les brouillons
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[85rem] mx-auto px-4">
        <Tabs
          value={activeTab}
          onValueChange={(newTab) => {
            // Force la désélection du brouillon lorsqu'on revient à la liste
            if (newTab === "drafts" && selectedDraft) {
              if (onNewDraft) onNewDraft();
            }
            setActiveTab(newTab);
          }}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="new" onClick={handleNewDraftClick}>
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

          {/* Affiche le contenu en fonction de la valeur de activeTab plutôt que d'utiliser TabsContent */}
          <div>
            {activeTab === "new" && renderEditor()}
            {activeTab === "drafts" && renderDraftsList()}
            {activeTab === "edit" && selectedDraft && (
              <div className="flex gap-6">
                <div className="flex-1">{renderEditor()}</div>

                {showFeedbacks && selectedDraft.was_rejected && (
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
                        communityId={communityId}
                        postId={selectedDraft.id!}
                        expanded={true}
                        variant="sidebar"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
