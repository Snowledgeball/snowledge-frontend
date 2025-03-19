"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, ImageIcon, Save } from "lucide-react";
import TinyEditor from "@/components/shared/TinyEditor";
import { toast } from "sonner";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from 'next/navigation';

export const POST_TAGS = [
    { value: "analyse-technique", label: "Analyse Technique" },
    { value: "analyse-macro", label: "Analyse Macro" },
    { value: "defi", label: "DeFi" },
    { value: "news", label: "News" },
    { value: "education", label: "Éducation" },
    { value: "trading", label: "Trading" },
];

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
    submitButtonText = "Soumettre le post",
    isDraft = false,
}: PostEditorProps) {
    const searchParams = useSearchParams();
    const [postTitle, setPostTitle] = useState(initialData?.title || "");
    const [editorContent, setEditorContent] = useState(initialData?.content || "");
    const [coverImage, setCoverImage] = useState(initialData?.cover_image_url || "");
    const [selectedTag, setSelectedTag] = useState(initialData?.tag || "");
    const [contributionsEnabled, setContributionsEnabled] = useState(
        initialData?.accept_contributions || false
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Récupérer les données du post original depuis l'URL
        const originalTitle = searchParams.get('title');
        const originalContent = searchParams.get('content');
        const originalCoverImage = searchParams.get('coverImageUrl');
        const originalTag = searchParams.get('tag');

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

        if (editorContent.length < 100) {
            toast.error("Le contenu doit contenir au moins 100 caractères");
            return;
        }

        try {
            setIsSaving(true);
            await onSubmit({
                id: initialData?.id,
                title: postTitle,
                content: editorContent,
                cover_image_url: coverImage,
                tag: selectedTag,
                accept_contributions: contributionsEnabled,
                status: initialData?.status,
                updated_at: new Date().toISOString(),
                created_at: "",
                was_rejected: undefined
            });
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!onSaveDraft) return;

        if (!postTitle && !editorContent && !selectedTag) {
            toast.error("Veuillez remplir au moins un champ pour sauvegarder un brouillon");
            return;
        }

        try {
            setIsSaving(true);
            await onSaveDraft({
                id: initialData?.id,
                title: postTitle,
                content: editorContent,
                cover_image_url: coverImage,
                tag: selectedTag,
                accept_contributions: contributionsEnabled,
                status: "DRAFT",
                updated_at: new Date().toISOString(),
                created_at: "",
                was_rejected: undefined
            });
            toast.success("Brouillon sauvegardé");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde du brouillon");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">
                            {initialData?.id ? "Modifier le post" : "Créer un post"}
                            {isDraft && <span className="ml-2 text-sm text-gray-500">(Brouillon)</span>}
                        </h1>
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
                                onClick={() => setIsPreviewOpen(true)}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Eye className="w-4 h-4 mr-2 inline-block" />
                                Prévisualiser
                            </button>

                            {onSaveDraft && (
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2 inline-block" />
                                    Sauvegarder
                                </button>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? "Traitement..." : submitButtonText}
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
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
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
                        <div id="post-preview-content">
                            <style jsx global>{`
                                #post-preview-content h1 {
                                    font-size: 2rem;
                                    font-weight: 700;
                                    margin-top: 1.5rem;
                                    margin-bottom: 1rem;
                                    color: #1f2937;
                                    line-height: 1.3;
                                }
                                #post-preview-content h2 {
                                    font-size: 1.75rem;
                                    font-weight: 700;
                                    margin-top: 1.5rem;
                                    margin-bottom: 1rem;
                                    color: #1f2937;
                                    line-height: 1.3;
                                }
                                #post-preview-content h3 {
                                    font-size: 1.5rem;
                                    font-weight: 600;
                                    margin-top: 1.25rem;
                                    margin-bottom: 0.75rem;
                                    color: #1f2937;
                                }
                                #post-preview-content p {
                                    margin-bottom: 1rem;
                                    line-height: 1.7;
                                    color: #4b5563;
                                }
                                #post-preview-content ul, #post-preview-content ol {
                                    margin-left: 1.5rem;
                                    margin-bottom: 1rem;
                                }
                                #post-preview-content ul {
                                    list-style-type: disc;
                                }
                                #post-preview-content ol {
                                    list-style-type: decimal;
                                }
                                #post-preview-content a {
                                    color: #2563eb;
                                    text-decoration: underline;
                                }
                                #post-preview-content blockquote {
                                    border-left: 4px solid #e5e7eb;
                                    padding-left: 1rem;
                                    font-style: italic;
                                    color: #6b7280;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content img {
                                    max-width: 100%;
                                    height: auto;
                                    border-radius: 0.5rem;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content pre {
                                    background-color: #f3f4f6;
                                    padding: 1rem;
                                    border-radius: 0.5rem;
                                    overflow-x: auto;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content code {
                                    background-color: #f3f4f6;
                                    padding: 0.2rem 0.4rem;
                                    border-radius: 0.25rem;
                                    font-family: monospace;
                                }
                                #post-preview-content table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content th, #post-preview-content td {
                                    border: 1px solid #e5e7eb;
                                    padding: 0.5rem;
                                }
                                #post-preview-content th {
                                    background-color: #f9fafb;
                                    font-weight: 600;
                                }
                            `}</style>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: editorContent }}
                            />
                        </div>

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