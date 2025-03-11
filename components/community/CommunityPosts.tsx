"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, Edit, FileText, PlusCircle, Users } from "lucide-react";

// Ajouter ces catégories de posts
const POST_CATEGORIES = [
    { id: "general", label: "Général" },
    { id: "analyse-technique", label: "Analyse technique" },
    { id: "news", label: "News" },
    { id: "reports", label: "Rapports" },
];

interface Post {
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
    status: string;
}

interface CommunityPostsProps {
    posts: Post[];
    communityId: string;
    isContributor: boolean;
    userId?: string;
}

export default function CommunityPosts({
    posts,
    communityId,
    isContributor,
    userId
}: CommunityPostsProps) {
    const router = useRouter();
    const [selectedPostCategory, setSelectedPostCategory] = useState<string | null>(null);

    // Modifier la fonction de gestion du clic sur une catégorie
    const handleCategoryClick = (categoryId: string) => {
        setSelectedPostCategory(
            selectedPostCategory === categoryId ? null : categoryId
        );
    };

    return (
        <div className="space-y-8">
            {/* Bouton Nouveau Post pour les contributeurs */}
            <div className="flex justify-end">
                {isContributor && (
                    <button
                        onClick={() =>
                            router.push(`/community/${communityId}/posts/create`)
                        }
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Proposer un post</span>
                    </button>
                )}
            </div>

            {/* Posts groupés par catégories */}
            {POST_CATEGORIES.map((category) => {
                const categoryPosts = posts.filter(
                    (post) => post.tag === category.id
                );
                if (categoryPosts.length === 0) return null;
                return (
                    <div
                        key={category.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                        {/* En-tête de la catégorie */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => handleCategoryClick(category.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-medium text-gray-900">
                                        {category.label}
                                    </h3>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                        {categoryPosts.length}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${selectedPostCategory === category.id
                                        ? "rotate-180"
                                        : ""
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Liste des posts de la catégorie */}
                        {selectedPostCategory === category.id &&
                            categoryPosts && (
                                <div className="divide-y divide-gray-100">
                                    {categoryPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <Image
                                                        src={post.user.profilePicture}
                                                        alt={post.user.fullName}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {post.user.fullName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDistanceToNow(
                                                                new Date(post.created_at),
                                                                {
                                                                    addSuffix: true,
                                                                    locale: fr,
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                {userId && Number(userId) === post.user.id && (
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/community/${communityId}/posts/${post.id}/edit?status=PUBLISHED`
                                                            )
                                                        }
                                                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                {post.title}
                                            </h4>

                                            {/* Image de couverture */}
                                            {post.cover_image_url && (
                                                <div className="mb-3 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={`https://${post.cover_image_url}`}
                                                        alt={post.title}
                                                        width={800}
                                                        height={400}
                                                        className="w-full h-[200px] object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="prose prose-sm max-w-none text-gray-600 mb-3 max-h-[300px] overflow-hidden relative">
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: post.content,
                                                    }}
                                                    className="line-clamp-[12] p-6"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                {post.accept_contributions ? (
                                                    <span className="text-sm text-green-600 flex items-center">
                                                        <Users className="w-4 h-4 mr-1" />
                                                        Contributions activées
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-red-600 flex items-center">
                                                        <Users className="w-4 h-4 mr-1" />
                                                        Contributions désactivées
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/community/${communityId}/posts/${post.id}#post-page`
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    Lire la suite →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                );
            })}
        </div>
    );
} 