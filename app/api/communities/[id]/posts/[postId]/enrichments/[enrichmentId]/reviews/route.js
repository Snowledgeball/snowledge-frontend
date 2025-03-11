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

        console.log("la4");
        // Vérifier que la révision existe
        const existingReview = await prisma.community_posts_contribution_reviews.findFirst({
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
        const review = await prisma.community_posts_contribution_reviews.create({
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
        if (shouldUpdate) {
            const enrichment = await prisma.community_posts_contributions.findUnique({
                where: {
                    id: parseInt(enrichmentId),
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
                    id: parseInt(enrichmentId),
                },
                data: {
                    status: newStatus,
                },
            });

            // Notifier l'auteur de la contribution
            if (newStatus === "APPROVED" || newStatus === "REJECTED") {
                const notification = {
                    userId: enrichment.user_id,
                    type: newStatus === "APPROVED"
                        ? NotificationType.ENRICHMENT_APPROVED
                        : NotificationType.ENRICHMENT_REJECTED,
                    title: newStatus === "APPROVED"
                        ? "Nouveau vote positif sur votre enrichissement"
                        : "Nouveau vote négatif sur votre enrichissement",
                    message: newStatus === "APPROVED"
                        ? `Votre enrichissement sur "${enrichment.post.title}" a reçu un nouveau vote positif par la communauté.`
                        : `Votre enrichissement sur "${enrichment.post.title}" a reçu un nouveau vote négatif par la communauté.`,
                    link: `/community/${communityId}/posts/${postId}/enrichments/${enrichmentId}/review`,
                };

                await createBulkNotifications([notification]);
            }
        }


        return NextResponse.json({ success: true, review });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la soumission de la révision" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 