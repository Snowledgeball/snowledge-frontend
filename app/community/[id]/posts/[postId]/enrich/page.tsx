"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import TinyEditor from "@/components/shared/TinyEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContributePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [originalContent, setOriginalContent] = useState("");
    const [modifiedContent, setModifiedContent] = useState("");
    const [postTitle, setPostTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier si l'utilisateur est authentifié
        if (status === "unauthenticated") {
            toast.error("Vous devez être connecté pour contribuer");
            router.push(`/community/${params.id}/posts/${params.postId}`);
            return;
        }

        // Récupérer le contenu original du post
        const fetchPost = async () => {
            try {
                setLoading(true);

                // Vérifier que l'utilisateur est membre de la communauté
                const membershipResponse = await fetch(`/api/communities/${params.id}/membership`);
                if (!membershipResponse.ok) {
                    toast.error("Erreur lors de la vérification de votre adhésion");
                    router.push(`/community/${params.id}/posts/${params.postId}`);
                    return;
                }

                const membershipData = await membershipResponse.json();
                if (!membershipData.isMember) {
                    toast.error("Vous devez être membre de cette communauté pour contribuer");
                    router.push(`/community/${params.id}/posts/${params.postId}`);
                    return;
                }

                // Récupérer le post
                const postResponse = await fetch(`/api/communities/${params.id}/posts/${params.postId}`);
                if (!postResponse.ok) {
                    toast.error("Impossible de récupérer le post");
                    router.push(`/community/${params.id}/posts/${params.postId}`);
                    return;
                }

                const post = await postResponse.json();

                // Vérifier que le post accepte les contributions
                if (!post.accept_contributions) {
                    toast.error("Ce post n'accepte pas les contributions");
                    router.push(`/community/${params.id}/posts/${params.postId}`);
                    return;
                }

                // Vérifier que l'utilisateur n'est pas l'auteur du post
                if (post.author_id === parseInt(session?.user?.id || "0")) {
                    toast.error("Vous ne pouvez pas contribuer à votre propre post");
                    router.push(`/community/${params.id}/posts/${params.postId}`);
                    return;
                }

                setOriginalContent(post.content);
                setModifiedContent(post.content); // Initialiser avec le contenu original
                setPostTitle(post.title);
                setLoading(false);
            } catch (error) {
                console.error("Erreur:", error);
                toast.error("Une erreur est survenue");
                router.push(`/community/${params.id}/posts/${params.postId}`);
            }
        };

        if (session) {
            fetchPost();
        }
    }, [session, status, params.id, params.postId, router]);

    const handleSubmit = async () => {
        if (originalContent === modifiedContent) {
            toast.error("Vous n'avez apporté aucune modification");
            return;
        }

        if (!description) {
            toast.error("Veuillez ajouter une description de vos modifications");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/communities/${params.id}/posts/${params.postId}/enrichments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: description.slice(0, 60),
                    content: modifiedContent,
                    original_content: originalContent,
                    description,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            toast.success("Votre contribution a été soumise avec succès");
            router.push(`/community/${params.id}/posts/${params.postId}`);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 flex justify-center items-center min-h-[70vh]">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="ml-2">Chargement du contenu...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-6">
                <Link
                    href={`/community/${params.id}/posts/${params.postId}`}
                    className="inline-flex items-center text-blue-600 hover:underline"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au post
                </Link>
            </div>

            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6">Contribuer à : {postTitle}</h1>

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
                        rows={3}
                    />
                    {!description && (
                        <p className="text-sm text-red-500 mt-1">
                            Une description de vos modifications est requise
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Éditeur de contenu</h2>
                    <TinyEditor
                        initialValue={originalContent}
                        onChange={setModifiedContent}
                    />
                    {originalContent === modifiedContent && (
                        <p className="text-sm text-red-500 mt-1">
                            Vous n'avez pas encore apporté de modifications au contenu
                        </p>
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/community/${params.id}/posts/${params.postId}`)}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || originalContent === modifiedContent || !description}
                    >
                        {isSubmitting ? "Soumission..." : "Soumettre ma contribution"}
                    </Button>
                </div>
            </Card>
        </div>
    );
} 