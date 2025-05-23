import "../../globals.css";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/header";
import { SidebarInset, SidebarProvider } from "@repo/ui";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
