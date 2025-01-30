import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // Extraire les données du corps de la requête
    const {
      fullName,
      userName,
      profilePicture,
      email,
      password,
      starknetAddress,
    } = await req.json();

    console.log(
      fullName,
      userName,
      profilePicture,
      email,
      password,
      starknetAddress
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

    const randomStarknetAddress =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const existingStarknetAddress = await prisma.user.findFirst({
      where: { starknetAddress: randomStarknetAddress },
    });

    if (existingStarknetAddress) {
      return new Response(
        JSON.stringify({ error: "Starknet address already exists" }),
        {
          status: 400,
        }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const user = await prisma.user.create({
      data: {
        fullName,
        userName,
        profilePicture,
        starknetAddress: starknetAddress
          ? starknetAddress
          : randomStarknetAddress,
        email,
        password: hashedPassword,
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
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during registration" }),
      {
        status: 500,
      }
    );
  }
}
