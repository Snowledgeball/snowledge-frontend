import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
    const { id } = await params;
    try {
        const body = await request.json();
        const channel = await prisma.community_channels.create({
            data: {
                ...body,
                community_id: parseInt(id)
            }
        });
        return NextResponse.json(channel);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 