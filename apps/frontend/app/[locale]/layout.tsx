// frontend/app/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import React from "react";
import localFont from "next/font/local";
import "../globals.css";
import { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { ReactQueryClientProvider } from "@/utils/react-query-provider";
import { CommunityProvider } from "@/contexts/community-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Snowledge",
  description: "Plateforme Snowledge - Landing page",
};

// Fonts locales
const geistSans = localFont({
  src: [
    {
      path: "../../public/fonts/geist-sans/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/geist-sans/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    {
      path: "../../public/fonts/geist-mono/GeistMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/geist-mono/GeistMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  if (!messages) notFound();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased">
        <ReactQueryClientProvider>
          <AuthProvider>
            <CommunityProvider>
              <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
                <Toaster />
              </NextIntlClientProvider>
            </CommunityProvider>
          </AuthProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
