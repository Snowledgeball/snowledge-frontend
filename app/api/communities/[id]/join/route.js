import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


const prisma = new PrismaClient();

export async function POST(
    request,
    { params }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const membership = await prisma.community_learners.create({
            data: {
                community_id: parseInt(id),
                learner_id: session.user.id,
            }

        });

        return NextResponse.json({ success: true, membership });
    } catch (error) {
        console.log('Erreur lors de l\'adhésion:', error.stack);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );

    }
} 