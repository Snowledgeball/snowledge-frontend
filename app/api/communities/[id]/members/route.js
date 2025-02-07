import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request,
    { params }

) {
    try {
        const { id } = await params;
        const communityId = parseInt(id);


        // Récupérer les contributeurs
        const contributors = await prisma.community_contributors.findMany({
            where: {
                community_id: communityId
            },
            include: {
                community: true
            }
        });

        console.log("contributors", contributors);

        // Récupérer les apprenants
        const learners = await prisma.community_learners.findMany({
            where: {
                community_id: communityId
            },
            include: {
                community: true
            }
        });

        // Récupérer les informations des utilisateurs
        const contributorIds = contributors.map(c => c.contributor_id);
        const learnerIds = learners.map(l => l.learner_id);
        const allUserIds = [...new Set([...contributorIds, ...learnerIds])];

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: allUserIds
                }
            },
            select: {
                id: true,
                fullName: true,
                userName: true,
                profilePicture: true,
            }
        });

        // Construire la réponse
        const members = users.map(user => {
            const isContributor = contributorIds.includes(user.id);
            const memberData = isContributor
                ? contributors.find(c => c.contributor_id === user.id)
                : learners.find(l => l.learner_id === user.id);

            return {
                id: user.id,
                fullName: user.fullName,
                userName: user.userName,
                profilePicture: user.profilePicture,
                status: isContributor ? 'Contributeur' : 'Apprenant',
                joinedAt: isContributor
                    ? memberData?.added_at
                    : memberData?.joined_at,
                // Ces valeurs devraient être calculées à partir d'autres tables
                revisions: 0,
                posts: 0,
                gains: 0
            };
        });

        return NextResponse.json(members);

    } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des membres' },
            { status: 500 }
        );
    }
} 