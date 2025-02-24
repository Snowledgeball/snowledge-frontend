import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Publier un post en attente
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;

        // Récupérer le post et ses reviews
        const post = await prisma.community_posts.findUnique({
            where: { id: parseInt(postId) },
            include: {
                community_posts_reviews: true
            }
        });

        if (!post) {
            return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
        }

        // Vérifier que l'utilisateur est l'auteur du post
        if (post.author_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        // Calculer le ratio d'approbation
        const approvedCount = post.community_posts_reviews.filter(r => r.status === 'APPROVED').length;
        const rejectedCount = post.community_posts_reviews.filter(r => r.status === 'REJECTED').length;

        if (approvedCount < rejectedCount * 2 || post.community_posts_reviews.length < 2) {
            return NextResponse.json(
                { error: "Conditions de publication non remplies" },
                { status: 400 }
            );
        }

        // Mettre à jour le statut du post
        const publishedPost = await prisma.community_posts.update({
            where: { id: parseInt(postId) },
            data: { status: 'PUBLISHED' }
        });

        return NextResponse.json(publishedPost);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la publication du post" },
            { status: 500 }
        );
    }
} 