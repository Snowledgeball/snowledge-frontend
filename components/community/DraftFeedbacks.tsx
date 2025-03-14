import { useState, useEffect } from "react";
import Image from "next/image";
import { ThumbsDown, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Loader } from "@/components/ui/loader";

interface DraftFeedbacksProps {
    communityId: string;
    postId: number;
    expanded?: boolean; // Pour permettre de contrôler l'expansion depuis le parent
    variant?: 'inline' | 'sidebar'; // Pour contrôler le style en fonction du contexte
}

export default function DraftFeedbacks({ communityId, postId, expanded = false, variant = 'inline' }: DraftFeedbacksProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(expanded);
    const [isLoading, setIsLoading] = useState(true);

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
                // Filtrer pour ne garder que les reviews rejetées
                const rejectedReviews = data.reviews.filter((review: any) => review.status === "REJECTED");
                setReviews(rejectedReviews);
            } catch (error) {
                console.error("Erreur:", error);
                setError("Impossible de charger les feedbacks");
            } finally {
                setLoading(false);
                setIsLoading(false);
            }
        };

        if (isExpanded) {
            fetchReviews();
        }
    }, [communityId, postId, isExpanded]);

    // Adapter le style en fonction du variant
    const containerClassName = variant === 'sidebar'
        ? "bg-white rounded-lg shadow-sm p-4 h-full overflow-y-auto"
        : "mt-4 bg-red-50 p-4 rounded-lg";

    if (isLoading && isExpanded) {
        return (
            <div className={containerClassName}>
                <h3 className="text-lg font-semibold mb-4">Feedbacks des contributeurs</h3>
                <div className="flex justify-center items-center py-8">
                    <Loader size="md" color="gradient" variant="pulse" />
                </div>
            </div>
        );
    }

    if (error && isExpanded) {
        return (
            <div className={containerClassName}>
                <h3 className="text-lg font-semibold mb-4">Feedbacks des contributeurs</h3>
                <div className="text-red-500 text-center py-4">{error}</div>
            </div>
        );
    }

    if (isExpanded) {
        return (
            <div className={containerClassName}>
                <h3 className="text-lg font-semibold mb-4">Feedbacks négatifs</h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucun feedback détaillé n'a été fourni
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="border border-red-100 rounded-lg p-3">
                                <div className="flex items-center mb-2">
                                    <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                                        <Image
                                            src={review.user?.profilePicture || "/images/default-avatar.png"}
                                            alt={review.user?.fullName || "Contributeur"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{review.user?.fullName || `Contributeur #${review.reviewer_id}`}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="ml-auto bg-red-100 text-red-600 p-1 rounded-full">
                                        <ThumbsDown size={16} />
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

                <div className="mt-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                    <p className="font-medium mb-2">Conseils pour améliorer votre post :</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Assurez-vous de répondre aux préoccupations soulevées</li>
                        <li>Ajoutez plus de détails et d'exemples si nécessaire</li>
                        <li>Vérifiez votre orthographe et votre grammaire</li>
                        <li>Ajoutez des références pour soutenir vos affirmations</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (!isExpanded) {
        return (
            <div className={containerClassName}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <ThumbsDown className="text-red-500 mr-2" size={16} />
                        <span className="font-medium text-red-800">Ce post a été rejeté par la communauté</span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="text-red-500 text-sm"
                    >
                        Voir les feedbacks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClassName}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <ThumbsDown className="text-red-500 mr-2" size={16} />
                    <span className="font-medium text-red-800">Ce post a été rejeté par la communauté</span>
                </div>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="text-red-500 text-sm"
                >
                    Masquer les feedbacks
                </button>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-3 text-gray-500">
                    Aucun feedback détaillé n'a été fourni
                </div>
            ) : (
                <div className="space-y-3 mt-3">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-l-2 border-red-400 pl-3 py-2 bg-white rounded-r-md">
                            <div className="flex items-start">
                                <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                                    <Image
                                        src={review.user?.profilePicture || "/images/default-avatar.png"}
                                        alt={review.user?.fullName || "Contributeur"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">
                                        {review.user?.fullName || `Contributeur #${review.reviewer_id}`}
                                    </div>
                                    {review.content ? (
                                        <div className="text-sm text-gray-700 mt-1">
                                            <div className="flex items-start">
                                                <MessageCircle size={14} className="text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                                                <div>{review.content}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic mt-1">Pas de commentaire</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-sm text-gray-700 italic">
                Prenez en compte ces feedbacks pour améliorer votre post avant de le soumettre à nouveau.
            </div>
        </div>
    );
} 