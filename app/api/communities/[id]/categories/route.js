import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
    request,
    { params }
) {
    try {
        const categories = await prisma.community_posts_category.findMany({
            where: {
                community_id: parseInt(params.id)
            },
            orderBy: {
                label: 'asc'
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la récupération des catégories" },
            { status: 500 }
        );
    }
}

export async function POST(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { name, label } = await request.json();

        // Vérifier si l'utilisateur est créateur ou contributeur
        const community = await prisma.community.findFirst({
            where: {
                id: parseInt(params.id),
                OR: [
                    { creator_id: parseInt(session.user.id) },
                    {
                        community_contributors: {
                            some: { contributor_id: parseInt(session.user.id) }
                        }
                    }
                ]
            }
        });

        if (!community) {
            return NextResponse.json(
                { error: "Non autorisé à créer des catégories" },
                { status: 403 }
            );
        }

        const category = await prisma.community_posts_category.create({
            data: {
                community_id: parseInt(params.id),
                name,
                label
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la création de la catégorie" },
            { status: 500 }
        );
    }
} 