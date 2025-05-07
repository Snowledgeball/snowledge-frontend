import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

        const community = await prisma.community.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        const membership = await prisma.community_learners.create({
            data: {
                community_id: parseInt(id),
                learner_id: parseInt(session.user.id),
            }
        });

        const newData = {
            community: {
                name: community.name,
                role: "Learner"
            }
        }

        const formData = new FormData();
        formData.append("userAddress", session.user.address);
        formData.append("newValue", JSON.stringify(newData));

        // await fetch(`${process.env.API_URL}/api/auth/upload`, {
        //     method: "PUT",
        //     body: formData,
        // });

        // On lance le process de modification du SBT sans que ça bloque le processus et on prie pour que ça marche
        fetch(`${process.env.API_URL}/api/auth/upload`, {
            method: "PUT",
            body: formData,
        });

        // Invalider les caches concernés
        // Note: Nous ne pouvons pas appeler directement invalidateCache ici car c'est une fonction côté client
        // Nous allons donc définir des en-têtes de cache pour indiquer que les données sont obsolètes
        const headers = new Headers();
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.append('Pragma', 'no-cache');
        headers.append('Expires', '0');

        // Nous retournons une réponse avec les en-têtes qui indiquent que le cache doit être invalidé
        return NextResponse.json(
            { success: true, membership, cacheInvalidation: true },
            {
                status: 200,
                headers: headers
            }
        );
    } catch (error) {
        console.log('Erreur lors de l\'adhésion:', error.stack);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );

    }
} 