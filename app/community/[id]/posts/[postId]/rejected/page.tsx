"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import Image from "next/image";
import { XCircle, MessageCircle, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RejectedPostPage() {
    const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
    const params = useParams();
    const router = useRouter();

    const [post, setPost] = useState<any>(null);
    const [rejectedReviews, setRejectedReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer les données du post
                const postResponse = await fetch(
                    `/api/communities/${params.id}/posts/${params.postId}`
                );

                if (!postResponse.ok) {
                    toast.error("Erreur lors de la récupération du post");
                    router.push(`/community/${params.id}`);
                    return;
                }

                const postData = await postResponse.json();
                setPost(postData);

                // Vérifier si l'utilisateur est l'auteur du post
                const session = await fetch("/api/auth/session");
                const sessionData = await session.json();

                if (postData.author_id !== parseInt(sessionData?.user?.id)) {
                    toast.error("Vous n'êtes pas autorisé à voir cette page");
                    router.push(`/community/${params.id}`);
                    return;
                }

                // Récupérer les reviews négatives
                const reviewsResponse = await fetch(
                    `/api/communities/${params.id}/posts/${params.postId}/reviews/all`
                );

                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setRejectedReviews(
                        reviewsData.reviews.filter((review: any) => review.status === "REJECTED")
                    );
                }
            } catch (error) {
                console.error("Erreur:", error);
                toast.error("Une erreur est survenue");
                router.push(`/community/${params.id}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id, params.postId, router]);

    if (isLoading || loading) return <LoadingComponent />;
    if (!isAuthenticated || !post) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <Link
                            href={`/community/${params.id}`}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold">Post rejeté par la communauté</h1>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <XCircle className="text-red-500 mr-3 mt-1" />
                            <div>
                                <h2 className="text-lg font-semibold text-red-800">
                                    Votre post "{post.title}" a été rejeté
                                </h2>
                                <p className="mt-1 text-red-700">
                                    La majorité des contributeurs a voté contre la publication de ce post.
                                    Consultez les feedbacks ci-dessous pour comprendre pourquoi et améliorer votre contenu.
                                </p>
                                <div className="mt-3">
                                    <Link
                                        href={`/community/${params.id}/posts/${params.postId}/edit`}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        <Edit size={16} className="mr-2" />
                                        Modifier mon post
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-4">Feedbacks des contributeurs</h3>

                    {rejectedReviews.length === 0 ? (
                        <p className="text-gray-500">Aucun feedback négatif détaillé n'a été fourni.</p>
                    ) : (
                        <div className="space-y-4">
                            {rejectedReviews.map((review) => (
                                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                                            <Image
                                                src={review.user.profilePicture || "/images/default-avatar.png"}
                                                alt={review.user.fullName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium">{review.user.fullName}</div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="ml-auto bg-red-100 text-red-600 p-1.5 rounded-full">
                                            <XCircle size={18} />
                                        </div>
                                    </div>

                                    {review.content && (
                                        <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-start">
                                                <MessageCircle size={16} className="text-gray-400 mr-2 mt-0.5" />
                                                <div className="text-gray-700">{review.content}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold mb-3">Que faire maintenant ?</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Prenez en compte les feedbacks des contributeurs</li>
                            <li>Modifiez votre post pour l'améliorer</li>
                            <li>Une fois les modifications terminées, vous pourrez soumettre à nouveau votre post pour validation</li>
                            <li>N'hésitez pas à demander de l'aide aux autres membres de la communauté</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 