"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, ImageIcon } from "lucide-react";
import TinyEditor from "@/components/shared/TinyEditor";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const POST_TAGS = [
  { value: "analyse-technique", label: "Analyse Technique" },
  { value: "analyse-macro", label: "Analyse Macro" },
  { value: "defi", label: "DeFi" },
  { value: "news", label: "News" },
  { value: "education", label: "Éducation" },
  { value: "trading", label: "Trading" },
];

export default function CreatePost() {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const params = useParams();
  const router = useRouter();

  const [postTitle, setPostTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [contributionsEnabled, setContributionsEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    // Vérifier que l'utilisateur est contributeur
    const checkContributorStatus = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/membership`
        );
        const data = await response.json();

        if (!data.isContributor) {
          toast.error("Vous devez être contributeur pour créer un post");
          router.push(`/community/${params.id}`);
        }
      } catch (error) {
        console.error("Erreur:", error);
        router.push(`/community/${params.id}`);
      }
    };

    checkContributorStatus();
  }, [params.id, router]);

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

      if (!response.ok) throw new Error("Erreur lors de l'upload");

      const data = await response.json();
      setCoverImage(data.url);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!postTitle || !editorContent || !selectedTag) {
      toast.error("Veuillez remplir tous les champs");
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
          body: JSON.stringify({
            title: postTitle,
            content: editorContent,
            cover_image_url: coverImage,
            tag: selectedTag,
            accept_contributions: contributionsEnabled,
          }),
        }
      );

      console.log("response", await response.json());

      if (!response.ok) throw new Error("Erreur lors de la création");

      toast.success("Post soumis pour révision");
      router.push(`/community/${params.id}`);
    } catch (error) {
      toast.error("Erreur lors de la création du post");
    }
  };

  if (isLoading) return <LoadingComponent />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Modifier le post</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                <Switch
                  checked={contributionsEnabled}
                  onCheckedChange={setContributionsEnabled}
                  className="data-[state=checked]:bg-green-600"
                />
                <label className="text-gray-600">Contributions</label>
              </div>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Soumettre le post
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
                  <div className="relative">
                    <Image
                      src={`https://${coverImage}`}
                      alt="Cover Image"
                      width={75}
                      height={75}
                      className="rounded-lg"
                    />
                    <label
                      htmlFor="cover-image"
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="cover-image"
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-center"
                  >
                    {isUploading
                      ? "Upload..."
                      : "Ajouter une image de couverture"}
                  </label>
                )}
              </div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Choisir une catégorie</option>
                {POST_TAGS.map((tag) => (
                  <option key={tag.value} value={tag.value}>
                    {tag.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Titre de l'article"
              className="mt-8 w-full text-2xl font-bold border border-gray-200 mb-4 px-4 py-2 rounded-lg"
            />

            <TinyEditor
              initialValue={editorContent}
              onChange={setEditorContent}
            />
          </div>
        </Card>
      </div>

      {/* Modal de prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Prévisualisation du post</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Image de couverture */}
            {coverImage && (
              <div className="w-full h-48 relative mb-6 rounded-lg overflow-hidden">
                <Image
                  src={`https://${coverImage}`}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Tag */}
            {selectedTag && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm mb-4">
                {POST_TAGS.find((t) => t.value === selectedTag)?.label}
              </span>
            )}

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {postTitle || "Sans titre"}
            </h1>

            {/* Contenu */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {contributionsEnabled
                    ? "✅ Contributions activées"
                    : "❌ Contributions désactivées"}
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
