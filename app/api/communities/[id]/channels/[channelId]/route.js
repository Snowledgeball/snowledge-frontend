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

        await prisma.community_channels.delete({
            where: { id: parseInt(channelId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du canal:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id, channelId } = await params;
        const { name, description, icon } = await request.json();

        // Vérifier si l'utilisateur est le créateur de la communauté
        const community = await prisma.community.findUnique({
            where: { id: parseInt(id) },
            select: { creator_id: true }
        });

        if (!community || community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json(
                { error: "Non autorisé à modifier ce canal" },
                { status: 403 }
            );
        }

        // Mettre à jour le canal
        const updatedChannel = await prisma.community_channels.update({
            where: {
                id: parseInt(channelId),
                community_id: parseInt(id)
            },
            data: {
                name,
                description,
                icon
            }
        });

        return NextResponse.json(updatedChannel);
    } catch (error) {
        console.error("Erreur lors de la modification du canal:", error);
        return NextResponse.json(
            { error: "Erreur lors de la modification du canal" },
            { status: 500 }
        );
    }
} 