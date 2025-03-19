import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

        const isContributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(id),
                    contributor_id: parseInt(session.user.id),
                }
            }
        });

        const isCreator = await prisma.community.findUnique({
            where: {
                id: parseInt(id),
                creator_id: parseInt(session.user.id),
            }
        });

        return NextResponse.json({ isMember: !!membership, isContributor: !!isContributor, isCreator: !!isCreator });
    } catch (error) {
        console.log('Erreur lors de la vérification du membership:', error.stack);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 