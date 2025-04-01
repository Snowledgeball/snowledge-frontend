import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les données du body
    const body = await request.json();
    const { name, description, category, imageUrl } = body;

    console.log("body", body);

    // Validation des données
    if (!name || !description || !category) {
      console.log("Le nom, la description et la catégorie sont requis");
      return NextResponse.json(
        { error: "Le nom, la description et la catégorie sont requis" },
        { status: 400 }
      );
    }

    console.log("category", category);

    // Récupérer l'ID de la catégorie
    const categoryData = await prisma.community_category.findFirst({
      where: {
        id: Number(category),
      },
    });

    console.log("categoryData", categoryData);

    if (!categoryData) {
      return NextResponse.json(
        { error: "Catégorie invalide" },
        { status: 400 }
      );
    }

    // Créer la communauté
    const newCommunity = await prisma.community.create({
      data: {
        name: name,
        description: description,
        creator_id: parseInt(session.user.id),
        image_url: imageUrl || null,
        category_id: categoryData.id,
      },
      include: {
        category: true, // Inclure les données de la catégorie dans la réponse
      },
    });

    const newData = {
      community: {
        name: newCommunity.name,
        role: "Owner",
      },
    };

    const formData = new FormData();
    formData.append("userAddress", session.user.address);
    formData.append("newValue", JSON.stringify(newData));

    // On veut pas attendre la modif des datas pour retourner la réponse
    fetch(`${process.env.API_URL}/api/auth/upload`, {
      method: "PUT",
      body: formData,
    });

    return NextResponse.json({
      message: "Communauté créée avec succès",
      id: newCommunity.id,
      community: newCommunity,
    });
  } catch (error) {
    console.log("Erreur lors de la création de la communauté:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la création de la communauté " + error.stack },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      include: {
        community_category: true,
        community_contributors: true,
        community_learners: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Récupérer les informations des créateurs en parallèle
    const communitiesWithCreators = await Promise.all(
      communities.map(async (community) => {
        const creator = await prisma.user.findUnique({
          where: {
            id: community.creator_id,
          },
          select: {
            id: true,
            fullName: true,
            userName: true,
            profilePicture: true,
          },
        });
        return {
          ...community,
          creator,
        };
      })
    );

    return NextResponse.json(communitiesWithCreators);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des communautés:",
      error.stack
    );
    return new NextResponse(null, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
