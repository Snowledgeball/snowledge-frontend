"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GoogleDocsStyleDiff from "@/components/shared/GoogleDocsStyleDiff";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EnrichmentReviewProps {
    enrichmentId: number;
    postId: number;
    communityId: string;
    enrichmentTitle: string;
    originalContent: string;
    modifiedContent: string;
    authorName: string;
    authorId: number;
    existingReview?: {
        id: number;
        content: string;
        status: string;
    };
    description?: string;
}

export default function EnrichmentReview({
    enrichmentId,
    postId,
    communityId,
    enrichmentTitle,
    originalContent,
    modifiedContent,
    authorName,
    authorId,
    existingReview,
    description = "Modification du contenu",
}: EnrichmentReviewProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const handleApprove = async (feedback: string) => {
        if (!feedback) {
            toast.error("Veuillez fournir un feedback pour justifier votre décision");
            return;
        }

        setSubmitting(true);

        try {
            const endpoint = existingReview
                ? `/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/reviews/update`
                : `/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/reviews`;

            const method = existingReview ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: feedback,
                    status: "APPROVED",
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de la soumission");
            }

            toast.success(
                existingReview
                    ? "Votre vote a été mis à jour avec succès"
                    : "Feedback envoyé avec succès"
            );
            router.push(`/community/${communityId}/posts/${postId}`);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la soumission"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async (feedback: string) => {
        if (!feedback) {
            toast.error("Veuillez fournir un feedback pour justifier votre décision");
            return;
        }

        setSubmitting(true);

        try {
            const endpoint = existingReview
                ? `/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/reviews/update`
                : `/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/reviews`;

            const method = existingReview ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: feedback,
                    status: "REJECTED",
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de la soumission");
            }

            toast.success(
                existingReview
                    ? "Votre vote a été mis à jour avec succès"
                    : "Feedback négatif bien envoyé"
            );
            router.push(`/community/${communityId}/posts/${postId}`);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la soumission"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <Card className="bg-white p-6 shadow-sm rounded-lg">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">
                            Revue de contribution : {enrichmentTitle}
                        </h1>
                        <div className="text-gray-500 mt-1">
                            Proposée par {authorName}
                        </div>
                    </div>

                    <div className="mb-6">
                        <GoogleDocsStyleDiff
                            oldHtml={originalContent}
                            newHtml={modifiedContent}
                            showControls={true}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            readOnly={!!existingReview && !existingReview.id}
                            description={description}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/community/${communityId}/posts/${postId}`)}
                        >
                            Retour au post
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
} 