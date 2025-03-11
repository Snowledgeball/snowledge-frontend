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

        const { id: communityId } = await params;



        // Vérifier que l'utilisateur est contributeur
        const membership = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id),
                },
            },
        });

        const community = await prisma.community.findUnique({
            where: { id: parseInt(communityId) },
            select: { creator_id: true },
        });

        if (!membership && community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Vous n'êtes pas membre de cette communauté" },
                { status: 403 }
            );
        }

        // Récupérer les posts publiés qui ont des contributions en attente
        const postsWithPendingContributions = await prisma.community_posts.findMany({
            where: {
                community_id: parseInt(communityId),
                status: "PUBLISHED",
                community_posts_contributions: {
                    some: {
                        status: "PENDING"
                    }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true,
                    },
                },
                community_posts_contributions: {
                    where: {
                        status: "PENDING"
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true,
                            },
                        },
                        community_posts_contribution_reviews: {
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
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return NextResponse.json(postsWithPendingContributions);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des posts" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 