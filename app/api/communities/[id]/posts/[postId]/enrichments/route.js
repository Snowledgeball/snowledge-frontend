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
        const { content, original_content, title, description } = await request.json();

        // Vérifier que l'utilisateur est contributeur
        const contributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id),
                },
            },
        });
        if (!contributor) {
            return NextResponse.json(
                { error: "Vous n'êtes pas contributeur de cette communauté" },
                { status: 403 }
            );
        }

        // Vérifier que le post existe et accepte les contributions
        const post = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(postId),
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
        }

        if (!post.accept_contributions) {
            return NextResponse.json(
                { error: "Ce post n'accepte pas les contributions" },
                { status: 403 }
            );
        }

        // Vérifier que l'utilisateur n'est pas l'auteur du post
        if (post.author_id === parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas contribuer à votre propre post" },
                { status: 403 }
            );
        }



        // Créer la contribution
        const contribution = await prisma.community_posts_enrichments.create({
            data: {
                title,
                description,
                content,
                original_content,
                post_id: parseInt(postId),
                user_id: parseInt(session.user.id),
                status: "PENDING",
            },
        });

        // Notifier les contributeurs de la communauté
        const contributors = await prisma.community_contributors.findMany({
            where: {
                community_id: parseInt(communityId),
            },
            select: {
                user: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        const userIds = contributors.filter(contributor => contributor.user.id !== parseInt(session.user.id)).map(contributor => contributor.user.id);

        if (userIds.length > 0) {
            await createBulkNotifications({
                userIds,
                type: NotificationType.NEW_ENRICHMENT_PENDING,
                title: "Nouvelle contribution",
                message: `Un nouvel enrichissement a été soumis pour le post "${post.title}"`,
                link: `/community/${communityId}/posts/${postId}/enrichments/${contribution.id}/review`,
                metadata: {
                    communityId: communityId,
                    postId: postId,
                    creatorId: post.author_id,
                },
            });
        }

        return NextResponse.json({
            success: true,
            contribution,
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la contribution" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 