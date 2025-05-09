import { NextResponse } from 'next/server';
import { pinata } from '../../../utils/config';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier n\'a été fourni' },
                { status: 400 }
            );
        }

        // Convertir le fichier en Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Créer un File à partir du buffer
        const fileObject = new File([buffer], file.name, { type: file.type });

        // Options pour Pinata
        const options = {
            pinataMetadata: {
                name: file.name,
                keyvalues: {
                    type: 'community-image'
                }
            },
            pinataOptions: {
                cidVersion: 1
            }
        };

        // Upload via SDK Pinata avec upload.file
        const result = await pinata.upload.file(fileObject, options);

        const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${result.IpfsHash}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        return NextResponse.json(
            { error: 'Erreur lors du traitement de l\'image' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}; 