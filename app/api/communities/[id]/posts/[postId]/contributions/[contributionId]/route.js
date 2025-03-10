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

        const { id: communityId, postId, contributionId } = await params;

        // Récupérer la contribution
        const contribution = await prisma.community_posts_contributions.findUnique({
            where: {
                id: parseInt(contributionId),
                post_id: parseInt(postId),
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
        });

        if (!contribution) {
            return NextResponse.json({ error: "Contribution non trouvée" }, { status: 404 });
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