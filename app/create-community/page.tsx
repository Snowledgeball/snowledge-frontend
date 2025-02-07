"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";

export default function CreateCommunityPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "crypto",
        imageUrl: "",
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const categories = [
        { id: "crypto", label: "Crypto & Web3" },
        { id: "trading", label: "Trading" },
        { id: "invest", label: "Investissement" },
        { id: "defi", label: "DeFi" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalImageUrl = "";
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('file', imageFile);
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: imageFormData,
                });

                if (uploadResponse.ok) {
                    const data = await uploadResponse.json();
                    finalImageUrl = data.url;
                } else {
                    throw new Error('Erreur lors du téléchargement de l\'image');
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
                toast.success("Communauté créée avec succès ! Veuillez maintenant configurer les informations importantes qui seront présentées aux futurs membres.", {
                    duration: 6000,
                });
                router.push(`/community-settings/${data.id}#presentation`);
            } else {
                throw new Error("Erreur lors de la création de la communauté");
            }
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Une erreur est survenue lors de la création de la communauté");
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

    // Nettoyer l'URL de prévisualisation lors du démontage du composant
    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Décrivez votre communauté..."
                                className="w-full h-32"
                            />
                        </div>

                        {/* Catégorie */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catégorie
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                                onClick={() => document.getElementById('file-input')?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
                            >
                                {previewImage ? (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Aperçu"
                                            className="max-h-48 mx-auto rounded-lg"
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