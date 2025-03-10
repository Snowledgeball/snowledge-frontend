"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import TinyEditor from "@/components/shared/TinyEditor";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface ContributionReviewProps {
    contributionId: number;
    postId: number;
    communityId: string;
    contributionTitle: string;
    originalContent: string;
    modifiedContent: string;
    authorName: string;
    authorId: number;
    existingReview?: {
        id: number;
        content: string;
        status: string;
    };
}

export default function ContributionReview({
    contributionId,
    postId,
    communityId,
    contributionTitle,
    originalContent,
    modifiedContent,
    authorName,
    authorId,
    existingReview,
}: ContributionReviewProps) {
    const router = useRouter();
    const [feedback, setFeedback] = useState(existingReview?.content || "");
    const [decision, setDecision] = useState<"APPROVED" | "REJECTED">(
        existingReview?.status as "APPROVED" | "REJECTED" || "REJECTED"
    );
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("diff");

    const handleSubmit = async () => {
        if (!feedback) {
            toast.error("Veuillez fournir un feedback pour justifier votre décision");
            return;
        }

        setSubmitting(true);

        try {
            const endpoint = existingReview
                ? `/api/communities/${communityId}/posts/${postId}/contributions/${contributionId}/reviews/update`
                : `/api/communities/${communityId}/posts/${postId}/contributions/${contributionId}/reviews`;

            const method = existingReview ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: feedback,
                    status: decision,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de la soumission");
            }

            toast.success(
                existingReview
                    ? "Votre vote a été mis à jour avec succès"
                    : "Votre vote a été soumis avec succès"
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
                            Revue de contribution : {contributionTitle}
                        </h1>
                        <div className="text-gray-500 mt-1">
                            Proposée par {authorName}
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="diff">Différences</TabsTrigger>
                            <TabsTrigger value="original">Contenu original</TabsTrigger>
                            <TabsTrigger value="modified">Contenu modifié</TabsTrigger>
                        </TabsList>
                        <TabsContent value="diff" className="border rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Contenu original</h3>
                                    <div className="p-3 border rounded bg-gray-50" dangerouslySetInnerHTML={{ __html: originalContent }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Contenu modifié</h3>
                                    <div className="p-3 border rounded bg-gray-50" dangerouslySetInnerHTML={{ __html: modifiedContent }} />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="original" className="border rounded-lg p-4 mb-6">
                            <div dangerouslySetInnerHTML={{ __html: originalContent }} />
                        </TabsContent>
                        <TabsContent value="modified" className="border rounded-lg p-4 mb-6">
                            <div dangerouslySetInnerHTML={{ __html: modifiedContent }} />
                        </TabsContent>
                    </Tabs>

                    <div className="mt-8">
                        <h2 className="text-lg font-semibold mb-3">Votre décision</h2>
                        <div className="flex space-x-4 mb-6">
                            <button
                                onClick={() => setDecision("APPROVED")}
                                className={`flex items-center px-4 py-2 rounded-lg ${decision === "APPROVED"
                                    ? "bg-green-100 border-2 border-green-500 text-green-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                <ThumbsUp className="mr-2 h-5 w-5" />
                                Approuver
                            </button>
                            <button
                                onClick={() => setDecision("REJECTED")}
                                className={`flex items-center px-4 py-2 rounded-lg ${decision === "REJECTED"
                                    ? "bg-red-100 border-2 border-red-500 text-red-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                <ThumbsDown className="mr-2 h-5 w-5" />
                                Rejeter
                            </button>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-3">Votre feedback</h2>
                            <div className="border rounded-lg bg-gray-50 p-1">
                                <TinyEditor
                                    onChange={setFeedback}
                                    initialValue={feedback}
                                    placeholder="Expliquez votre décision et donnez des conseils pour améliorer la contribution..."
                                />
                            </div>
                            {!feedback && (
                                <div className="mt-2 text-sm text-red-500 flex items-center">
                                    <AlertTriangle className="mr-1 h-4 w-4" />
                                    Un feedback est requis
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/community/${communityId}/posts/${postId}`)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!feedback || submitting}
                            >
                                {submitting
                                    ? "En cours..."
                                    : existingReview
                                        ? "Mettre à jour mon vote"
                                        : "Soumettre mon vote"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
} 