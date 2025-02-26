import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// DELETE - Supprimer un canal
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, channelId } = await params;

        // Vérifier que l'utilisateur est le créateur de la communauté
        const community = await prisma.community.findUnique({
            where: { id: parseInt(communityId) }
        });

        if (!community || community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Seul le créateur de la communauté peut supprimer des canaux" }, { status: 403 });
        }

        // Vérifier que ce n'est pas un canal par défaut
        const channel = await prisma.community_channels.findUnique({
            where: { id: parseInt(channelId) }
        });

        await prisma.community_channels.delete({
            where: { id: parseInt(channelId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 