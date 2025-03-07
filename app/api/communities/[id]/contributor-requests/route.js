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

        const { justification, expertiseDomain } = await req.json();
        const { id } = await params;
        const communityId = parseInt(id);


        if (!justification || !expertiseDomain) {
            return NextResponse.json(
                { message: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        // Vérifier si la communauté existe
        const community = await prisma.community.findUnique({
            where: { id: communityId },
        });

        if (!community) {
            return NextResponse.json(
                { message: 'Communauté non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier si une demande existe déjà
        const existingRequest = await prisma.community_contributors_requests.findUnique({
            where: {
                community_id_requester_id: {
                    community_id: communityId,
                    requester_id: parseInt(session.user.id),
                },
            },

        });


        if (existingRequest) {
            return NextResponse.json(
                { message: 'Une demande est déjà en cours pour cette communauté' },
                { status: 400 }
            );
        }

        // Créer la demande
        await prisma.community_contributors_requests.create({
            data: {
                community_id: communityId,
                requester_id: parseInt(session.user.id),
                justification,
                expertise_domain: expertiseDomain,
                status: 'PENDING',

            },
        });

        //Notifier le créateur de la communauté 
        await createBulkNotifications({
            userIds: [parseInt(community.creator_id)],
            title: `Nouvelle demande pour devenir contributeur`,
            message: ` ${session.user.userName} souhaite devenir contributeur de la communauté ${community.name}`,
            type: NotificationType.CONTRIBUTOR_REQUEST,
            link: `/community/${communityId}/dashboard?tab=members`,
            metadata: {
                communityId,
                tab: "members"
            },
        });

        return NextResponse.json(
            { message: 'Demande envoyée avec succès' },
            { status: 201 }
        );

    } catch (error) {
        console.log('Erreur lors de la création de la demande:', error.stack);
        return NextResponse.json(
            { message: 'Une erreur est survenue lors du traitement de votre demande' },
            { status: 500 }
        );
    }

}

export async function GET(
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

        const { id } = await params;
        const communityId = parseInt(id);

        // Vérifier si l'utilisateur est le créateur de la communauté
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            select: { creator_id: true }
        });

        if (!community || community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { message: 'Non autorisé' },
                { status: 403 }
            );
        }

        const requests = await prisma.community_contributors_requests.findMany({
            where: {
                community_id: communityId,
                status: 'PENDING'
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Récupérer les IDs des contributeurs
        const requesterIds = requests.map(request => request.requester_id);


        // Récupérer les informations des utilisateurs séparément
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: requesterIds
                }
            },

            select: {
                id: true,
                fullName: true,
                profilePicture: true,
                userName: true
            }
        });

        // Créer un map pour un accès rapide aux données utilisateur
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});

        const formattedRequests = requests.map(request => ({
            id: request.id,
            userId: request.requester_id,
            userName: userMap[request.requester_id]?.userName,
            userAvatar: userMap[request.requester_id]?.profilePicture,
            justification: request.justification,
            expertiseDomain: request.expertise_domain,

            status: request.status.toLowerCase(),
            createdAt: request.created_at.toISOString()
        }));

        return NextResponse.json({ requests: formattedRequests });

    } catch (error) {
        console.log('Erreur lors de la récupération des demandes:', error.stack);
        return NextResponse.json(
            { message: 'Une erreur est survenue' },
            { status: 500 }
        );
    }

} 