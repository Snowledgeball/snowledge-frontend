import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
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

        // Marquer la conversation comme résolue
        await prisma.community_posts_comment_conversations.update({
            where: { id: parseInt(conversationId) },
            data: { resolved: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la résolution de la conversation" },
            { status: 500 }
        );
    }
} 