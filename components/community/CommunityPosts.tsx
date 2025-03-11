"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, Edit, FileText, PlusCircle, Users } from "lucide-react";

// Catégories de posts
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
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [isLoading, setIsLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(
        categoryFromUrl ? [categoryFromUrl] : []
    );

    // Mémoriser les catégories qui ont des posts
    const categoriesWithPosts = useMemo(() => {
        return POST_CATEGORIES.filter(category =>
            posts.some(post => post.tag === category.id)
        );
    }, [posts]);

    // Mémoriser les posts par catégorie
    const postsByCategory = useMemo(() => {
        const result: Record<string, Post[]> = {};

        categoriesWithPosts.forEach(category => {
            result[category.id] = posts.filter(post => post.tag === category.id);
        });

        return result;
    }, [posts, categoriesWithPosts]);

    // Gérer le clic sur une catégorie (simple toggle local)
    const handleCategoryClick = (categoryId: string) => {
        setExpandedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    // Mettre à jour les catégories dépliées si l'URL change
    useEffect(() => {
        if (categoryFromUrl && !expandedCategories.includes(categoryFromUrl)) {
            setExpandedCategories(prev => [...prev, categoryFromUrl]);
        }
    }, [categoryFromUrl, expandedCategories]);

    // Fonction pour naviguer vers un post
    const navigateToPost = (postId: number) => {
        setIsLoading(true);
        router.push(`/community/${communityId}/posts/${postId}`);
    };

    // Réinitialiser l'état de chargement lorsque les posts changent
    useEffect(() => {
        setIsLoading(false);
    }, [posts]);

    if (posts.length === 0) {
        return (
            <div className="space-y-8" id="posts-container">
                <div className="flex justify-end">
                    {isContributor && (
                        <button
                            onClick={() => router.push(`/community/${communityId}/posts/create`)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            id="create-post-button"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Proposer un post</span>
                        </button>
                    )}
                </div>
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">Aucun post disponible dans cette communauté.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8" id="posts-container">
            {isLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-blue-600 font-medium">Chargement...</p>
                    </div>
                </div>
            )}

            {/* Bouton Nouveau Post pour les contributeurs */}
            <div className="flex justify-end">
                {isContributor && (
                    <button
                        onClick={() => {
                            setIsLoading(true);
                            router.push(`/community/${communityId}/posts/create`);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        id="create-post-button"
                        disabled={isLoading}
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Proposer un post</span>
                    </button>
                )}
            </div>

            {/* Liste des catégories */}
            <div className="flex flex-wrap gap-2 mb-4" id="category-list">
                {categoriesWithPosts.map((category) => {
                    const categoryPostsCount = postsByCategory[category.id]?.length || 0;
                    const isExpanded = expandedCategories.includes(category.id);

                    return (
                        <button
                            key={`category-button-${category.id}`}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isExpanded
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            disabled={isLoading}
                        >
                            {category.label} ({categoryPostsCount})
                        </button>
                    );
                })}
            </div>

            {/* Posts groupés par catégories */}
            <div className="space-y-4">
                {categoriesWithPosts.map((category) => {
                    const categoryPosts = postsByCategory[category.id] || [];
                    const isExpanded = expandedCategories.includes(category.id);

                    return (
                        <div
                            key={category.id}
                            className="bg-white rounded-lg shadow-sm overflow-hidden"
                            id={`category-${category.id}`}
                        >
                            {/* En-tête de la catégorie */}
                            <div className="border-b border-gray-100">
                                <button
                                    onClick={() => handleCategoryClick(category.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    aria-expanded={isExpanded}
                                    aria-controls={`posts-${category.id}`}
                                    disabled={isLoading}
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
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </button>
                            </div>

                            {/* Liste des posts de la catégorie */}
                            {isExpanded && (
                                <div
                                    id={`posts-${category.id}`}
                                    className="divide-y divide-gray-100"
                                >
                                    {categoryPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                            id={`post-${post.id}`}
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsLoading(true);
                                                            router.push(
                                                                `/community/${communityId}/posts/${post.id}/edit?status=PUBLISHED`
                                                            );
                                                        }}
                                                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                        aria-label="Modifier le post"
                                                        disabled={isLoading}
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
                                                        priority={true}
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
                                                    onClick={() => navigateToPost(post.id)}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    disabled={isLoading}
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
        </div>
    );
} 