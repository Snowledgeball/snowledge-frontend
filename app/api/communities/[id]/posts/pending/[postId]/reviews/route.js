import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Ajouter une review
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;
        const { content, status } = await request.json();

        // Vérifier que l'utilisateur est contributeur
        const isContributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id)
                }
            }
        });

        if (!isContributor) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        // Vérifier que l'utilisateur n'est pas l'auteur du post
        const post = await prisma.community_posts.findUnique({
            where: { id: parseInt(postId) }
        });

        if (post.author_id === parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas réviser votre propre post" },
                { status: 403 }
            );
        }

        const review = await prisma.community_posts_reviews.create({
            data: {
                post_id: parseInt(postId),
                reviewer_id: parseInt(session.user.id),
                content,
                status
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de l'ajout de la review" },
            { status: 500 }
        );
    }
} 