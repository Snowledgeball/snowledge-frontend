import "../../globals.css";
import { ReactQueryClientProvider } from "@/utils/react-query-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@repo/ui";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <ReactQueryClientProvider>
        <div className="flex min-h-screen min-w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 w-full">
              <SidebarInset>
                {children} <Toaster />
              </SidebarInset>
            </main>
          </div>
        </div>
      </ReactQueryClientProvider>
    </SidebarProvider>
  );
}
