import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContributionStatus } from "@/lib/contributionUtils";
import { NotificationType } from "@/types/notification";
import { createBulkNotifications } from "@/lib/notifications";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, enrichmentId } = await params;
        const { content, status } = await request.json();

        // Vérifier que l'utilisateur est contributeur
        const contributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id),
                },
            },
        });

        const creator = await prisma.community.findUnique({
            where: {
                id: parseInt(communityId),
                creator_id: parseInt(session.user.id),
            },
        });

        if (!contributor && !creator) {
            return NextResponse.json(
                { error: "Vous n'êtes pas contributeur ou créateur de cette communauté" },
                { status: 403 }
            );
        }

        // Vérifier que la révision existe
        const existingReview = await prisma.community_posts_enrichment_reviews.findFirst({
            where: {
                contribution_id: parseInt(enrichmentId),
                user_id: parseInt(session.user.id),
            },
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "Vous avez déjà soumis une révision" },
                { status: 400 }
            );
        }

        // Créer la révision
        const review = await prisma.community_posts_enrichment_reviews.create({
            data: {
                content,
                status,
                contribution_id: parseInt(enrichmentId),
                user_id: parseInt(session.user.id),
            },
        });

        // Obtenir le nombre de contributeurs pour vérifier si la contribution peut être automatiquement approuvée ou rejetée
        const contributorsCount = await prisma.community_contributors.count({
            where: {
                community_id: parseInt(communityId),
            },
        });

        // Vérifier le statut de la contribution après cette nouvelle révision
        const { shouldUpdate, newStatus } = await checkContributionStatus(
            parseInt(enrichmentId),
            contributorsCount
        );

        console.log("la3");

        // Mettre à jour le statut de la contribution si nécessaire
        const enrichment = await prisma.community_posts_enrichments.findUnique({
            where: {
                id: parseInt(enrichmentId),
            },
            include: {
                user: true,
                community_posts: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        if (shouldUpdate) {

            await prisma.community_posts_enrichments.update({
                where: {
                    id: parseInt(enrichmentId),
                },
                data: {
                    status: newStatus,
                },
            });

            if (newStatus === "APPROVED" || newStatus === "REJECTED") {
                // Créer une notification pour l'auteur de l'enrichissement pour indiquer que son enrichissement a été approuvé ou rejeté
                await createBulkNotifications({
                    userIds: [enrichment.user_id],
                    type: newStatus === "APPROVED"
                        ? NotificationType.ENRICHMENT_APPROVED
                        : NotificationType.ENRICHMENT_REJECTED,
                    title: newStatus === "APPROVED"
                        ? "Votre enrichissement a été approuvé"
                        : "Votre enrichissement a été rejeté",
                    message: newStatus === "APPROVED"
                        ? `Votre enrichissement sur "${enrichment.community_posts.title}" a été approuvé par la communauté.`
                        : `Votre enrichissement sur "${enrichment.community_posts.title}" a été rejeté par la communauté.`,
                    link: `/community/${communityId}/posts/${postId}`,
                    metadata: {
                        communityId: communityId,
                        postId: postId,
                        enrichmentId: enrichmentId,
                    },
                });
            }
        }
        else {
            // Créer une notification pour l'auteur de la contribution pour indiquer que son enrichissement a reçu un nouveau vote négatif
            // Notifier l'auteur de la contribution
            await createBulkNotifications({
                userIds: [enrichment.user_id],
                type: NotificationType.FEEDBACK,
                title: "Nouveau vote sur votre enrichissement",
                message: `Votre enrichissement sur "${enrichment.community_posts.title}" a reçu un nouveau vote par la communauté.`,
                link: `/community/${communityId}/posts/${postId}/enrichments/${enrichmentId}`,
                metadata: {
                    communityId: communityId,
                    postId: postId,
                    enrichmentId: enrichmentId,
                },
            });
        }


        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la soumission de la révision" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 