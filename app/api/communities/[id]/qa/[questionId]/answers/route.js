import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// POST - Créer une nouvelle réponse
export async function POST(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id, questionId } = await params;
        const communityId = parseInt(id);

        // Vérifier si l'utilisateur est contributeur ou créateur
        const isContributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: communityId,
                    contributor_id: parseInt(session.user.id)
                }
            }
        });

        const community = await prisma.community.findUnique({
            where: { id: communityId }
        });

        if (!isContributor && community?.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { error: 'Seuls les contributeurs peuvent répondre aux questions' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Contenu requis' }, { status: 400 });
        }

        const newAnswer = await prisma.community_qa_answers.create({
            data: {
                question_id: parseInt(questionId),
                author_id: parseInt(session.user.id),
                content,
            },
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

        return NextResponse.json(newAnswer);
    } catch (error) {
        console.log('Erreur lors de la création de la réponse:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 