import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContributionStatus } from "@/lib/contributionUtils";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, contributionId } = await params;
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
                contribution_id: parseInt(contributionId),
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

        // Obtenir le nombre de contributeurs pour vérifier si la contribution peut être automatiquement approuvée ou rejetée
        const contributorsCount = await prisma.community_contributors.count({
            where: {
                community_id: parseInt(communityId),
            },
        });

        // Vérifier le statut de la contribution après cette mise à jour
        const { shouldUpdate, newStatus } = await checkContributionStatus(
            parseInt(contributionId),
            contributorsCount
        );

        // Mettre à jour le statut de la contribution si nécessaire
        if (shouldUpdate) {
            const contribution = await prisma.community_posts_contributions.findUnique({
                where: {
                    id: parseInt(contributionId),
                },
                include: {
                    user: true,
                    post: {
                        select: {
                            title: true,
                        },
                    },
                },
            });

            await prisma.community_posts_contributions.update({
                where: {
                    id: parseInt(contributionId),
                },
                data: {
                    status: newStatus,
                },
            });

            // Notifier l'auteur de la contribution
            if (newStatus === "APPROVED" || newStatus === "REJECTED") {
                const notification = {
                    userId: contribution.user_id,
                    type: newStatus === "APPROVED"
                        ? NotificationType.CONTRIBUTION_APPROVED
                        : NotificationType.CONTRIBUTION_REJECTED,
                    title: newStatus === "APPROVED"
                        ? "Contribution approuvée!"
                        : "Contribution rejetée",
                    message: newStatus === "APPROVED"
                        ? `Votre contribution sur "${contribution.post.title}" a été approuvée par la communauté.`
                        : `Votre contribution sur "${contribution.post.title}" a été rejetée par la communauté.`,
                    link: `/community/${communityId}/posts/${postId}`,
                };

                await createBulkNotifications([notification]);
            }
        }

        return NextResponse.json({ success: true, review: updatedReview });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de la révision" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 