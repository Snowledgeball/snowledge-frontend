import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, enrichmentId } = await params;

        // Vérifier que l'utilisateur est créateur ou contributeur
        const community = await prisma.community.findUnique({
            where: { id: parseInt(communityId) },
            select: {
                creator_id: true,
            },
        });

        const isCreator = community.creator_id === parseInt(session.user.id);

        if (!isCreator) {
            const isContributor = await prisma.community_contributors.findUnique({
                where: {
                    community_id_contributor_id: {
                        community_id: parseInt(communityId),
                        contributor_id: parseInt(session.user.id),
                    },
                },
            });

            if (!isContributor) {
                return NextResponse.json(
                    { error: "Vous n'êtes pas autorisé à approuver cette contribution" },
                    { status: 403 }
                );
            }
        }

        // Récupérer la contribution
        const enrichment = await prisma.community_posts_enrichments.findUnique({
            where: {
                id: parseInt(enrichmentId),
                post_id: parseInt(postId),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                post: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        if (!enrichment) {
            return NextResponse.json(
                { error: "Contribution non trouvée" },
                { status: 404 }
            );
        }

        if (enrichment.status !== "PENDING") {
            return NextResponse.json(
                { error: "Cette contribution a déjà été traitée" },
                { status: 400 }
            );
        }

        // Mettre à jour le post avec le contenu de la contribution
        await prisma.community_posts.update({
            where: {
                id: parseInt(postId),
            },
            data: {
                content: enrichment.content,
            },
        });

        // Mettre à jour le statut de la contribution
        await prisma.community_posts_enrichments.update({
            where: {
                id: parseInt(enrichmentId),
            },
            data: {
                status: "APPROVED",
            },
        });

        // Récupérer tous les learners de la communauté
        const learners = await prisma.community_learners.findMany({
            where: {
                community_id: parseInt(communityId),
            },
            select: {
                user_id: true,
            },
        });

        const learnerAndCreator = [...learners, community.creator_id];

        // Créer une notification pour tous les membres de la communauté
        await createBulkNotifications({
            userIds: learnerAndCreator,
            type: NotificationType.ENRICHMENT_APPROVED,
            title: `Enrichissement du post "${enrichment.post.title}" publié`,
            message: `Le contributeur "${enrichment.user.fullName}" a publié un enrichissement sur le post "${enrichment.post.title}"`,
            link: `/community/${communityId}/posts/${postId}`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la publication de l'enrichissement" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 