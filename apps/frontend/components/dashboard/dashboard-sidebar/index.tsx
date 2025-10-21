"use client";

import { Sidebar, SidebarContent } from "@workspace/ui/components/sidebar";
import { ComponentProps, FC } from "react";
import SidebarHeader from "./sidebar-header";
import SidebarNav from "./sidebar-nav";
import SidebarFooter from "./sidebar-footer";

const DashboardSidebar: FC<ComponentProps<typeof Sidebar>> = ({
  children,
  ...props
}) => {
  return (
    <Sidebar variant="sidebar" collapsible="icon" side="left" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default DashboardSidebar;
