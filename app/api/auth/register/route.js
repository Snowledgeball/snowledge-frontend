import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { encryptPrivateKey, decryptPrivateKey } from "../../../../utils/crypt";


const prisma = new PrismaClient();

export async function POST(req) {
  console.log("POSTTTTT");
  try {
    // Extraire les données du corps de la requête
    const {
      fullName,
      userName,
      profilePicture,
      email,
      password,
      accountAddress,
      publicKey,
      privateKey,
    } = await req.json();


    console.log(
      fullName,
      userName,
      profilePicture,
      email,
      password,
      accountAddress,
      publicKey,
      privateKey,
    );


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

    const dataToSend = {
      fullName,
      userName,
      profilePicture,
      email,
      password: hashedPassword,
      accountAddress,
      publicKey,
      privateKey: encryptedPrivateKey,
      salt,
      iv,
    }

    console.log("dataToSend", dataToSend);



    // Créer le nouvel utilisateur
    const user = await prisma.user.create({
      data: {
        fullName,
        userName,
        profilePicture,
        email,
        password: hashedPassword,
        accountAddress,
        publicKey,
        privateKey: encryptedPrivateKey,
        salt,
        iv,
      },
    });


    console.log(user);

    // Retourner une réponse réussie
    return new Response(
      JSON.stringify({ message: "User registered successfully" }),
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
