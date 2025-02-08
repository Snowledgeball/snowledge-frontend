import { pinata } from "../../../../utils/config"
import { NextResponse } from "next/server"
import { Provider, Account, Contract } from "starknet";
import { abiSBT, addressSBT } from "../../../../utils/abi";




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
        const metadataUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadataUploadData.IpfsHash}`;


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

// PUT route pour modifier les informations de l'utilisateur
export async function PUT(request) {
    const data = await request.formData();

    const NODE_URL = process.env.NEXT_PUBLIC_STARKNET_NODE_URL;
    const FUNDER_PRIVATE_KEY = process.env.NEXT_PUBLIC_FUNDER_PRIVATE_KEY;
    const FUNDER_ADDRESS = process.env.NEXT_PUBLIC_FUNDER_ADDRESS;
    const provider = new Provider({ nodeUrl: NODE_URL });
    const funderAccount = new Account(provider, FUNDER_ADDRESS, FUNDER_PRIVATE_KEY);
    const contract = new Contract(
        abiSBT,
        addressSBT,
        funderAccount
    );


    try {
        // TODO: change to the user address
        const userAddress = data.get("userAddress");
        const txResponse = await contract.call("get_token_uri_by_address", [userAddress]);

        const parts = txResponse.split('/ipfs/');
        const MetadataHash = parts[1];
        console.log("MetadataHash :", MetadataHash);
        const file = (await pinata.gateways.get(MetadataHash)).data;
        const newValue = JSON.parse(data.get("newValue"));

        const unpin = await pinata.unpin([MetadataHash]);
        console.log("unpinata :", unpin);

        const newMetadata = {
            ...file,
            ...newValue
        }
        const newMetadataUploadData = await pinata.upload.json(newMetadata);
        const newMetadataUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${newMetadataUploadData.IpfsHash}`;
        console.log("newMetadata :", newMetadata);
        console.log("newMetadataUploadData :", newMetadataUploadData);
        console.log("newMetadataUrl :", newMetadataUrl);

        const estimatedFee = await contract.estimate("set_token_uri_by_address", [userAddress, newMetadataUrl]);
        const txResponseSetUri = await contract.invoke("set_token_uri_by_address", [userAddress, newMetadataUrl], {
            maxFee: estimatedFee.overall_fee * BigInt(2)
        });

        console.log("old hash :", MetadataHash);
        console.log("new hash :", newMetadataUploadData.IpfsHash);

        return NextResponse.json(
            { message: "Metadata updated successfully", txResponseSetUri },
            { status: 200 }
        );
    }
    catch (e) {
        console.error("Upload failed:", e);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

