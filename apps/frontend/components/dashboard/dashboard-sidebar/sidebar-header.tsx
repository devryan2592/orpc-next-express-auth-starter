import {
  SidebarHeader as Header,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

interface SidebarHeaderProps {
  // Add your props here
  children?: React.ReactNode;
}

const SidebarHeader: FC<SidebarHeaderProps> = ({ children }) => {
  return (
    <div className="border-b">
      <Header>
        <SidebarMenu className="border-sidebar-accent-foreground">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex flex-row items-center gap-2.5"
              >
                <div className="flex justify-center items-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd />
                </div>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">
                    Smart Turn Holidays
                  </span>
                  <span className="text-xs truncate">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Header>
    </div>
  );
};

export default SidebarHeader;
