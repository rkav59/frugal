import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background relative">
        <AppSidebar />
        <div className="flex flex-col min-w-0 w-full">
          <Header />
          <main className="flex-1 p-3 sm:p-6 overflow-x-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}