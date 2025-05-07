import { deployAccountContract } from "@/utils/starknetUtils";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { privateKey, publicKey } = await request.json();

    if (!privateKey || !publicKey) {
      return NextResponse.json(
        { error: "Les clés sont requises" },
        { status: 400 }
      );
    }

    console.log("privateKey", privateKey);
    console.log("publicKey", publicKey);
    const result = await deployAccountContract(privateKey, publicKey);

    return NextResponse.json({
      success: true,
      transactionHash: result.transactionHash,
      accountAddress: result.accountAddress,
    });
  } catch (error) {
    console.error("Erreur lors du déploiement du compte:", error);
    return NextResponse.json(
      { error: "Erreur lors du déploiement du compte" },
      { status: 500 }
    );
  }
}
