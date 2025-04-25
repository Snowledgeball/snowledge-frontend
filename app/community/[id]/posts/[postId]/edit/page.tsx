"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Image from "next/image";
import {
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { useMemo } from "react";
import { Loader } from "@/components/ui/loader";
import { useTranslation } from "react-i18next";
import { TextEditor } from "@/components/shared/TextEditor";
import dynamic from "next/dynamic";

// Import avec rendu côté client uniquement sans SSR
const PreviewRenderer = dynamic(
  () => import("@/components/shared/PreviewRenderer"),
  { ssr: false }
);

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

interface Category {
  id: string;
  label: string;
  name: string;
  description: string;
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
  const [postTitle, setPostTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [contributionsEnabled, setContributionsEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string; label?: string }[]
  >([]);
  const [previewHTML, setPreviewHTML] = useState("");

  const status = searchParams.get("status");
  const cacheKey = `${params.id}-${params.postId}-${status}`;

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch(`/api/communities/${params.id}/categories`);
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, [params.id]);

  // Fonction optimisée pour récupérer les données du post
  const fetchPost = useCallback(async () => {
    try {
      // Vérifier si les données sont dans le cache
      if (postCache.has(cacheKey)) {
        const cachedPost = postCache.get(cacheKey)!;
        setPost(cachedPost);
        setPostTitle(cachedPost.title);
        setEditorContent(cachedPost.content);
        setCoverImage(cachedPost.cover_image_url || "");
        setSelectedTag(cachedPost.tag);
        setContributionsEnabled(cachedPost.accept_contributions);
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
      setPostTitle(data.title);
      setEditorContent(data.content);
      setCoverImage(data.cover_image_url || "");
      console.log(data);
      setSelectedTag(data.tag);
      setContributionsEnabled(data.accept_contributions);
    } catch (error) {
      toast.error("Erreur lors du chargement du post");
      router.push(`/community/${params.id}`);
    }
  }, [params.id, params.postId, router, status, cacheKey]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Fonction optimisée pour l'upload d'image avec mise en cache
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      // Vérifier si l'image est trop grande
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error("Image trop volumineuse (max 5MB)");
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur lors de l'upload");

      const data = await response.json();
      setCoverImage(data.url);
      setHasUnsavedChanges(true);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  // Marquer les changements non sauvegardés
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [postTitle, editorContent, selectedTag, contributionsEnabled]);

  // Fonction optimisée pour la soumission finale
  const handleSubmit = async () => {
    if (!postTitle || !editorContent || !selectedTag) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    console.log("editorContent", editorContent);
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/communities/${params.id}/posts/${params.postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: postTitle,
            content: editorContent,
            cover_image_url: coverImage,
            tag: selectedTag,
            accept_contributions: contributionsEnabled,
          }),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de la modification");

      // Mettre à jour le cache
      if (post) {
        const updatedPost = {
          ...post,
          title: postTitle,
          content: editorContent,
          cover_image_url: coverImage,
          tag: selectedTag,
          accept_contributions: contributionsEnabled,
        };
        postCache.set(cacheKey, updatedPost);
      }

      toast.success("Post modifié avec succès");
      setHasUnsavedChanges(false);
      router.push(`/community/${params.id}`);
    } catch (error) {
      toast.error("Erreur lors de la modification du post");
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) return <LoadingComponent />;
  if (!isAuthenticated) return null;
  if (!post)
    return <Loader fullScreen text={t("loading.post")} variant="spinner" />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isLoading || !post ? (
        <div className="flex items-center justify-center h-96">
          <Loader size="lg" />
        </div>
      ) : (
        <>
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
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2 inline-block" />
                {t("post_editor.preview")}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2 inline-block" />
                {t("actions.save")}
              </button>
            </div>
          </div>

          <Card className="p-8">
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
                    {isUploading
                      ? t("post_editor.uploading")
                      : t("post_editor.add_cover_image")}
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
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label || category.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder={t("post_editor.article_title")}
              className="mt-8 w-full text-2xl font-bold border-none focus:outline-none mb-4"
            />

            <TextEditor value={editorContent} onChange={setEditorContent} />
          </Card>

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
        </>
      )}
    </div>
  );
}
