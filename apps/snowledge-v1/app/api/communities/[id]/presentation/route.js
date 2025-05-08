import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request,
    { params }
) {
    try {
        const { id } = await params;
        const presentation = await prisma.community_presentation.findUnique({

            where: {
                community_id: parseInt(id)
            }

        });

        if (!presentation) {
            return NextResponse.json(
                { error: 'Présentation non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json(presentation);
    } catch (error) {
        console.log('Erreur lors de la récupération de la présentation:', error.stack);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
} 