import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPostStatus } from "@/lib/postUtils";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;
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

        const isCreator = await prisma.community.findUnique({
            where: {
                id: parseInt(communityId),
                creator_id: parseInt(session.user.id),
            }
        });

        if (!membership && !isCreator) {
            return NextResponse.json(
                { error: "Vous n'êtes pas contributeur de cette communauté" },
                { status: 403 }
            );
        }

        // Vérifier que le post existe
        const post = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(postId),
                community_id: parseInt(communityId),
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
        }

        // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
        const community = await prisma.community.findUnique({
            where: {
                id: parseInt(communityId),
            },
            include: {
                community_contributors: true,
            },
        });

        const isContributor = community.community_contributors.some(
            (contributor) => contributor.contributor_id === parseInt(session.user.id)
        );

        // Permettre la modification du vote si l'utilisateur est contributeur OU créateur de la communauté
        if (!isContributor && !isCreator) {
            return NextResponse.json(
                { error: "Vous devez être un contributeur pour modifier votre vote" },
                { status: 403 }
            );
        }

        // Vérifier si l'utilisateur est l'auteur du post
        if (post.author_id === parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas réviser votre propre post" },
                { status: 403 }
            );
        }

        // Vérifier que le post est toujours en attente
        if (post.status !== "PENDING") {
            return NextResponse.json(
                { error: "Ce post n'est plus en attente de révision" },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur a déjà soumis une révision
        const existingReview = await prisma.community_posts_reviews.findFirst({
            where: {
                post_id: parseInt(postId),
                reviewer_id: parseInt(session.user.id),
            },
        });

        if (!existingReview) {
            return NextResponse.json(
                { error: "Vous n'avez pas encore voté sur ce post" },
                { status: 404 }
            );
        }

        // Mettre à jour la révision
        const updatedReview = await prisma.community_posts_reviews.update({
            where: {
                id: existingReview.id,
            },
            data: {
                content,
                status,
                created_at: new Date(), // Mettre à jour la date pour indiquer la modification
            },
        });

        // Après avoir mis à jour la review, vérifier si le post peut maintenant être publié

        // Récupérer le post avec toutes ses reviews
        const updatedPost = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(postId),
            },
            include: {
                community_posts_reviews: true,
                user: true,
            },
        });

        // Récupérer le nombre de contributeurs
        const contributorsCount = await prisma.community_contributors.count({
            where: {
                community_id: parseInt(communityId),
            },
        });

        const isContributorsCountEven = contributorsCount % 2 === 0;

        // Vérifier si le post peut être publié
        const publishStatus = checkPostStatus(
            updatedPost,
            contributorsCount,
            isContributorsCountEven
        );

        // Si le post peut être publié, envoyer une notification à l'auteur
        if (publishStatus.canPublish) {
            try {
                await createBulkNotifications({
                    userIds: [updatedPost.author_id],
                    title: "Votre post peut être publié !",
                    message: `Votre post "${updatedPost.title}" a reçu suffisamment de votes positifs et peut maintenant être publié.`,
                    type: NotificationType.POST_READY_PUBLISH, // Utilisez une chaîne directe
                    link: `/community/${communityId}/posts/${postId}`,
                    metadata: {
                        communityId,
                        postId,
                        publishStatus: publishStatus.details
                    }
                });
            } catch (notifError) {
                console.error("Erreur lors de l'envoi de la notification de publication:", notifError);
                // On continue même si la notification échoue
            }
        }

        return NextResponse.json({
            message: "Vote modifié avec succès",
            review: updatedReview,
        });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la modification du vote" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}