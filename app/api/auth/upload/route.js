import { pinata } from "../../../../utils/config"
import { NextResponse } from "next/server"


export async function POST(request) {
    try {
        const data = await request.formData();

        const fullName = data.get("fullName");
        const userName = data.get("userName");
        const email = data.get("email");
        const accountAddress = data.get("accountAddress");

        // Create metadata
        const metadata = {
            fullName,
            userName,
            email,
            accountAddress,
            // image: imageUrl,
            // role
            // community
        };

        const metadataUploadData = await pinata.upload.json(metadata);
        const metadataUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/${metadataUploadData.IpfsHash}`;

        return NextResponse.json(
            { metadataUrl },
            { status: 200 }
        );
    } catch (e) {
        console.error("Upload failed:", e);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
