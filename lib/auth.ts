import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

// Initialisation du client Prisma
const prisma = new PrismaClient();

// Types personnalisés pour étendre les types de base de NextAuth
interface CustomSession extends Session {
    user: {
        id: string;
        email: string;
        name: string;
        image: string;
        address: string;
    }
}

interface CustomJWT extends JWT {
    id: string;
    image: string;
    address: string;
}

// Configuration principale de l'authentification
export const authOptions = {
    // Utilisation de Prisma comme adaptateur de base de données
    adapter: PrismaAdapter(prisma),

    // Configuration des fournisseurs d'authentification
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            // Fonction de validation des identifiants
            async authorize(credentials) {
                // Recherche de l'utilisateur par email
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email },
                });

                // Vérification du mot de passe
                if (user && credentials?.password && bcrypt.compareSync(credentials.password, user.password)) {
                    console.log(user)
                    return {
                        id: String(user.id),
                        email: user.email,
                        name: user.fullName,
                        image: user.profilePicture,
                        accountAddress: user.accountAddress
                    };
                }
                return null;
            },
        }),
    ],

    // Configuration de la stratégie de session
    session: {
        strategy: "jwt",
    },

    // Callbacks pour personnaliser le comportement de l'authentification
    callbacks: {
        // Personnalisation du JWT
        async jwt({ token, user }: {
            token: CustomJWT;
            user?: {
                id: string;
                email: string;
                name: string;
                image: string;
                accountAddress: string;
            }
        }) {
            if (user) {
                // Assurons-nous que l'image est correctement assignée
                token.id = user.id;
                token.image = user.image;
                token.address = user.accountAddress;
                console.log("JWT Token:", token); // Ajout d'un log pour déboguer
            }
            return token;
        },

        // Personnalisation de la session
        async session({ session, token }: {
            session: CustomSession;
            token: CustomJWT;
        }) {
            if (token) {
                session.user.id = token.id;
                session.user.image = token.image; // Ajout d'une valeur par défaut
                session.user.address = token.address;
                console.log("Session:", session); // Ajout d'un log pour déboguer
            }
            return session;
        },
    },

    // Clé secrète pour signer les tokens
    secret: process.env.NEXTAUTH_SECRET,
};