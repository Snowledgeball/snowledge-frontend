import { pinata } from "../../../../utils/config"
import { NextResponse } from "next/server"
import { Provider, Account, Contract } from "starknet";
import { abiSBT, addressSBT } from "../../../../utils/abi";

export async function POST(request) {
    try {
        const data = await request.formData();

        const fullName = data.get("fullName");
        const name = (fullName + "'s" + " DID").trim();
        const description = "Decentralized Identity of " + fullName;
        const image = data.get("image");
        const userName = data.get("userName");
        const email = data.get("email");
        const accountAddress = data.get("accountAddress");

        // Create metadata
        const metadata = {
            name,
            description,
            image,
            fullName,
            userName,
            email,
            accountAddress,
        };

        const metadataUploadData = await pinata.upload.json(metadata);
        const metadataUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadataUploadData.IpfsHash}`;

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


        // TODO: A refaire, c'est pas propre (peut etre créer une liste a u premier ajout et la modifier a chaque fois)
        //Si file.community existe (au moins 1 communauté deja ajoutée)
        if (file.community) {
            console.log("1")
            //Si la newValue.community.name existe déjà dans file.community et que file.community est un tableau (au moins 2 communautés deja ajoutées), on remplace la valeur de role
            if (!Array.isArray(file.community) && file.community.name === newValue.community.name) {
                console.log("2")
                file.community.role = newValue.community.role;
                newValue.community = file.community;
            }
            else {
                if (Array.isArray(file.community) && file.community.find(community => community.name === newValue.community.name)) {
                    console.log("3")
                    file.community.find(community => community.name === newValue.community.name).role = newValue.community.role;
                    newValue.community = file.community;
                }
                //Si file.community n'est pas un tableau (au moins 1 communauté deja ajoutée) et que la newValue.community.name n'existe pas dans file.community, on remplace la valeur de role
                else {
                    console.log("4")
                    const existingCommunities = Array.isArray(file.community) ? file.community : [file.community];
                    // On ajoute la nouvelle communauté au tableau existant
                    newValue.community = [
                        ...existingCommunities,
                        {
                            name: newValue.community.name,
                            role: newValue.community.role
                        }
                    ];
                }
            }
        }

        console.log("5");
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

