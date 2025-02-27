import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();


// Récupère toutes les conversations
export async function GET(request, { params }) {
    try {
        const { postId } = await params;

        const conversations = await prisma.community_posts_comment_conversations.findMany({
            where: {
                post_id: parseInt(postId)
            },
            include: {
                community_posts_comments: {
                    include: { user: true }
                }
            }
        });

        return NextResponse.json({
            conversations: conversations.reduce((acc, conv) => ({
                ...acc,
                [conv.id]: {
                    uid: conv.id.toString(),
                    comments: conv.community_posts_comments.map(comment => ({
                        uid: comment.id.toString(),
                        author: comment.author_id.toString(),
                        authorName: comment.user.fullName,
                        authorAvatar: comment.user.profilePicture,
                        content: comment.content,
                        createdAt: comment.created_at.toISOString(),
                        modifiedAt: comment.modified_at?.toISOString() || comment.created_at.toISOString()
                    }))
                }
            }), {})
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des conversations" },
            { status: 500 }
        );
    }
}

// Créer une nouvelle conversation
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { content } = await request.json();
        const { postId } = await params;

        // Créer la conversation et le premier commentaire
        const conversation = await prisma.community_posts_comment_conversations.create({
            data: {
                post_id: parseInt(postId),
                community_posts_comments: {
                    create: {
                        author_id: parseInt(session.user.id),
                        content: content
                    }
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

        return NextResponse.json({
            conversationUid: conversation.id.toString(),
            comments: conversation.community_posts_comments.map(comment => ({
                uid: comment.id.toString(),
                content: comment.content,
                author: comment.author_id.toString(),
                authorName: comment.user.fullName,
                authorAvatar: comment.user.profilePicture,
                createdAt: comment.created_at.toISOString()
            }))
        });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la création de la conversation" },
            { status: 500 }
        );
    }
}

// Ajouter la méthode DELETE pour supprimer toutes les conversations
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;

        // Vérifier que l'utilisateur est créateur ou contributeur
        const isAuthorized = await prisma.community.findFirst({
            where: {
                id: parseInt(communityId),
                OR: [
                    { creator_id: parseInt(session.user.id) },
                    {
                        community_contributors: {
                            some: { contributor_id: parseInt(session.user.id) }
                        }
                    }
                ]
            }
        });

        if (!isAuthorized) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        await prisma.community_posts_comment_conversations.deleteMany({
            where: { post_id: parseInt(postId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression des conversations" },
            { status: 500 }
        );
    }
} 