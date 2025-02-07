import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request,
    { params }

) {
    try {
        // Récupérer l'utilisateur

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Récupérer le nombre de communautés où l'utilisateur est membre
        const communitiesCount = await prisma.community_learners.count({
            where: {
                learner_id: parseInt(id)
            }
        });


        // Récupérer le nombre de posts de l'utilisateur
        const postsCount = await prisma.community_posts.count({
            where: {
                author_id: parseInt(id)
            }
        });


        // Récupérer le nombre de contributions (commentaires)
        const contributionsCount = await prisma.community_posts_comments.count({
            where: {
                author_id: parseInt(id)
            }
        });


        // Calculer la date d'inscription (à partir de la première communauté rejointe)
        const firstJoin = await prisma.community_learners.findFirst({
            where: {
                learner_id: parseInt(id)
            },
            orderBy: {
                joined_at: 'asc'
            }

        });

        const memberSince = firstJoin?.joined_at
            ? new Date(firstJoin.joined_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long'
            })
            : "N/A";

        // Calculer le niveau en fonction du nombre de contributions total
        const totalContributions = postsCount + contributionsCount;
        const level = Math.floor(Math.sqrt(totalContributions) + 1);

        // Pour l'instant, les gains sont fictifs - à implémenter selon votre logique métier
        const totalEarnings = 0;

        const userData = {
            username: user.userName,
            fullName: user.fullName,
            level: level,
            memberSince: memberSince,
            avatar: user.profilePicture,
            email: user.email,
            stats: {
                communitiesCount,
                postsCount,
                contributionsCount,
                totalEarnings
            }
        };

        return NextResponse.json(userData);

    } catch (error) {
        console.log("Erreur lors de la récupération des données utilisateur:", error.stack
        );
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}