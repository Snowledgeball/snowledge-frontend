"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { TextEditor } from "@/components/shared/TextEditor";
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

interface PostEditorProps {
  initialData?: PostData;
  communityId: string;
  onSubmit: (data: PostData) => void;
  onSaveDraft?: (data: PostData) => void;
  submitButtonText?: string;
  isDraft?: boolean;
}

export default function PostEditor({
  initialData,
  communityId,
  onSubmit,
  onSaveDraft,
  submitButtonText,
  isDraft = false,
}: PostEditorProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
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
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewHTML, setPreviewHTML] = useState("");

  const buttonText = submitButtonText || t("post_editor.submit_post");

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch(
        `/api/communities/${communityId}/categories`
      );
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, [communityId]);

  // Handler pour la soumission du formulaire
  const handleSubmit = () => {
    if (!postTitle.trim() || !editorContent || !selectedTag) {
      toast.error(t("post_editor.fill_all_fields"));
      return;
    }

    const postData = {
      title: postTitle,
      content: editorContent,
      cover_image_url: coverImage,
      tag: selectedTag,
      accept_contributions: contributionsEnabled,
    };

    isSaving ? null : onSubmit(postData);
  };

  // Handler pour la sauvegarde comme brouillon
  const handleSaveDraft = () => {
    if (!onSaveDraft) return;

    if (!postTitle.trim() && !editorContent && !selectedTag) {
      toast.error(t("post_editor.fill_one_field"));
      return;
    }

    const draftData = {
      title: postTitle,
      content: editorContent,
      cover_image_url: coverImage,
      tag: selectedTag,
      accept_contributions: contributionsEnabled,
    };

    isSaving ? null : onSaveDraft(draftData);
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
      toast.error(t("post_editor.image_upload_error"));
    } finally {
      setIsUploading(false);
    }
  };

  // Récupérer les paramètres de duplication
  useEffect(() => {
    const originalTitle = searchParams.get("title");
    const originalContent = searchParams.get("content");
    const originalCoverImage = searchParams.get("coverImageUrl");
    const originalTag = searchParams.get("tag");

    if (
      !initialData &&
      (originalTitle || originalContent || originalCoverImage || originalTag)
    ) {
      if (originalTitle) setPostTitle(originalTitle);
      if (originalContent) setEditorContent(originalContent);
      if (originalCoverImage) setCoverImage(originalCoverImage);
      if (originalTag) setSelectedTag(originalTag);
    }
  }, [searchParams, initialData]);

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
            {categories.find((t) => t.id === selectedTag)?.label ||
              categories.find((t) => t.id === selectedTag)?.name ||
              selectedTag}
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

  return (
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

          {onSaveDraft && (
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {t("community_posts.save_draft")}
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {buttonText}
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
}
