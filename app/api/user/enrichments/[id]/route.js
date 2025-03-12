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

        const { id } = await params;

        console.log("la5");
        // Récupérer la contribution spécifique
        const contribution = await prisma.community_posts_enrichments.findUnique({
            where: {
                id: parseInt(id),
                user_id: parseInt(session.user.id), // S'assurer que l'utilisateur est bien l'auteur
            },
            include: {
                community_posts: {
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
                community_posts_enrichment_reviews: {
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
        });

        if (!contribution) {
            return NextResponse.json(
                { error: "Contribution non trouvée ou vous n'êtes pas autorisé à y accéder" },
                { status: 404 }
            );
        }

        return NextResponse.json(contribution);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de la contribution" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 