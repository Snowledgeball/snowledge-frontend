import { useState, useEffect } from "react";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/ui/loader";

interface Review {
    id: number;
    content: string;
    status: string;
    created_at: string;
    user: {
        id: number;
        fullName: string;
        profilePicture: string;
    };
}

interface ReviewStats {
    total: number;
    approved: number;
    rejected: number;
    approvalRate: number;
}

interface ReviewsSidebarProps {
    communityId: string;
    postId: string;
}

export default function ReviewsSidebar({ communityId, postId }: ReviewsSidebarProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({
        total: 0,
        approved: 0,
        rejected: 0,
        approvalRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/communities/${communityId}/posts/${postId}/reviews`
                );

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des reviews");
                }

                const data = await response.json();
                setReviews(data.reviews);
                setStats(data.stats);
            } catch (error) {
                console.error("Erreur:", error);
                setError("Impossible de charger les reviews");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [communityId, postId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader size="md" color="gradient" variant="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Feedback des contributeurs</h3>

            {/* Statistiques */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Taux d'approbation</span>
                    <span className="text-sm font-medium">{stats.approvalRate.toFixed(0)}%</span>
                </div>
                <Progress value={stats.approvalRate} className="h-2 mb-3" />

                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded">
                        <div className="text-lg font-semibold">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-semibold text-green-600">{stats.approved}</div>
                        <div className="text-xs text-gray-500">Approuvés</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                        <div className="text-lg font-semibold text-red-600">{stats.rejected}</div>
                        <div className="text-xs text-gray-500">Rejetés</div>
                    </div>
                </div>
            </div>

            {/* Liste des reviews */}
            {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Aucun vote pour le moment
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center mb-2">
                                <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                                    <Image
                                        src={review.user.profilePicture || "/images/default-avatar.png"}
                                        alt={review.user.fullName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{review.user.fullName}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="ml-auto">
                                    {review.status === "APPROVED" ? (
                                        <div className="bg-green-100 text-green-600 p-1 rounded-full">
                                            <ThumbsUp size={16} />
                                        </div>
                                    ) : (
                                        <div className="bg-red-100 text-red-600 p-1 rounded-full">
                                            <ThumbsDown size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {review.content && (
                                <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    <div className="flex items-start">
                                        <MessageCircle size={14} className="text-gray-400 mr-1 mt-0.5" />
                                        <div>{review.content}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 