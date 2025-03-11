import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = params;

        // Récupérer le post
        const post = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(postId),
                community_id: parseInt(communityId),
            },
            include: {
                community_posts_reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                },
                user: true,
                community: true,
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
        }

        // Vérifier si le post est déjà rejeté
        if (post.status === "DRAFT") {
            return NextResponse.json(
                { error: "Ce post est déjà en brouillon" },
                { status: 400 }
            );
        }

        // Mettre à jour le statut du post en "DRAFT" (brouillon)
        const updatedPost = await prisma.community_posts.update({
            where: {
                id: parseInt(postId),
            },
            data: {
                status: "DRAFT",
            },
        });

        // Récupérer les feedbacks négatifs pour les inclure dans la notification
        const rejectionFeedbacks = post.community_posts_reviews
            .filter(review => review.status === "REJECTED")
            .map(review => ({
                reviewer: review.user.fullName,
                content: review.content
            }));

        // Notifier l'auteur que son post a été rejeté
        try {
            await createBulkNotifications({
                userIds: [post.author_id],
                title: "Votre post a été rejeté par la communauté",
                message: `Votre post "${post.title}" dans la communauté "${post.community.name}" a été rejeté par la majorité des contributeurs. Il a été déplacé dans vos brouillons pour que vous puissiez l'améliorer.`,
                type: NotificationType.ENRICHMENT_REJECTED,
                link: `/community/${communityId}/posts/${postId}/edit`,
                metadata: {
                    communityId,
                    postId,
                    rejectionFeedbacks
                }
            });
        } catch (notifError) {
            console.error("Erreur lors de l'envoi de la notification de rejet:", notifError);
            // On continue même si la notification échoue
        }

        return NextResponse.json({
            message: "Post rejeté et déplacé en brouillon",
            post: updatedPost
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors du rejet du post" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 