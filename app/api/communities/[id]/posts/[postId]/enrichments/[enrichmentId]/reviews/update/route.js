import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContributionStatus } from "@/lib/contributionUtils";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, enrichmentId } = await params;
        const { content, status } = await request.json();

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

        // Vérifier que la révision existe
        const existingReview = await prisma.community_posts_contribution_reviews.findFirst({
            where: {
                contribution_id: parseInt(enrichmentId),
                user_id: parseInt(session.user.id),
            },
        });

        if (!existingReview) {
            return NextResponse.json(
                { error: "Aucune révision trouvée" },
                { status: 404 }
            );
        }

        // Mettre à jour la révision
        const updatedReview = await prisma.community_posts_contribution_reviews.update({
            where: {
                id: existingReview.id,
            },
            data: {
                content,
                status,
            },
        });

        // Récupérer les informations sur l'enrichissement et son auteur
        const enrichment = await prisma.community_posts_contributions.findUnique({
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

        // Obtenir le nombre de contributeurs pour vérifier si la contribution peut être automatiquement approuvée ou rejetée
        const contributorsCount = await prisma.community_contributors.count({
            where: {
                community_id: parseInt(communityId),
            },
        });

        // Vérifier le statut de l'enrichissement après cette mise à jour
        const { shouldUpdate, newStatus } = await checkContributionStatus(
            parseInt(enrichmentId),
            contributorsCount
        );

        // Mettre à jour le statut de la contribution si nécessaire
        if (shouldUpdate) {
            await prisma.community_posts_contributions.update({
                where: {
                    id: parseInt(enrichmentId),
                },
                data: {
                    status: newStatus,
                },
            });

            // Créer une notification pour l'auteur de la contribution      
            await createBulkNotifications({
                userIds: [enrichment.user.id],
                type: NotificationType.FEEDBACK,
                title: newStatus === "APPROVED"
                    ? "Nouveau vote positif sur votre enrichissement"
                    : "Nouveau vote négatif sur votre enrichissement",
                message: newStatus === "APPROVED"
                    ? `Votre enrichissement sur "${enrichment.community_posts.title}" a reçu un nouveau vote positif par la communauté.`
                    : `Votre enrichissement sur "${enrichment.community_posts.title}" a reçu un nouveau vote négatif par la communauté.`,
                link: `/community/${communityId}/posts/${postId}/enrichments/${enrichmentId}/review`,
            });
        }


        return NextResponse.json({ success: true, review: updatedReview });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de la révision" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 