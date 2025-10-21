"use client";

import ThemeToggle from "@/components/app-ui/theme-toggle";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { cn } from "@workspace/ui/lib/utils";
import { FC } from "react";
import DashboardBreadcrumbs from "../dashboard-breadcrumbs";

interface DashboardHeaderProps {
  // Add your props here
  children?: React.ReactNode;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 flex h-16 border-b border-border shrink-0 items-center gap-2 transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 group-has-data-[collapsible=icon]/sidebar-wrapper:ml-12 z-10 ml-64 bg-background",
        isMobile && "ml-0 h-12"
      )}
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 "
        />
        <DashboardBreadcrumbs />
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <ThemeToggle />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 "
        />
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>RP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
