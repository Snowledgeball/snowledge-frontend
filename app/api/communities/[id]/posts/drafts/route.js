import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Récupérer tous les brouillons
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId } = await params;

        // Vérifier que l'utilisateur est contributeur
        const membership = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id),
                },
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "Vous n'êtes pas contributeur de cette communauté" },
                { status: 403 }
            );
        }

        // Récupérer tous les brouillons de l'utilisateur pour cette communauté
        const drafts = await prisma.community_posts.findMany({
            where: {
                author_id: parseInt(session.user.id),
                community_id: parseInt(communityId),
                status: "DRAFT",
            },
            orderBy: {
                updated_at: "desc",
            },
            include: {
                // Inclure les reviews pour déterminer si le post a été rejeté
                community_posts_reviews: {
                    select: {
                        id: true,
                        status: true,
                        content: true,
                        created_at: true,
                        reviewer_id: true,
                    },
                    // Facultatif: Limiter aux 10 dernières reviews pour éviter de surcharger la réponse
                    take: 10,
                    orderBy: {
                        created_at: 'desc'
                    }
                },
            },
        });

        // Transformer les données pour l'API
        const transformedDrafts = drafts.map((draft) => {
            const rejectedReviews = draft.community_posts_reviews.filter(
                (review) => review.status === "REJECTED"
            );
            const wasRejected = rejectedReviews.length > 0;

            // Compter les feedbacks positifs et négatifs
            const totalReviews = draft.community_posts_reviews.length;
            const rejectedCount = rejectedReviews.length;
            const approvedCount = draft.community_posts_reviews.filter(
                (review) => review.status === "APPROVED"
            ).length;

            return {
                id: draft.id,
                title: draft.title,
                content: draft.content,
                cover_image_url: draft.cover_image_url,
                tag: draft.tag,
                created_at: draft.created_at,
                updated_at: draft.updated_at,
                status: draft.status,
                was_rejected: wasRejected,
                rejection_stats: {
                    total: totalReviews,
                    rejected: rejectedCount,
                    approved: approvedCount,
                    rejection_rate: totalReviews > 0 ? (rejectedCount / totalReviews) * 100 : 0
                }
            };
        });

        return NextResponse.json(transformedDrafts);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des brouillons" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Créer un nouveau brouillon
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId } = await params;
        const { title, content, cover_image_url, tag, accept_contributions } = await request.json();

        // Vérifier que l'utilisateur est contributeur
        const membership = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id),
                },
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "Vous n'êtes pas contributeur de cette communauté" },
                { status: 403 }
            );
        }

        // Créer le brouillon
        const draft = await prisma.community_posts.create({
            data: {
                community_id: parseInt(communityId),
                author_id: parseInt(session.user.id),
                title: title || "Sans titre",
                content: content || "",
                cover_image_url: cover_image_url || "",
                tag: tag || "",
                accept_contributions: accept_contributions || false,
                status: "DRAFT",
            },
        });

        return NextResponse.json(draft);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création du brouillon" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 