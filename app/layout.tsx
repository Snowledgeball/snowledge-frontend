import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/shared/SessionProvider";
import Header from "@/components/shared/Header";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snowledgeball",
  description: "Impulser l'effet boule de neige à la connaissance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" />
        <SessionProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Analytics />
          {/* <Footer /> */}
        </SessionProvider>
      </body>
    </html>
  );
}
