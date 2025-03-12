import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;
        console.log("communityId", communityId);
        console.log("postId", postId);

        // Vérifier que l'utilisateur est membre ou créateur
        const isContributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id),
                },
            },
        });

        const community = await prisma.community.findUnique({
            where: { id: parseInt(communityId) },
        });

        if (!isContributor && community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        // Récupérer les enrichissements en attente
        const pendingContributions = await prisma.community_posts_enrichments.findMany({
            where: {
                post_id: parseInt(postId),
                status: "PENDING",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true,
                    },
                },
                community_posts_enrichment_review: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return NextResponse.json(pendingContributions);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des contributions" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 