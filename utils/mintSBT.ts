import { Provider, Account, Contract, ByteArray, num } from "starknet";
import { splitStringToFeltArray } from "./splitString";
import { serializeByteArray } from "./serialize";
import { byteArrayFromString, stringFromByteArray } from "./byteArrayFromString";
import { abiSBT } from "./abi";

export const mintSBT = async (recipient: any, uri: any) => {
    const NETWORK = process.env.NEXT_PUBLIC_STARKNET_NETWORK;
    const NODE_URL = process.env.NEXT_PUBLIC_STARKNET_NODE_URL;
    const SBT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS;
    const FUNDER_PRIVATE_KEY = process.env.NEXT_PUBLIC_FUNDER_PRIVATE_KEY;
    const FUNDER_ADDRESS = process.env.NEXT_PUBLIC_FUNDER_ADDRESS;

    if (!FUNDER_ADDRESS || !FUNDER_PRIVATE_KEY) {
        throw new Error("Missing funder credentials");
    }

    const provider = new Provider({ nodeUrl: NODE_URL });
    const funderAccount = new Account(provider, FUNDER_ADDRESS, FUNDER_PRIVATE_KEY);
    const contract = new Contract(
        abiSBT,
        SBT_CONTRACT_ADDRESS as string,
        funderAccount
    );


    try {
        // Utiliser la fonction serializeByteArray existante

        const myByteArray: ByteArray = byteArrayFromString(uri);

        console.log("myByteArray (JSON):", JSON.stringify(myByteArray, null, 2));

        const formattedUri = {
            data: myByteArray.data.map((felt) => BigInt(felt)), // Convertir chaque élément en BigInt
            pending_word: BigInt(myByteArray.pending_word), // Convertir en BigInt
            pending_word_len: Number(myByteArray.pending_word_len) // S'assurer que c'est un nombre
        };

        // Vérification du format avant l'envoi
        console.log("formattedUri (avant envoi):", formattedUri);
        console.log("Type de data:", typeof formattedUri.data, formattedUri.data);
        console.log("Type de pending_word:", typeof formattedUri.pending_word, formattedUri.pending_word);
        console.log("Type de pending_word_len:", typeof formattedUri.pending_word_len, formattedUri.pending_word_len);



        // console.log("myByteArrayFixed:", JSON.stringify(myByteArrayFixed, null, 2));



        const uriString = stringFromByteArray(myByteArray);


        console.log("uribefore", uri);
        console.log("uriString", uriString);

        // const uriTest = "ezezezezezezzezezezezee";

        console.log("Contract ABI:", contract.abi);
        const estimatedFee = await contract.estimate("safe_mint", [recipient, formattedUri]);


        const txResponse = await contract.invoke("safe_mint", [recipient, formattedUri], {
            maxFee: estimatedFee.overall_fee * BigInt(2)
        });


        const transactionHash = txResponse.transaction_hash;
        console.log("Transaction Hash :", transactionHash);
        return txResponse;

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Erreur lors de la création du SBT :", error.stack);
        } else {
            console.error("Erreur lors de la création du SBT :", error);
        }
        throw error;
    }

}

