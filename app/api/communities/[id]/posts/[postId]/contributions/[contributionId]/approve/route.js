import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, contributionId } = params;

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
        const contribution = await prisma.post_contributions.findUnique({
            where: {
                id: parseInt(contributionId),
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

        if (!contribution) {
            return NextResponse.json(
                { error: "Contribution non trouvée" },
                { status: 404 }
            );
        }

        if (contribution.status !== "PENDING") {
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
                content: contribution.content,
            },
        });

        // Mettre à jour le statut de la contribution
        await prisma.post_contributions.update({
            where: {
                id: parseInt(contributionId),
            },
            data: {
                status: "APPROVED",
            },
        });

        // Créer une notification pour l'auteur de la contribution
        await prisma.notifications.create({
            data: {
                user_id: contribution.user.id,
                type: "CONTRIBUTION_APPROVED",
                title: "Contribution approuvée",
                message: `Votre contribution au post "${contribution.post.title}" a été approuvée et intégrée.`,
                link: `/community/${communityId}/posts/${postId}`,
                is_read: false,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'approbation de la contribution" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 