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

        // Vérifier que le post existe et est en attente
        const post = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(postId),
                community_id: parseInt(communityId),
            },
            include: {
                user: true,
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

        // Permettre le vote si l'utilisateur est contributeur OU créateur de la communauté
        if (!isContributor && !isCreator) {
            return NextResponse.json(
                { error: "Vous devez être un contributeur pour voter" },
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

        // Vérifier si l'utilisateur a déjà soumis une révision
        const existingReview = await prisma.community_posts_reviews.findFirst({
            where: {
                post_id: parseInt(postId),
                reviewer_id: parseInt(session.user.id),
            },
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "Vous avez déjà soumis une révision pour ce post" },
                { status: 400 }
            );
        }

        // Créer la révision
        const review = await prisma.community_posts_reviews.create({
            data: {
                post_id: parseInt(postId),
                reviewer_id: parseInt(session.user.id),
                content,
                status,
            },
        });

        // Notifier l'auteur du post
        // await createBulkNotifications({
        //     userIds: [post.author_id],
        //     title: status === "APPROVED" ? "Votre post a été approuvé" : "Votre post a été rejeté",
        //     message: `Un contributeur a ${status === "APPROVED" ? "approuvé" : "rejeté"} votre post "${post.title}"`,
        //     type: status === "APPROVED" ? NotificationType.APPROVAL : NotificationType.WARNING,
        //     link: `/community/${communityId}/posts/${postId}`,
        //     metadata: {
        //         communityId,
        //         postId,
        //     },
        // });

        return NextResponse.json(review);
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

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;

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

        // Vérifier si l'utilisateur est l'auteur du post
        const isAuthor = post.author_id === parseInt(session.user.id);

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
        const isCreator = community.creator_id === parseInt(session.user.id);

        // Permettre l'accès si l'utilisateur est l'auteur OU contributeur OU créateur
        if (!isAuthor && !isContributor && !isCreator) {
            return NextResponse.json(
                { error: "Vous n'êtes pas autorisé à voir ces reviews" },
                { status: 403 }
            );
        }

        // Récupérer toutes les reviews du post
        const reviews = await prisma.community_posts_reviews.findMany({
            where: {
                post_id: parseInt(postId),
            },
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
                created_at: 'desc',
            },
        });

        // Compter les votes positifs et négatifs
        const approvedCount = reviews.filter(review => review.status === "APPROVED").length;
        const rejectedCount = reviews.filter(review => review.status === "REJECTED").length;

        return NextResponse.json({
            reviews,
            stats: {
                total: reviews.length,
                approved: approvedCount,
                rejected: rejectedCount,
                approvalRate: reviews.length > 0 ? (approvedCount / reviews.length) * 100 : 0
            }
        });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des reviews" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 