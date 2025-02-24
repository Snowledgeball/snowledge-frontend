import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { pinata } from "@/utils/config";
import bcrypt from "bcrypt";

const prismaClient = new PrismaClient();

export async function GET(
    request,
    { params }
) {
    try {
        // Récupérer l'utilisateur

        const { id } = await params;

        const user = await prismaClient.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Récupérer le nombre de communautés où l'utilisateur est membre
        const communitiesCount = await prismaClient.community_learners.count({
            where: {
                learner_id: parseInt(id)
            }
        });

        // Récupérer le nombre de posts de l'utilisateur
        const postsCount = await prismaClient.community_posts.count({
            where: {
                author_id: parseInt(id)
            }
        });

        // Récupérer le nombre de contributions 
        const contributionsCount = 0;

        // Calculer la date d'inscription (à partir de la première communauté rejointe)
        const memberSince = user.created_at
            ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long'
            })
            : "N/A";

        // Calculer le niveau en fonction du nombre de contributions total
        const totalContributions = postsCount + contributionsCount;
        const level = Math.floor(Math.sqrt(totalContributions) + 1);

        // Pour l'instant, les gains sont fictifs - à implémenter selon votre logique métier
        const totalEarnings = 0;

        const userData = {
            id: user.id,
            userName: user.userName,
            fullName: user.fullName,
            level: level,
            memberSince: memberSince,
            avatar: user.profilePicture,
            email: user.email,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            stats: {
                communitiesCount,
                postsCount,
                contributionsCount,
                totalEarnings
            }
        };

        return NextResponse.json(userData);

    } catch (error) {
        console.log("Erreur lors de la récupération des données utilisateur:", error.stack
        );
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req,
    { params }
) {
    try {
        const { id } = await params;

        // Vérification de l'authentification
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Vérification que l'utilisateur modifie son propre profil
        if (session.user.id !== id) {
            return NextResponse.json(
                { error: "Non autorisé à modifier ce profil" },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const updates = {};

        // Liste des champs autorisés à être mis à jour
        const allowedFields = ['userName', 'fullName', 'email', 'image', 'currentPassword', 'newPassword', 'confirmPassword'];

        console.log("formData :", formData);


        // Vérifier si c'est une mise à jour de mot de passe
        const isPasswordUpdate = formData.has('currentPassword') && formData.has('newPassword');

        console.log("isPasswordUpdate :", isPasswordUpdate);

        if (isPasswordUpdate) {
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            if (newPassword !== confirmPassword) {
                return NextResponse.json(
                    { error: "Les mots de passe ne correspondent pas" },
                    { status: 400 }
                );
            }

            // Vérifier le mot de passe actuel
            const user = await prismaClient.user.findUnique({
                where: { id: parseInt(id) },
                select: { password: true }
            });

            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return NextResponse.json(
                    { error: "Mot de passe actuel incorrect" },
                    { status: 400 }
                );
            }

            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.password = hashedPassword;

            console.log("updates :", updates);

        } else {
            // Traitement normal pour les autres champs
            for (const [key, value] of formData.entries()) {
                if (allowedFields.includes(key)) {
                    updates[key] = value;
                }
            }

            console.log("updates :", updates);

            if (updates.image) {
                const result = await pinata.upload.file(updates.image)
                const profilePictureUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${result.IpfsHash}`;
                updates.image = profilePictureUrl;
                let test = "ezez"
            }
        }

        const updatedUser = await prismaClient.user.update({
            where: { id: parseInt(id) },
            data: updates.image ? { profilePicture: updates.image } : updates
        });


        // Les données qu'on veut mettre a jour dans les metadata du SBT
        if (updates.image || updates.userName || updates.fullName || updates.email) {
            const newFormData = new FormData();
            newFormData.append("userAddress", session.user.address);
            newFormData.append("newValue", JSON.stringify(updates));

            console.log("newFormData :", newFormData);

            await fetch(`${process.env.API_URL}/api/auth/upload`, {
                method: "PUT",
                body: newFormData,
            });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.log("Erreur lors de la mise à jour du profil:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du profil" },
            { status: 500 }
        );
    }
}