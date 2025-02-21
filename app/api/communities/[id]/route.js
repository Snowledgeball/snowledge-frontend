import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {

        const { id } = await params;

        const creator = await prisma.community.findFirst({
            where: {
                id: parseInt(id)
            },
            select: {
                user: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });

        const community = await prisma.community.findFirst({
            where: {
                id: parseInt(id)
            },
            include: {
                category: true,
                community_learners: true,
                community_contributors: true,
                community_posts: {
                    orderBy: {
                        created_at: 'desc'
                    }
                },
                community_presentation: true
            }
        });

        if (!community) {
            return NextResponse.json(
                { error: "Communauté non trouvée" },
                { status: 404 }
            );
        }

        const objectToReturn = {
            ...community,
            creator: creator.user
        };

        return NextResponse.json(objectToReturn);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }

}
