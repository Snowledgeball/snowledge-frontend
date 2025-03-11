"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TinyEditor from "@/components/shared/TinyEditor";

interface Contribution {
    id: number;
    title: string;
    content: string;
    original_content: string;
    description: string;
    status: string;
    created_at: string;
    user_id: number;
    community_posts: {
        id: number;
        title: string;
        community: {
            id: number;
            name: string;
        }
    };
}

export default function EditContributionPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [contribution, setContribution] = useState<Contribution | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modifiedContent, setModifiedContent] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (session) {
            fetchContribution();
        }
    }, [session, status, router, params.id, params.postId, params.enrichmentId]);

    const fetchContribution = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/communities/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`);

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération de la contribution");
            }

            const data = await response.json();

            // Vérifier que l'utilisateur est bien l'auteur de la contribution
            if (data.user_id !== parseInt(session?.user?.id || "0")) {
                toast.error("Vous n'êtes pas autorisé à modifier cette contribution");
                router.push(`/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`);
                return;
            }

            // Vérifier que la contribution est toujours en attente
            if (data.status !== "PENDING") {
                toast.error("Vous ne pouvez plus modifier cette contribution car elle a déjà été traitée");
                router.push(`/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`);
                return;
            }

            setContribution(data);
            setModifiedContent(data.content);
            setDescription(data.description);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Erreur lors de la récupération de la contribution");
            router.push(`/community/${params.id}/posts/${params.postId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!contribution) return;

        if (modifiedContent === contribution.original_content) {
            toast.error("Vous n'avez apporté aucune modification au contenu");
            return;
        }

        if (!description) {
            toast.error("Veuillez fournir une description de vos modifications");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/communities/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: modifiedContent,
                    description,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de la mise à jour de la contribution");
            }

            toast.success("Contribution mise à jour avec succès");
            router.push(`/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-center items-center h-64">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="ml-2">Chargement de la contribution...</p>
                </div>
            </div>
        );
    }

    if (!contribution) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Contribution non trouvée</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push(`/community/${params.id}/posts/${params.postId}`)}
                    >
                        Retour au post
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link
                    href={`/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`}
                    className="inline-flex items-center text-blue-600 hover:underline"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la contribution
                </Link>
            </div>

            <Card className="p-6 mb-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">
                        Modifier votre contribution à "{contribution.community_posts.title}"
                    </h1>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Description de vos modifications</h2>
                        <div className="mb-2 text-sm text-gray-600">
                            <p className="mb-1">Décrivez brièvement les modifications que vous proposez et leur raison.</p>
                            <p className="mb-1">Exemple de format :</p>
                            <ul className="list-disc pl-5 mb-2">
                                <li>Correction de faute d'orthographe</li>
                                <li>Ajout d'information sur...</li>
                                <li>Restructuration de la section...</li>
                            </ul>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez vos modifications ici..."
                            className="w-full p-3 border rounded-md"
                            rows={5}
                        />
                        {!description && (
                            <p className="text-sm text-red-500 mt-1">
                                Une description de vos modifications est requise
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Contenu modifié</h2>
                        <div className="border rounded-lg bg-gray-50 p-1">
                            <TinyEditor
                                initialValue={contribution.content}
                                onChange={setModifiedContent}
                            />
                        </div>
                        {modifiedContent === contribution.original_content && (
                            <p className="text-sm text-red-500 mt-1">
                                Vous n'avez pas encore modifié le contenu
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}`)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || modifiedContent === contribution.original_content || !description}
                        >
                            {submitting ? "Mise à jour..." : "Mettre à jour la contribution"}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
} 