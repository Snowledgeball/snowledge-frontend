import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

const prisma = new PrismaClient();

// Récupérer une contribution spécifique
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, enrichmentId } = await params;

        // Récupérer la contribution
        const enrichment = await prisma.community_posts_enrichments.findUnique({
            where: {
                id: parseInt(enrichmentId),
                community_posts: {
                    id: parseInt(postId),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true,
                    },
                },
                community_posts: {
                    select: {
                        id: true,
                        title: true,
                        community: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                community_posts_enrichment_reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true,
                            },
                        },
                    },
                    orderBy: {
                        created_at: "desc",
                    },
                },
            },
        });

        if (!enrichment) {
            return NextResponse.json({ error: "Enrichissement non trouvé" }, { status: 404 });
        }

        return NextResponse.json(enrichment);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de l'enrichissement" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Mettre à jour une contribution
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, enrichmentId } = await params;
        const { content, description } = await request.json();

        // Récupérer la contribution pour vérifier que l'utilisateur est bien l'auteur
        const enrichment = await prisma.community_posts_enrichments.findUnique({
            where: {
                id: parseInt(enrichmentId),
                community_posts: {
                    id: parseInt(postId),
                },
            },
        });

        if (!enrichment) {
            return NextResponse.json({ error: "Enrichissement non trouvé" }, { status: 404 });
        }

        // Vérifier que l'utilisateur est bien l'auteur de la contribution
        if (enrichment.user_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Vous n'êtes pas autorisé à modifier cet enrichissement" },
                { status: 403 }
            );
        }

        // Vérifier que la contribution est toujours en attente
        if (enrichment.status !== "PENDING") {
            return NextResponse.json(
                { error: "Vous ne pouvez plus modifier cet enrichissement car il a déjà été traité" },
                { status: 400 }
            );
        }

        // Mettre à jour la contribution
        const updatedEnrichment = await prisma.community_posts_enrichments.update({
            where: {
                id: parseInt(enrichmentId),
            },
            data: {
                content,
                description,
            },
        });

        // Réinitialiser les votes car le contenu a changé
        await prisma.community_posts_enrichment_reviews.deleteMany({
            where: {
                community_posts_enrichments: {
                    id: parseInt(enrichmentId),
                },
            },
        });

        // Notifier les contributeurs que la contribution a été mise à jour
        const community = await prisma.community.findUnique({
            where: { id: parseInt(communityId) },
            include: {
                community_contributors: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        const post = await prisma.community_posts.findUnique({
            where: { id: parseInt(postId) },
            select: { title: true },
        });

        const usersToNotify = community.community_contributors
            .filter(contributor => contributor.user.id !== parseInt(session.user.id)) // Exclure l'auteur de la contribution
            .map(contributor => contributor.user.id);


        await createBulkNotifications({
            userIds: usersToNotify,
            type: NotificationType.ENRICHMENT_UPDATED,
            title: "Enrichissement mis à jour",
            message: `${session.user.name} a mis à jour son enrichissement pour le post "${post.title}"`,
            link: `/community/${communityId}/posts/${postId}/enrichments/${enrichmentId}/review`,
            metadata: {
                communityId,
                postId,
                enrichmentId
            }
        });

        return NextResponse.json({ success: true, enrichment: updatedEnrichment });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de l'enrichissement" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 