import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Récupérer tous les posts en attente d'une communauté
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId } = await params;

        const pendingPosts = await prisma.community_posts.findMany({
            where: {
                community_id: parseInt(communityId),
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true
                    }
                },
                community_posts_reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(pendingPosts);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des posts" },
            { status: 500 }
        );
    }
}

// Créer un nouveau post en attente
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId } = await params;
        const { title, content, cover_image_url, tag, accept_contributions } = await request.json();

        // Vérifier que l'utilisateur est contributeur
        const isContributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id)
                }
            }
        });

        if (!isContributor) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        const post = await prisma.community_posts.create({
            data: {
                community_id: parseInt(communityId),
                author_id: parseInt(session.user.id),
                title,
                content,
                cover_image_url,
                tag,
                accept_contributions,
                status: 'PENDING' // Le post est créé avec le statut PENDING
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la création du post" },
            { status: 500 }
        );
    }
} 