"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, Edit, FileText, PlusCircle, Users } from "lucide-react";
import { Loader } from "@/components/ui/loader";

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

// Cache pour les contenus HTML rendus
const contentCache = new Map<number, string>();

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
    const [visiblePosts, setVisiblePosts] = useState<Record<string, number>>({});

    // Mémoriser les catégories qui ont des posts
    const categoriesWithPosts = useMemo(() => {
        // Vérifier que posts est bien un tableau
        if (!Array.isArray(posts)) {
            console.error("posts n'est pas un tableau:", posts);
            return POST_CATEGORIES; // Retourner toutes les catégories par défaut
        }

        return POST_CATEGORIES.filter(category =>
            posts.some(post => post.tag === category.id)
        );
    }, [posts]);

    // Mémoriser les posts par catégorie
    const postsByCategory = useMemo(() => {
        const result: Record<string, Post[]> = {};

        // Vérifier que posts est bien un tableau
        if (!Array.isArray(posts)) {
            return result;
        }

        categoriesWithPosts.forEach(category => {
            result[category.id] = posts.filter(post => post.tag === category.id);
        });

        return result;
    }, [posts, categoriesWithPosts]);

    // Initialiser le nombre de posts visibles par catégorie
    useEffect(() => {
        const initialVisiblePosts: Record<string, number> = {};
        categoriesWithPosts.forEach(category => {
            initialVisiblePosts[category.id] = 5; // Afficher 5 posts par défaut
        });
        setVisiblePosts(initialVisiblePosts);
    }, [categoriesWithPosts]);

    // Gérer le clic sur une catégorie (simple toggle local)
    const handleCategoryClick = useCallback((categoryId: string) => {
        setExpandedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    }, []);

    // Charger plus de posts pour une catégorie
    const loadMorePosts = useCallback((categoryId: string) => {
        setVisiblePosts(prev => ({
            ...prev,
            [categoryId]: prev[categoryId] + 5
        }));
    }, []);

    // Mettre à jour les catégories dépliées si l'URL change
    useEffect(() => {
        if (categoryFromUrl && !expandedCategories.includes(categoryFromUrl)) {
            setExpandedCategories(prev => [...prev, categoryFromUrl]);
        }
    }, [categoryFromUrl, expandedCategories]);

    // Fonction pour naviguer vers un post
    const navigateToPost = useCallback((postId: number) => {
        setIsLoading(true);
        router.push(`/community/${communityId}/posts/${postId}`);
    }, [router, communityId]);

    // Fonction pour obtenir le contenu HTML mis en cache ou le mettre en cache
    const getCachedContent = useCallback((post: Post) => {
        if (contentCache.has(post.id)) {
            return contentCache.get(post.id) || '';
        }

        // Limiter le contenu à 500 caractères pour l'aperçu
        const truncatedContent = post.content.length > 500
            ? post.content.substring(0, 500) + '...'
            : post.content;

        contentCache.set(post.id, truncatedContent);
        return truncatedContent;
    }, []);

    // Réinitialiser l'état de chargement lorsque les posts changent
    useEffect(() => {
        setIsLoading(false);
    }, [posts]);

    if (!Array.isArray(posts) || posts.length === 0) {
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
        <div className="space-y-8 bg-gray-50 p-6 rounded-xl" id="posts-container">
            {isLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
                    <Loader size="lg" color="gradient" text="Chargement..." variant="pulse" fullScreen />
                </div>
            )}

            {/* Bouton Nouveau Post pour les contributeurs */}
            <div className="flex justify-end mb-8">
                {isContributor && (
                    <button
                        onClick={() => {
                            setIsLoading(true);
                            router.push(`/community/${communityId}/posts/create`);
                        }}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        id="create-post-button"
                        disabled={isLoading}
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span className="font-medium">Proposer un post</span>
                    </button>
                )}
            </div>

            {/* Liste des catégories */}
            <div className="flex flex-wrap gap-3 mb-6" id="category-list">
                {categoriesWithPosts.map((category) => {
                    const categoryPostsCount = postsByCategory[category.id]?.length || 0;
                    const isExpanded = expandedCategories.includes(category.id);

                    return (
                        <button
                            key={`category-button-${category.id}`}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center shadow-sm ${isExpanded
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                }`}
                            disabled={isLoading}
                        >
                            <FileText className={`w-4 h-4 mr-2 ${isExpanded ? 'text-blue-600' : 'text-gray-500'}`} />
                            {category.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isExpanded
                                ? "bg-blue-200 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                                }`}>
                                {categoryPostsCount}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Posts groupés par catégories */}
            <div className="space-y-4">
                {categoriesWithPosts.map((category) => {
                    const categoryPosts = postsByCategory[category.id] || [];
                    const isExpanded = expandedCategories.includes(category.id);
                    const visiblePostCount = visiblePosts[category.id] || 5;
                    const displayedPosts = categoryPosts.slice(0, visiblePostCount);
                    const hasMorePosts = visiblePostCount < categoryPosts.length;

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
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                                    aria-expanded={isExpanded}
                                    aria-controls={`posts-${category.id}`}
                                    disabled={isLoading}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <h3 className="font-semibold text-gray-900">
                                                {category.label}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {categoryPosts.length} {categoryPosts.length > 1 ? 'articles' : 'article'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`mr-3 text-sm font-medium ${isExpanded ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {isExpanded ? 'Masquer' : 'Afficher'}
                                        </span>
                                        <div className={`p-1 rounded-full transition-colors ${isExpanded ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                            <ChevronDown
                                                className={`w-5 h-5 ${isExpanded ? 'text-blue-600' : 'text-gray-400'} transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                            />
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Liste des posts de la catégorie */}
                            <div
                                id={`posts-${category.id}`}
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                {isExpanded && (
                                    <div className="divide-y divide-gray-100">
                                        {displayedPosts.map((post) => (
                                            <div
                                                key={post.id}
                                                className="p-6 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                                                id={`post-${post.id}`}
                                            >
                                                {/* En-tête du post avec l'auteur et la date */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative">
                                                            <Image
                                                                src={post.user.profilePicture}
                                                                alt={post.user.fullName}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full ring-2 ring-white shadow-sm"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {post.user.fullName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
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
                                                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                                            aria-label="Modifier le post"
                                                            disabled={isLoading}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Contenu principal du post */}
                                                <div className="space-y-4">
                                                    {/* Titre du post */}
                                                    <h4 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                                        {post.title}
                                                    </h4>

                                                    {/* Image de couverture */}
                                                    {post.cover_image_url && (
                                                        <div className="rounded-xl overflow-hidden shadow-sm">
                                                            <Image
                                                                src={`https://${post.cover_image_url}`}
                                                                alt={post.title}
                                                                width={800}
                                                                height={400}
                                                                className="w-full h-[240px] object-cover transform hover:scale-105 transition-transform duration-300"
                                                                loading="lazy"
                                                                sizes="(max-width: 768px) 100vw, 800px"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Contenu du post */}
                                                    <div className="mb-3 max-h-[200px] overflow-hidden relative rounded-lg bg-gray-50">
                                                        <style jsx global>{`
                                                            .post-preview h2 {
                                                                font-size: 1.25rem;
                                                                font-weight: 700;
                                                                margin-top: 0.75rem;
                                                                margin-bottom: 0.5rem;
                                                                color: #1f2937;
                                                            }
                                                            .post-preview h3 {
                                                                font-size: 1.125rem;
                                                                font-weight: 600;
                                                                margin-top: 0.75rem;
                                                                margin-bottom: 0.5rem;
                                                                color: #1f2937;
                                                            }
                                                            .post-preview p {
                                                                margin-bottom: 0.75rem;
                                                                color: #4b5563;
                                                            }
                                                            .post-preview ul, .post-preview ol {
                                                                margin-left: 1.5rem;
                                                                margin-bottom: 0.75rem;
                                                            }
                                                            .post-preview ul {
                                                                list-style-type: disc;
                                                            }
                                                            .post-preview ol {
                                                                list-style-type: decimal;
                                                            }
                                                            .post-preview a {
                                                                color: #2563eb;
                                                                text-decoration: underline;
                                                            }
                                                            .post-preview img {
                                                                max-width: 100%;
                                                                height: auto;
                                                                border-radius: 0.25rem;
                                                                margin: 0.75rem 0;
                                                            }
                                                        `}</style>
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: getCachedContent(post),
                                                            }}
                                                            className="post-preview p-4 overflow-hidden"
                                                            style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 8,
                                                                WebkitBoxOrient: 'vertical',
                                                            }}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
                                                    </div>
                                                </div>

                                                {/* Pied de carte avec statut et bouton */}
                                                <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
                                                    {post.accept_contributions ? (
                                                        <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            Contributions activées
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            Contributions désactivées
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => navigateToPost(post.id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center"
                                                        disabled={isLoading}
                                                    >
                                                        Lire la suite
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Bouton "Voir plus" si nécessaire */}
                                        {hasMorePosts && (
                                            <div className="p-4 text-center">
                                                <button
                                                    onClick={() => loadMorePosts(category.id)}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    Voir plus d'articles ({categoryPosts.length - visiblePostCount} restants)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 