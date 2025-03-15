"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Clock, Check, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GoogleDocsStyleDiff from "@/components/shared/GoogleDocsStyleDiff";
import { Loader } from "@/components/ui/loader";

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
    community_posts_enrichment_reviews: {
        id: number;
        content: string;
        status: string;
        created_at: string;
        user: {
            id: number;
            fullName: string;
            profilePicture: string;
        };
    }[];
}

export default function ContributionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [contribution, setContribution] = useState<Contribution | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"diff" | "original" | "modified">("diff");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (session) {
            fetchContribution();
        }
    }, [session, status, router, params.enrichmentId]);

    const fetchContribution = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/enrichments/${params.enrichmentId}`);

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération de la contribution");
            }

            const data = await response.json();
            setContribution(data);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Erreur lors de la récupération de la contribution");
            router.push("/community/" + params.id + "/posts/" + params.postId);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                    </span>
                );
            case "approved":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Approuvée
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <X className="w-3 h-3 mr-1" />
                        Rejetée
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-center items-center h-64">
                    <Loader size="md" color="gradient" text="Chargement de la contribution..." variant="pulse" />
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
                        onClick={() => router.push("/community/" + params.id + "/posts/" + params.postId)}
                    >
                        Retour à mes contributions
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link
                    href={`/community/${params.id}/posts/${params.postId}`}
                    className="inline-flex items-center text-blue-600 hover:underline"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à mes contributions
                </Link>
            </div>

            <Card className="p-6 mb-6">
                <div className="mb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                Contribution à "{contribution.community_posts.title}"
                            </h1>
                            <p className="text-sm text-gray-500 mb-2">
                                Communauté: {contribution.community_posts.community.name} •
                                Soumise le {format(new Date(contribution.created_at), "d MMMM yyyy", { locale: fr })}
                            </p>
                            <div className="mb-3">
                                {getStatusBadge(contribution.status)}
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            {contribution.user_id === parseInt(session?.user?.id || "0") && contribution.status === "PENDING" && (
                                <Link
                                    href={`/community/${params.id}/posts/${params.postId}/enrichments/${params.enrichmentId}/edit`}
                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                >
                                    Modifier mon enrichissement
                                </Link>
                            )}
                            <Link
                                href={`/community/${contribution.community_posts.community.id}/posts/${contribution.community_posts.id}`}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                            >
                                Voir le post
                            </Link>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-md font-medium mb-2">Description de votre contribution:</h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{contribution.description}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Modifications proposées</h3>

                    <GoogleDocsStyleDiff
                        oldHtml={contribution.original_content}
                        newHtml={contribution.content}
                        showControls={true}
                        readOnly={true}
                        description={contribution.description}
                    />
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Feedbacks reçus ({contribution.community_posts_enrichment_reviews.length})</h2>

                {contribution.community_posts_enrichment_reviews.length === 0 ? (
                    <p className="text-gray-500 italic">Aucun feedback reçu pour le moment</p>
                ) : (
                    <div className="space-y-6">
                        {contribution.community_posts_enrichment_reviews.map((review) => (
                            <div key={review.id} className="bg-gray-50 p-4 rounded-md">
                                <div className="flex items-center mb-3">
                                    <div className={`p-1.5 rounded-full mr-2 ${review.status === "APPROVED" ? "bg-green-100" : "bg-red-100"}`}>
                                        {review.status === "APPROVED" ? (
                                            <ThumbsUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ThumbsDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{review.user.fullName}</div>
                                        <div className="text-xs text-gray-500">
                                            {format(new Date(review.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: review.content }} />
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
} 