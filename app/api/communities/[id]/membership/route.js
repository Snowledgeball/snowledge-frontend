import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


const prisma = new PrismaClient();


export async function GET(
    request,
    { params }

) {
    try {

        const { id } = await params;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ isMember: false });
        }

        const membership = await prisma.community_learners.findUnique({
            where: {
                community_id_learner_id: {
                    community_id: parseInt(id),
                    learner_id: parseInt(session.user.id),
                }
            }
        });


        return NextResponse.json({ isMember: !!membership });
    } catch (error) {
        console.log('Erreur lors de la vérification du membership:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 