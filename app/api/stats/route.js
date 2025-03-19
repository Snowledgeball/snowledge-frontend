import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Récupérer toutes les stats en parallèle pour de meilleures performances
        const [
            totalCommunities,
            totalMembers,
            totalContributions,
            totalPosts
        ] = await Promise.all([
            prisma.community.count(),
            prisma.community_learners.count(),
            prisma.community_posts_enrichments.count(),
            prisma.community_posts.count()
        ]);

        // Calculer le taux d'engagement (enrichissements par post)
        const engagementRate = totalPosts > 0
            ? (totalContributions / totalPosts).toFixed(2)
            : 0;

        const response = {
            stats: {
                communities: {
                    total: totalCommunities,
                    label: "Communautés actives",
                    description: "Nombre total de communautés créées"
                },
                members: {
                    total: totalMembers,
                    label: "Membres actifs",
                    description: "Nombre total de membres dans toutes les communautés"
                },
                enrichments: {
                    total: totalContributions,
                    label: "Enrichissements",
                    description: "Nombre total d'enrichissements créés"
                },
                engagement: {
                    rate: engagementRate,
                    posts: totalPosts,
                    description: "Moyenne d'enrichissements par post"
                }
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des statistiques" },
            { status: 500 }
        );
    }
} 