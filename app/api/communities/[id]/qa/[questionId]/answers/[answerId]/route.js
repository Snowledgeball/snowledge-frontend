import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Modifier une réponse
export async function PUT(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { answerId } = await params;
        const body = await request.json();
        const { content } = body;

        // Vérifier si l'utilisateur est l'auteur de la réponse
        const answer = await prisma.community_qa_answers.findUnique({
            where: { id: parseInt(answerId) }
        });

        if (!answer || answer.author_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Modification non autorisée" }, { status: 403 });
        }

        const updatedAnswer = await prisma.community_qa_answers.update({
            where: { id: parseInt(answerId) },
            data: { content },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true
                    }
                }
            }
        });

        return NextResponse.json(updatedAnswer);
    } catch (error) {
        console.log('Erreur lors de la modification de la réponse:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Supprimer une réponse
export async function DELETE(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { answerId } = await params;

        // Vérifier si l'utilisateur est l'auteur ou le propriétaire de la communauté
        const answer = await prisma.community_qa_answers.findUnique({
            where: { id: parseInt(answerId) },
            include: {
                community_qa_questions: {
                    include: {
                        community: true
                    }
                }
            }
        });

        if (!answer) {
            return NextResponse.json({ error: "Réponse non trouvée" }, { status: 404 });
        }

        const isOwner = answer.community_qa_questions.community.creator_id === parseInt(session.user.id);
        const isAuthor = answer.author_id === parseInt(session.user.id);

        if (!isOwner && !isAuthor) {
            return NextResponse.json({ error: "Suppression non autorisée" }, { status: 403 });
        }

        await prisma.community_qa_answers.delete({
            where: { id: parseInt(answerId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('Erreur lors de la suppression de la réponse:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 