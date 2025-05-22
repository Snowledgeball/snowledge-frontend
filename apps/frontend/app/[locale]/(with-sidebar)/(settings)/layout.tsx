import "../../../globals.css";
import SettingsSideBarDesktop from "@/components/settings/sidebar-desktop";
import SettingsSideBarMobile from "@/components/settings/sidebar-mobile";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
    
          <div className="bg-background border-b border-border">
            <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col ">
              {/* Main content */}
              <div className="flex justify-between md:items-center gap-3 md:flex-row flex-col">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Settings
                  </h1>
                </div>
                {/* Search */}
                {/* <div className="relative md:max-w-xs w-full">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input type="search" placeholder="Search" className="pl-8" />
                </div> */}
                {/* Mobile-only dropdown */}
                <SettingsSideBarMobile />
              </div>
            </div>
          </div>
    
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar - hidden on mobile, no border */}
              <aside className="hidden md:block w-64 py-6 pr-6 border-r border-border">
                <SettingsSideBarDesktop />
              </aside>
              {children}
            </div>
          </div>
        </div>
  );
}
