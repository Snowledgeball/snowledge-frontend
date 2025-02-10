import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const userId = parseInt(id);
        // Récupérer les communautés où l'utilisateur est contributeur
        const contributorCommunities = await prisma.community_contributors.findMany({
            where: {
                contributor_id: userId,
            },

            select: {
                added_at: true,
                community: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Récupérer les IDs des communautés où l'utilisateur est déjà contributeur
        const contributorCommunityIds = contributorCommunities.map(cc => cc.community.id);

        // Récupérer les communautés où l'utilisateur est apprenant, en excluant celles où il est déjà contributeur
        const learnerCommunities = await prisma.community_learners.findMany({
            where: {
                learner_id: userId,
                community: {
                    id: {
                        notIn: contributorCommunityIds
                    }
                }
            },
            select: {
                joined_at: true,
                community: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Formater les données
        const formattedCommunities = [
            ...contributorCommunities.map(membership => ({
                id: membership.community.id,
                name: membership.community.name,
                role: 'contributor',
                createdAt: new Date(membership.added_at).toLocaleDateString('fr-FR')
            })),
            ...learnerCommunities.map(membership => ({
                id: membership.community.id,
                name: membership.community.name,
                role: 'learner',
                createdAt: new Date(membership.joined_at).toLocaleDateString('fr-FR')
            }))
        ];

        return NextResponse.json({ communities: formattedCommunities });

    } catch (error) {
        console.log('Erreur serveur:', error.stack);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
