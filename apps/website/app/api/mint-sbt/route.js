import { mintSBT } from '@/utils/mintSBT';

export async function POST(request) {
    const { recipient, uri } = await request.json();

    try {
        const result = await mintSBT(recipient, uri);
        return Response.json({ success: true, hash: result.transaction_hash });
    } catch (error) {
        return Response.json({ error: "Erreur lors du mint" }, { status: 500 });
    }
} 