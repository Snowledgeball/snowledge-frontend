import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { encryptPrivateKey, decryptPrivateKey } from "../../../../utils/crypt";
import { pinata } from "../../../../utils/config";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Extraire les données du corps de la requête

    const formData = await req.formData();
    const fullName = formData.get("fullName");
    const userName = formData.get("userName");
    const profilePicture = formData.get("profilePicture");
    const email = formData.get("email");
    const password = formData.get("password");
    const accountAddress = formData.get("accountAddress");
    const publicKey = formData.get("publicKey");
    const privateKey = formData.get("privateKey");

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: { userName },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
      });
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email },
    });

    if (existingEmail) {
      return new Response(JSON.stringify({ error: "Email already exists" }), {
        status: 400,
      });
    }

    console.log("privateKey", privateKey);

    // on crypte la clé privée a partir du mot de passe
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);


    console.log("encryptedPrivateKey", encryptedPrivateKey);

    const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);

    console.log("decryptedPrivateKey", decryptedPrivateKey);

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pinata.upload.file(profilePicture);
    const profilePictureUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${result.IpfsHash}`;

    // Créer le nouvel utilisateur
    const user = await prisma.user.create({
      data: {
        fullName,
        userName,
        profilePicture: profilePictureUrl,
        email,
        password: hashedPassword,
        accountAddress,
        publicKey,
        privateKey: encryptedPrivateKey,
        salt,
        iv,
      },
    });


    console.log("user", user);

    // Retourner une réponse réussie
    return new Response(
      JSON.stringify({ message: "User registered successfully", profilePictureUrl }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Error:", error.stack)  // Only console.log works here, anything else was throwing errors for me.
    return new Response(
      JSON.stringify({ error: "An error occurred during registration" }),
      {
        status: 500,
      }
    );
  }
}
