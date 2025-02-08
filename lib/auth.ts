import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;
                token.address = user.accountAddress;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user.id = token.id;
                session.user.address = token.address;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};