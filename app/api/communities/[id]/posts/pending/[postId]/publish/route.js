import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

const prisma = new PrismaClient();

// Publier un post en attente
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;

        // Vérifier que l'utilisateur est l'auteur du post
        const post = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(postId),
                community_id: parseInt(communityId)
            },
            include: {
                community_posts_reviews: {
                    include: {
                        user: true,
                    },
                },
                community: {
                    select: {
                        creator_id: true,
                    },
                },
            }
        });

        if (!post) {
            return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
        }

        if (post.author_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Vous n'êtes pas l'auteur de ce post" },
                { status: 403 }
            );
        }

        // Compter le nombre total de contributeurs dans la communauté
        const contributorsCount = await prisma.community_contributors.count({
            where: {
                community_id: parseInt(communityId)
            }
        });

        // Compter le nombre de votes
        const reviewsCount = post.community_posts_reviews.length;

        // Compter les votes positifs
        const approvedCount = post.community_posts_reviews.filter(
            (review) => review.status === "APPROVED"
        ).length;

        // Compter les votes négatifs
        const rejectedCount = post.community_posts_reviews.filter(
            (review) => review.status === "REJECTED"
        ).length;

        // Vérifier si au moins la moitié des contributeurs ont voté
        const requiredVotes = Math.ceil(contributorsCount / 2);
        if (reviewsCount < requiredVotes) {
            return NextResponse.json(
                {
                    error: "Pas assez de votes",
                    details: {
                        contributorsCount,
                        requiredVotes,
                        currentVotes: reviewsCount
                    }
                },
                { status: 400 }
            );
        }

        // Calculer le nombre de votes nécessaires pour une majorité stricte
        // Si le nombre de contributeurs est pair, il faut (contributorsCount/2) + 1 votes
        // Si le nombre de contributeurs est impair, il faut Math.ceil(contributorsCount/2) votes
        const isContributorsCountEven = contributorsCount % 2 === 0;
        const requiredApprovals = isContributorsCountEven
            ? (contributorsCount / 2) + 1
            : Math.ceil(contributorsCount / 2);

        // Vérifier si le post a suffisamment de votes positifs
        if (approvedCount < requiredApprovals) {
            return NextResponse.json(
                {
                    error: "Le post n'a pas reçu assez de votes positifs",
                    details: {
                        approvedCount,
                        requiredApprovals,
                        contributorsCount,
                        isContributorsCountEven
                    }
                },
                { status: 400 }
            );
        }

        // Publier le post
        const updatedPost = await prisma.community_posts.update({
            where: {
                id: parseInt(postId)
            },
            data: {
                status: "PUBLISHED"
            }
        });

        // Récupérer tous les membres de la communauté
        const communityMembers = await prisma.community_contributors.findMany({
            where: {
                community_id: parseInt(communityId)
            }
        });

        const community = await prisma.community.findUnique({
            where: {
                id: parseInt(communityId)
            },
            select: {
                creator_id: true,
                name: true
            }
        });

        //Notifier tous les membres de la communauté
        await createBulkNotifications({
            userIds: communityMembers.map((member) => member.contributor_id),
            title: "Post publié",
            message: `Un nouveau post a été publié dans la communauté "${community.name}"`,
            type: NotificationType.NEW_POST,
            link: `/community/${communityId}/posts/${postId}`,
            metadata: {
                communityId,
                postId,
            }
        });

        //Récupérer le contributeur qui a publié le post
        const contributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(post.author_id)
                }
            },
            include: {
                user: true
            }
        });

        //Notifier le créateur de la communauté que le post d'un contributeur a été publié
        await createBulkNotifications({
            userIds: [community.creator_id],
            title: `Post publié par un contributeur ${contributor.user.fullName}`,
            message: `Le post "${post.title}" a été publié dans "${community.name}" suite au vote de la communauté`,
            type: NotificationType.CONTRIBUTION_APPROVED,
            link: `/community/${communityId}/posts/${postId}`,
            metadata: {
                communityId,
                postId,
            }
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la publication du post" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 