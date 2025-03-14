import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Promouvoir un membre en contributeur
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, memberId } = await params;

        // Vérifier que l'utilisateur est le créateur de la communauté
        const community = await prisma.community.findUnique({
            where: { id: parseInt(communityId) }
        });

        if (community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        // Ajouter comme contributeur
        await prisma.community_contributors.create({
            data: {
                community_id: parseInt(communityId),
                contributor_id: parseInt(memberId)
            }
        });

        // Pour le moment, on dit qu'un contributeur est un apprenant
        // // Supprimer de la liste des apprenants
        // await prisma.community_learners.delete({
        //     where: {
        //         community_id_learner_id: {
        //             community_id: parseInt(communityId),
        //             learner_id: parseInt(memberId)
        //         }
        //     }
        // });

        return NextResponse.json({ message: "Membre promu en contributeur" });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la promotion du membre" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
