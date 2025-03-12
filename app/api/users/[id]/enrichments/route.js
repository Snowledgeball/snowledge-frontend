import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// /**
//  * Récupère tous les enrichissements créés par un utilisateur spécifique
//  * @param {Request} request - La requête HTTP
//  * @param {Object} params - Les paramètres de la route, contenant l'ID de l'utilisateur
//  * @returns {Promise<NextResponse>} - Réponse contenant les enrichissements de l'utilisateur
//  */
export async function GET(request, { params }) {
    console.log("GET request received");
    try {

        console.log("GET request received 2");
        const { id } = await params;
        const userId = parseInt(id);

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            console.log("Utilisateur non trouvé");
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Récupérer tous les enrichissements créés par l'utilisateur
        const enrichments = await prisma.community_posts_enrichments.findMany({
            where: {
                user_id: userId
            },
            include: {
                community_posts: {
                    select: {
                        id: true,
                        title: true,
                        community_id: true,
                        community: {
                            select: {
                                id: true,
                                name: true,
                                image_url: true
                            }
                        }
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

        return NextResponse.json(
            { enrichments: enrichments || [] },
            {
                status: 200,
                headers
            }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des enrichissements:", error.stack);
        return NextResponse.json(
            { error: "Erreur serveur", enrichments: [] },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 