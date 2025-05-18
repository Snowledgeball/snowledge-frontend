// frontend/app/layout.tsx

import React from "react";
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Snowledge",
  description: "Créer du contenu avec votre communauté",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
