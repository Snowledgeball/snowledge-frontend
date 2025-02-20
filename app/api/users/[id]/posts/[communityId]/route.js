import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const { id, communityId } = await params;
        const userId = parseInt(id);
        const parsedCommunityId = parseInt(communityId);

        const posts = await prisma.community_posts.findMany({
            where: {
                community_id: parsedCommunityId,
                author_id: userId
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.log("Erreur lors de la récupération des posts:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des posts" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 