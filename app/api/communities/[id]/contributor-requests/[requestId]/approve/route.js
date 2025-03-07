import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

const prisma = new PrismaClient();

export async function POST(
    req,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { id, requestId } = await params;
        const communityId = parseInt(id);
        const reqId = parseInt(requestId);

        // Vérifier si l'utilisateur est le créateur de la communauté
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            select: { creator_id: true, name: true }
        });

        if (!community || community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { message: 'Non autorisé' },
                { status: 403 }
            );
        }

        // Récupérer la demande de contribution
        const contributorRequest = await prisma.community_contributors_requests.findUnique({
            where: {
                id: reqId,
                community_id: communityId
            },
            select: {
                requester_id: true
            }
        });

        if (!contributorRequest) {
            return NextResponse.json(
                { message: 'Demande non trouvée' },
                { status: 404 }
            );
        }

        // Mettre à jour la demande et créer le contributeur
        await prisma.$transaction([
            prisma.community_contributors_requests.update({
                where: {
                    id: reqId,
                    community_id: communityId
                },
                data: {
                    status: 'APPROVED',
                    updated_at: new Date()
                }
            }),
            prisma.community_contributors.create({
                data: {
                    community_id: communityId,
                    contributor_id: contributorRequest.requester_id
                }
            })
        ]);

        const userRequesting = await prisma.user.findUnique({
            where: {
                id: contributorRequest.requester_id
            }
        });


        const newData = {
            community: {
                name: community.name,
                role: "Contributor"
            }
        }

        const formData = new FormData();
        formData.append("userAddress", userRequesting.accountAddress);
        formData.append("newValue", JSON.stringify(newData));

        await fetch(`${process.env.API_URL}/api/auth/upload`, {
            method: "PUT",
            body: formData,
        });

        await createBulkNotifications({
            userIds: [contributorRequest.requester_id],
            title: `Demande approuvée`,
            message: `Votre demande de contribution à la communauté ${community.name} a été approuvée`,
            type: NotificationType.CONTRIBUTOR_ACCEPTED,
            link: `/community/${communityId}/`,
            metadata: {
                communityId,
            },
        });

        return NextResponse.json(
            { message: 'Demande approuvée avec succès' },
            { status: 200 }
        );

    } catch (error) {
        console.log('Erreur lors de l\'approbation de la demande:', error.stack);
        return NextResponse.json(
            { message: 'Une erreur est survenue' },
            { status: 500 }
        );
    }
} 