import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET - Récupérer tous les canaux d'une communauté
export async function GET(
    request,
    { params }
) {
    const { id } = await params;
    try {
        const channels = await prisma.community_channels.findMany({
            where: {
                community_id: parseInt(id)
            },
            orderBy: {
                created_at: 'asc'
            }
        });
        return NextResponse.json(channels);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Créer un nouveau canal
export async function POST(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const communityId = parseInt(id);

        // Vérifier que l'utilisateur est le créateur de la communauté
        const community = await prisma.community.findUnique({
            where: { id: communityId }
        });

        if (!community || community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Seul le créateur de la communauté peut créer des canaux" }, { status: 403 });
        }

        const body = await request.json();
        const channel = await prisma.community_channels.create({
            data: {
                ...body,
                community_id: communityId
            }
        });
        return NextResponse.json(channel);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 