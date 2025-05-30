"use client";

import "../../globals.css";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@repo/ui";
import { useAuth } from "@/contexts/auth-context";
import { useParams } from "next/navigation";
import { useUserCommunities } from "@/hooks/useUserCommunities";
import { useEffect } from "react";
import { notFound } from "next/navigation";
import { features } from "@/config/features";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();
  const { slug } = useParams();

  const { data: communities, isLoading } = useUserCommunities(user?.id || 0);

  useEffect(() => {
    if (communities) {
      const community = communities.find((c) => c.slug === slug);
      if (!community) notFound();
    }
  }, [communities]);

  if (!features.community.enabled) {
    notFound();
  }

  if (isLoading) return <div>Loading...</div>;

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
