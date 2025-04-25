"use client";

import { useState, useEffect } from "react";
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
import { useCreateBlockNote } from "@blocknote/react";

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
}

interface PostEditorProps {
  initialData?: PostData;
  communityId: string;
  onSubmit: (data: PostData) => Promise<void>;
  onSaveDraft?: (data: PostData) => Promise<void>;
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

  // Fonction pour obtenir le HTML complet pour la prévisualisation
  // const handleGetFullHTML = (html: string) => {
  //   setPreviewHTML(html);
  //   setIsPreviewOpen(true);
  // };

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

  useEffect(() => {
    // Récupérer les données du post original depuis l'URL
    const originalTitle = searchParams.get("title");
    const originalContent = searchParams.get("content");
    const originalCoverImage = searchParams.get("coverImageUrl");
    const originalTag = searchParams.get("tag");

    // Pré-remplir les champs si les données existent
    if (originalTitle) setPostTitle(originalTitle);
    if (originalContent) setEditorContent(originalContent);
    if (originalCoverImage) setCoverImage(originalCoverImage);
    if (originalTag) setSelectedTag(originalTag);
  }, [searchParams]);

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

  const handleSubmit = async () => {
    if (!postTitle || !editorContent || !selectedTag) {
      toast.error(t("post_editor.fill_all_fields"));
      return;
    }

    if (typeof editorContent === "string" && editorContent.length < 100) {
      toast.error(t("post_editor.content_too_short"));
      return;
    }

    try {
      setIsSaving(true);
      await onSubmit({
        id: initialData?.id,
        title: postTitle,
        content:
          typeof editorContent === "string"
            ? editorContent
            : JSON.stringify(editorContent),
        cover_image_url: coverImage,
        tag: selectedTag,
        accept_contributions: contributionsEnabled,
        status: initialData?.status,
        updated_at: new Date().toISOString(),
        created_at: "",
        was_rejected: undefined,
      });
    } catch (error) {
      console.error(t("post_editor.submission_error"), error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    if (!postTitle && !editorContent && !selectedTag) {
      toast.error(t("post_editor.fill_one_field"));
      return;
    }

    try {
      setIsSaving(true);
      await onSaveDraft({
        id: initialData?.id,
        title: postTitle,
        content:
          typeof editorContent === "string"
            ? editorContent
            : JSON.stringify(editorContent),
        cover_image_url: coverImage,
        tag: selectedTag,
        accept_contributions: contributionsEnabled,
        status: "DRAFT",
        updated_at: new Date().toISOString(),
        created_at: "",
        was_rejected: undefined,
      });
      toast.success(t("community_posts.draft_saved"));
    } catch (error) {
      console.error(t("post_editor.save_error"), error);
      toast.error(t("community_posts.error_save_draft"));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const renderHtml = async () => {
      const tempEditor = useCreateBlockNote();
      const blocks = JSON.parse(editorContent);
      const fullHtml = await tempEditor.blocksToFullHTML(blocks);
      setPreviewHTML(fullHtml);
    };

    if (isPreviewOpen && editorContent) {
      renderHtml();
    }
  }, [isPreviewOpen, editorContent]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <TextEditor value={editorContent} onChange={setEditorContent} />

      {/* Modal de prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{t("post_editor.post_preview")}</DialogTitle>
          </DialogHeader>

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
                {categories.find((t) => t.id === selectedTag)?.name}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
