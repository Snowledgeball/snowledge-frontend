import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// PUT - Modifier une question
export async function PUT(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { questionId } = await params;
        const body = await request.json();
        const { question, category } = body;

        // Vérifier si la question existe et appartient à l'utilisateur
        const existingQuestion = await prisma.community_qa_questions.findUnique({
            where: { id: parseInt(questionId) },
            include: { community_qa_answers: true }
        });

        if (!existingQuestion) {
            return NextResponse.json({ error: "Question non trouvée" }, { status: 404 });
        }

        // Vérifier si l'utilisateur est l'auteur et qu'il n'y a pas de réponses
        if (existingQuestion.author_id !== parseInt(session.user.id) || existingQuestion.community_qa_answers.length > 0) {
            return NextResponse.json({ error: "Modification non autorisée" }, { status: 403 });
        }

        const updatedQuestion = await prisma.community_qa_questions.update({
            where: { id: parseInt(questionId) },
            data: { question, category },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true
                    }
                },
                community_qa_answers: true
            }
        });

        return NextResponse.json(updatedQuestion);
    } catch (error) {
        console.log('Erreur lors de la modification de la question:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Supprimer une question
export async function DELETE(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { questionId } = await params;

        // Vérifier si l'utilisateur est l'auteur ou le propriétaire de la communauté
        const question = await prisma.community_qa_questions.findUnique({
            where: { id: parseInt(questionId) },
            include: {
                community_qa_answers: true,
                community: true
            }
        });

        if (!question) {
            return NextResponse.json({ error: "Question non trouvée" }, { status: 404 });
        }

        const isOwner = question.community.creator_id === parseInt(session.user.id);
        const isAuthor = question.author_id === parseInt(session.user.id);

        if (!isOwner && (!isAuthor || question.community_qa_answers.length > 0)) {
            return NextResponse.json({ error: "Suppression non autorisée" }, { status: 403 });
        }

        await prisma.community_qa_questions.delete({
            where: { id: parseInt(questionId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('Erreur lors de la suppression de la question:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 