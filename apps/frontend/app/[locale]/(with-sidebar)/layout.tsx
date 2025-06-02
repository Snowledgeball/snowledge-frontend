"use client";

import "../../globals.css";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@repo/ui";
import { notFound } from "next/navigation";
import { features } from "@/config/features";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!features.community.enabled) {
    notFound();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen min-w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 w-full">
            <SidebarInset>{children}</SidebarInset>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
