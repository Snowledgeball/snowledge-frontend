import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const communityId = parseInt(id);

        // Récupérer les données de la communauté avec les relations

        const community = await prisma.community.findUnique({
            where: {
                id: communityId,
            },
            include: {
                community_learners: true,
                community_posts: {
                    include: {
                        community_posts_comments: true
                    }
                }

            }
        });

        if (!community) {
            return NextResponse.json({ error: "Communauté non trouvée" }, { status: 404 });
        }

        // Calculer les statistiques
        const totalMembers = community.community_learners.length;
        const totalPosts = community.community_posts.length;

        // Calculer le taux d'engagement (nombre total de commentaires / nombre de posts)
        const totalComments = community.community_posts.reduce((acc, post) =>
            acc + (post.comments_count || 0), 0);
        const engagementRate = totalPosts > 0
            ? Math.round((totalComments / totalPosts) * 100)
            : 0;

        // Récupérer l'activité récente
        const recentActivity = community.community_posts.map(post => ({
            id: post.id,
            type: "post",
            text: post.content,
            author_id: post.author_id,
            engagement: post.comments_count || 0,
            time: post.created_at
        })).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 5);

        return NextResponse.json({
            stats: {
                totalMembers,
                membersTrend: "+10%", // À implémenter avec des données réelles
                totalPosts,
                postsTrend: "+5%", // À implémenter avec des données réelles
                engagementRate,
                engagementTrend: "+3%", // À implémenter avec des données réelles
                revenue: "450€", // À implémenter avec des données réelles
                revenueTrend: "+15%" // À implémenter avec des données réelles
            },
            recentActivity,
            community: {
                id: community.id,
                name: community.name,
                description: community.description,
                imageUrl: community.image_url
            }
        });

    } catch (error) {
        console.log("Erreur lors de la récupération des données du tableau de bord:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des données" },
            { status: 500 }

        );
    } finally {
        await prisma.$disconnect();
    }
} 