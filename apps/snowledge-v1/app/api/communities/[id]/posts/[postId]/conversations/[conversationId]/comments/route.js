import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Ajouter un commentaire à une conversation
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { content } = await request.json();
        const { conversationId } = await params;

        const comment = await prisma.community_posts_comments.create({
            data: {
                conversation_id: parseInt(conversationId),
                author_id: parseInt(session.user.id),
                content: content
            },
            include: {
                user: true
            }
        });

        return NextResponse.json({
            commentUid: comment.id.toString(),
            content: comment.content,
            author: comment.author_id.toString(),
            authorName: comment.user.fullName,
            authorAvatar: comment.user.profilePicture,
            createdAt: comment.created_at.toISOString()
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'ajout du commentaire" },
            { status: 500 }
        );
    }
} 