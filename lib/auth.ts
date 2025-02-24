import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

interface CustomSession extends Session {
    user: {
        id: string;
        email: string;
        name: string;
        image?: string;
        address?: string;
    }
}

interface CustomJWT extends JWT {
    id: string;
    image?: string;
    address?: string;
}

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email },
                });

                if (user && credentials?.password && bcrypt.compareSync(credentials.password, user.password)) {
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
    session: {
        strategy: "jwt",
    },
    callbacks: {
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
                token.id = user.id;
                token.image = user.image;
                token.address = user.accountAddress;
            }
            return token;
        },
        async session({ session, token }: {
            session: CustomSession;
            token: CustomJWT;
        }) {
            if (token) {
                session.user.id = token.id;
                session.user.image = token.image;
                session.user.address = token.address;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};