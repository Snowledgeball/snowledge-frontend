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

        return NextResponse.json({ success: true, membership });
    } catch (error) {
        console.log('Erreur lors de l\'adhésion:', error.stack);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );

    }
} 