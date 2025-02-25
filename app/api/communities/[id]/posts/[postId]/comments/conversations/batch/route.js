import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Récupérer plusieurs conversations
export async function POST(request, { params }) {
    try {
        const { conversationUids } = await request.json();

        const conversations = await prisma.community_posts_comment_conversations.findMany({
            where: {
                id: {
                    in: conversationUids.map(id => parseInt(id))
                }
            },
            include: {
                community_posts_comments: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const conversationsMap = conversations.reduce((acc, conversation) => {
            acc[conversation.id] = {
                uid: conversation.id.toString(),
                comments: conversation.community_posts_comments.map(comment => ({
                    uid: comment.id.toString(),
                    author: comment.author_id.toString(),
                    authorName: comment.user.fullName,
                    authorAvatar: comment.user.profilePicture,
                    content: comment.content,
                    createdAt: comment.created_at.toISOString()
                }))
            };
            return acc;
        }, {});

        return NextResponse.json({ conversations: conversationsMap });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des conversations" },
            { status: 500 }
        );
    }
} 