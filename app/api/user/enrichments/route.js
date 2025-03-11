import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer toutes les contributions de l'utilisateur
        const contributions = await prisma.post_contributions.findMany({
            where: {
                user_id: parseInt(session.user.id),
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        community: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                contribution_reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true,
                            },
                        },
                    },
                    orderBy: {
                        created_at: "desc",
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return NextResponse.json(contributions);
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