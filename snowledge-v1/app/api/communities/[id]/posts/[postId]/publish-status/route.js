import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkPostStatus } from "@/lib/postUtils";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = params;

        // Récupérer le post avec ses reviews
        const post = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(postId),
                community_id: parseInt(communityId),
            },
            include: {
                community_posts_reviews: true,
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
        }

        // Vérifier si l'utilisateur est l'auteur du post
        if (post.author_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Vous n'êtes pas l'auteur de ce post" },
                { status: 403 }
            );
        }

        // Récupérer le nombre de contributeurs
        const contributorsCount = await prisma.community_contributors.count({
            where: {
                community_id: parseInt(communityId),
            },
        });

        const isContributorsCountEven = contributorsCount % 2 === 0;

        // Vérifier si le post peut être publié
        const publishStatus = checkPostStatus(
            post,
            contributorsCount,
            isContributorsCountEven
        );

        return NextResponse.json(publishStatus);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la vérification du statut de publication" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 