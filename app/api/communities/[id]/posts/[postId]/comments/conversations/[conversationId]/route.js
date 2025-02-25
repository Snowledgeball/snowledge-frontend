import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Supprimer une conversation
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { conversationId } = await params;

        // Vérifier que l'utilisateur est l'auteur du premier commentaire
        const conversation = await prisma.community_posts_comment_conversations.findUnique({
            where: { id: parseInt(conversationId) },
            include: {
                community_posts_comments: {
                    orderBy: { created_at: 'asc' },
                    take: 1
                }
            }
        });

        if (!conversation || conversation.community_posts_comments[0].author_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        await prisma.community_posts_comment_conversations.delete({
            where: { id: parseInt(conversationId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression de la conversation" },
            { status: 500 }
        );
    }
}

// Récupérer une conversation spécifique
export async function GET(request, { params }) {
    try {
        const { conversationId } = await params;

        console.log("conversationId", conversationId);

        // Vérifier si l'ID est temporaire
        if (conversationId.startsWith('tmp_')) {
            return NextResponse.json({
                comments: [] // Retourner un tableau vide pour les conversations temporaires
            });
        }

        const conversation = await prisma.community_posts_comment_conversations.findUnique({
            where: { id: parseInt(conversationId) },
            include: {
                community_posts_comments: {
                    include: {
                        user: true
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation non trouvée" }, { status: 404 });
        }

        const obj = {
            comments: conversation.community_posts_comments.map(comment => ({
                uid: comment.id.toString(),
                author: comment.author_id.toString(),
                authorName: comment.user.fullName,
                authorAvatar: comment.user.profilePicture,
                content: comment.content,
                createdAt: comment.created_at.toISOString(),
                modifiedAt: comment.modified_at?.toISOString() || comment.created_at.toISOString()
            }))
        };

        console.log("obj", obj);

        return NextResponse.json(obj);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de la conversation" },
            { status: 500 }
        );
    }
} 