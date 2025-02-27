import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET - Récupérer toutes les questions d'une communauté
export async function GET(
    request,
    { params }
) {
    try {
        const { id } = await params;
        const questions = await prisma.community_qa_questions.findMany({
            where: {
                community_id: parseInt(id),
                status: 'ACTIVE'
            },
            select: {
                id: true,
                question: true,
                category: true,
                created_at: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true
                    }
                },
                community_qa_answers: {
                    select: {
                        id: true,
                        content: true,
                        created_at: true,
                        is_accepted: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Restructurer la réponse
        const formattedQuestions = questions.map(question => ({
            id: question.id,
            question: question.question,
            category: question.category,
            created_at: question.created_at,
            author: question.user,
            answers: question.community_qa_answers.map(answer => ({
                id: answer.id,
                content: answer.content,
                created_at: answer.created_at,
                is_accepted: answer.is_accepted,
                author: answer.user
            }))
        }));

        return NextResponse.json(formattedQuestions);
    } catch (error) {
        console.log('Erreur lors de la récupération des questions:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Créer une nouvelle question
export async function POST(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { question, category } = body;

        if (!question || !category) {
            return NextResponse.json({ error: 'Question et catégorie requises' }, { status: 400 });
        }

        const newQuestion = await prisma.community_qa_questions.create({
            data: {
                community_id: parseInt(id),
                author_id: parseInt(session.user.id),
                question,
                category,
            },
            select: {
                id: true,
                question: true,
                category: true,
                created_at: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true
                    }
                },
                community_qa_answers: {
                    select: {
                        id: true,
                        content: true,
                        created_at: true,
                        is_accepted: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            }
        });

        const formattedQuestion = {
            id: newQuestion.id,
            question: newQuestion.question,
            category: newQuestion.category,
            created_at: newQuestion.created_at,
            author: newQuestion.user,
            answers: newQuestion.community_qa_answers.map(answer => ({
                id: answer.id,
                content: answer.content,
                created_at: answer.created_at,
                is_accepted: answer.is_accepted,
                author: answer.user
            }))
        };

        return NextResponse.json(formattedQuestion);
    } catch (error) {
        console.log('Erreur lors de la création de la question:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 