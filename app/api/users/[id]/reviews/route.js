import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Récupérer toutes les reviews de posts créées par l'utilisateur
        const postsReviews = await prisma.community_posts_reviews.findMany({
            where: {
                reviewer_id: userId
            },
            include: {
                community_posts_pending: {
                    select: {
                        id: true,
                        title: true,
                        community_id: true,
                        community: {
                            select: {
                                id: true,
                                name: true,
                                image_url: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        });

        // Récupérer toutes les reviews d'enrichissements créées par l'utilisateur
        const enrichmentsReviews = await prisma.community_posts_enrichment_reviews.findMany({
            where: {
                user_id: userId
            },
            include: {
                community_posts_enrichments: {
                    select: {
                        id: true,
                        title: true,
                        post_id: true,
                        community_posts: {
                            select: {
                                community_id: true,
                                community: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image_url: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        });

        // Transformer les données pour avoir un format uniforme
        const formattedPostsReviews = postsReviews.map(review => ({
            id: review.id,
            content: review.content,
            status: review.status,
            created_at: review.created_at,
            type: 'post_review',
            post: {
                id: review.community_posts_pending?.id,
                title: review.community_posts_pending?.title
            },
            community: {
                id: review.community_posts_pending?.community?.id,
                name: review.community_posts_pending?.community?.name,
                image_url: review.community_posts_pending?.community?.image_url
            }
        }));

        const formattedEnrichmentsReviews = enrichmentsReviews.map(review => ({
            id: review.id,
            content: review.content,
            status: review.status,
            created_at: review.created_at,
            type: 'enrichment_review',
            enrichment: {
                id: review.community_posts_enrichments?.id,
                title: review.community_posts_enrichments?.title
            },
            community: {
                id: review.community_posts_enrichments?.community_posts?.community?.id,
                name: review.community_posts_enrichments?.community_posts?.community?.name,
                image_url: review.community_posts_enrichments?.community_posts?.community?.image_url
            }
        }));

        const reviews = [...formattedPostsReviews, ...formattedEnrichmentsReviews];

        // Ajouter des en-têtes de cache
        const headers = new Headers();
        headers.append("Cache-Control", "max-age=300, s-maxage=300");

        return NextResponse.json(
            { reviews: reviews || [] },
            {
                status: 200,
                headers
            }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des reviews:", error.stack);
        return NextResponse.json(
            { error: "Erreur serveur", reviews: [] },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 