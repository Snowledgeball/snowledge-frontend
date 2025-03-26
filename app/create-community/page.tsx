"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Image from "next/image";

// Créer un composant séparé pour le formulaire de catégorie
const CategoryForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, label: string) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, label);
    setName("");
    setLabel("");
  };

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Identifiant unique (ex: nft)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Nom affiché (ex: NFT & Collections)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Créer la catégorie
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CreateCommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "1",
    imageUrl: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    []
  );

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = "";
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          finalImageUrl = data.url;
        } else {
          throw new Error("Erreur lors du téléchargement de l'image");
        }
      }

      const response = await fetch("/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: finalImageUrl,
          creatorId: session?.user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          "Communauté créée avec succès ! Veuillez maintenant configurer les informations importantes qui seront présentées aux futurs membres.",
          {
            duration: 6000,
          }
        );
        router.push(`/community/${data.id}/settings#presentation`);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        "Une erreur est survenue lors de la création de la communauté"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setImageFile(file);

    // Créer une URL locale pour la prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  const handleCategorySubmit = async (name: string, label: string) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, label }),
      });

      if (response.ok) {
        const newCat = await response.json();
        setCategories((prev) => [...prev, newCat]);
        setShowCategoryForm(false);
        toast.success("Catégorie créée avec succès");
      }
    } catch (error) {
      toast.error("Erreur lors de la création de la catégorie");
    }
  };

  const handleCategoryChange = (value: string) => {
    console.log("formData", formData);
    console.log("value", value);
    setFormData({ ...formData, category: value });
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connectez-vous pour créer une communauté
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Créer une nouvelle communauté
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom de la communauté */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la communauté
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: CryptoMasters France"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Décrivez votre communauté..."
                className="w-full h-32"
              />
            </div>

            {/* Catégorie */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Catégorie
                </label>

                <button
                  type="button"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  {showCategoryForm ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter une catégorie
                    </>
                  )}
                </button>
              </div>

              {showCategoryForm && (
                <CategoryForm
                  onSubmit={handleCategorySubmit}
                  onCancel={() => setShowCategoryForm(false)}
                />
              )}

              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image de la communauté */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de la communauté
              </label>
              <div
                onClick={() => document.getElementById("file-input")?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
              >
                {previewImage ? (
                  <div className="relative">
                    <Image
                      src={previewImage}
                      alt="Aperçu"
                      className="max-h-48 mx-auto rounded-lg"
                      width={192}
                      height={192}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Cliquez pour changer l'image
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                      Glissez-déposez une image ou cliquez pour sélectionner
                    </p>
                  </>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? "Création en cours..." : "Créer la communauté"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
