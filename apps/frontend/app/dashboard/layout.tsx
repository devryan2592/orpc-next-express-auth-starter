import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="relative overflow-hidden">
        <DashboardHeader />
        <main className="relative h-full max-h-[calc(100vh-4rem)] group-has-data-[collapsible=icon]/sidebar-wrapper:max-h-[calc(100vh-3rem)] mt-16 group-has-data-[collapsible=icon]/sidebar-wrapper:mt-12 transition-[height] ease-linear ">
          <div className="absolute inset-0 overflow-y-auto no-scrollbar m-4 ">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
