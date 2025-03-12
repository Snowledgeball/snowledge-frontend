import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * Récupère tous les posts créés par un utilisateur spécifique
 * @param {Request} request - La requête HTTP
 * @param {Object} params - Les paramètres de la route, contenant l'ID de l'utilisateur
 * @returns {Promise<NextResponse>} - Réponse contenant les posts de l'utilisateur
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Récupérer tous les posts créés par l'utilisateur
        const posts = await prisma.community_posts.findMany({
            where: {
                author_id: userId,
                status: "PUBLISHED"
            },
            include: {
                community: {
                    select: {
                        id: true,
                        name: true,
                        image_url: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        });

        // Ajouter des en-têtes de cache
        const headers = new Headers();
        headers.append("Cache-Control", "max-age=300, s-maxage=300");

        // S'assurer que nous renvoyons toujours un tableau, même vide
        return NextResponse.json(
            { posts: posts || [] },
            {
                status: 200,
                headers
            }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error.stack);
        return NextResponse.json(
            { error: "Erreur serveur", posts: [] },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
