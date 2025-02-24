"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MessageCircle, Edit } from "lucide-react";
import TinyEditor from "@/components/shared/TinyEditor";
import { useSession } from "next-auth/react";

interface PendingPost {
    id: number;
    title: string;
    content: string;
    cover_image_url: string | null;
    tag: string;
    created_at: string;
    accept_contributions: boolean;
    user: {
        id: number;
        fullName: string;
        profilePicture: string;
    };
    community_posts_reviews: {
        id: number;
        content: string;
        status: string;
        created_at: string;
        is_validated: boolean;
        user: {
            id: number;
            fullName: string;
            profilePicture: string;
        };
    }[];
}

export default function PendingPosts() {
    const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
    const params = useParams();
    const router = useRouter();

    const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<PendingPost | null>(null);
    const [reviewContent, setReviewContent] = useState("");
    const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
    const { data: session } = useSession();


    useEffect(() => {
        const fetchPendingPosts = async () => {
            try {
                const response = await fetch(`/api/communities/${params.id}/posts/pending`);
                if (!response.ok) throw new Error('Erreur lors de la récupération des posts');
                const data = await response.json();
                setPendingPosts(data);
            } catch (error) {
                toast.error('Erreur lors de la récupération des posts en attente');
                router.push(`/community/${params.id}`);
            }
        };

        fetchPendingPosts();
    }, [params.id, router]);



    const handlePublish = async (postId: number) => {
        try {
            const response = await fetch(`/api/communities/${params.id}/posts/pending/${postId}/publish`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la publication');
            }

            toast.success('Post publié avec succès');
            setPendingPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Erreur lors de la publication du post");
            }
        }
    };

    if (isLoading) return <LoadingComponent />;
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Posts en attente de révision</h1>

                {session && (
                    <div className="space-y-6">
                        {pendingPosts.map((post) => (
                            <Card key={post.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Image
                                            src={post.user.profilePicture}
                                            alt={post.user.fullName}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium">{post.user.fullName}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDistanceToNow(new Date(post.created_at), {
                                                    addSuffix: true,
                                                    locale: fr
                                                })}
                                            </p>
                                        </div>
                                    </div>


                                    <div className="flex items-center space-x-2">
                                        {post.user.id === parseInt(session?.user?.id) ? (
                                            <button
                                                onClick={() => router.push(`/community/${params.id}/post/${post.id}/edit`)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Edit className="w-4 h-4 mr-2 inline-block" />
                                                Modifier
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/community/${params.id}/post/${post.id}/review`)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <MessageCircle className="w-4 h-4 mr-2 inline-block" />
                                                Réviser
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold mb-4">{post.title}</h2>

                                {/* Reviews */}
                                <div className="mt-6 space-y-4">
                                    <h3 className="font-medium text-gray-900">Reviews ({post.community_posts_reviews.length})</h3>
                                    <div className="space-y-4">
                                        {post.community_posts_reviews.map((review) => (
                                            <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Image
                                                            src={review.user.profilePicture}
                                                            alt={review.user.fullName}
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full"
                                                        />
                                                        <span className="font-medium">{review.user.fullName}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-sm ${review.status === 'APPROVED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {review.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600">{review.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Statistiques des reviews */}
                                    {post.community_posts_reviews.length > 0 && session && (
                                        <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">
                                                    Approuvés: {post.community_posts_reviews.filter(r => r.status === 'APPROVED').length}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Rejetés: {post.community_posts_reviews.filter(r => r.status === 'REJECTED').length}
                                                </p>
                                            </div>
                                            {post.user.id === parseInt(session?.user?.id) && (
                                                <div>
                                                    <button
                                                        onClick={() => handlePublish(post.id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={
                                                            post.community_posts_reviews.filter(r => r.status === 'APPROVED').length <
                                                            post.community_posts_reviews.filter(r => r.status === 'REJECTED').length * 2 ||
                                                            post.community_posts_reviews.length < 2 // Au moins 2 reviews nécessaires
                                                        }
                                                    >
                                                        {post.community_posts_reviews.length < 2
                                                            ? "En attente de plus de reviews"
                                                            : "Publier"}
                                                    </button>
                                                    {post.community_posts_reviews.length < 2 && (
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            Il faut au moins 2 reviews pour pouvoir publier
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 