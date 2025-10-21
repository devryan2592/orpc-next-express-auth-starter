import { getMenuList, NavMenuItem } from "@/lib/nav-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

interface SidebarNavProps {
  // Add your props here
  children?: React.ReactNode;
}

const SidebarNav: FC<SidebarNavProps> = ({ children }) => {
  const menuGroups = getMenuList();
  const pathname = usePathname();

  const isPathActive = (url?: string) => {
    if (!url) return false;

    // Exact match
    if (pathname === url) return true;

    // For dashboard root, only match exactly
    if (url === "/dashboard") return pathname === "/dashboard";

    // For other paths, check if current path starts with the URL
    // This handles nested routes like /dashboard/blogs/add matching /dashboard/blogs
    if (url !== "/" && pathname.startsWith(url)) {
      // Ensure we're matching complete path segments
      const nextChar = pathname.charAt(url.length);
      return nextChar === "/" || nextChar === "";
    }

    return false;
  };

  const isParentActive = (item: NavMenuItem): boolean => {
    // For parent items with children, check if any child is active
    // Don't highlight parent based on its own URL if it has children
    if (item.items && item.items.length > 0) {
      return item.items.some((subItem) => isPathActive(subItem.url));
    }

    // For items without children, check if the item itself is active
    return isPathActive(item.url);
  };

  const renderMenuItem = (item: NavMenuItem) => {
    // If item has sub-items, render as collapsible
    if (item.items && item.items.length > 0) {
      const parentActive = isParentActive(item);
      const anyChildActive = item.items.some((sub) => isPathActive(sub.url));

      return (
        <Collapsible key={item.title} defaultOpen={anyChildActive}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className="w-full group"
                isActive={parentActive}
              >
                {item.icon && <item.icon className="mr-1 h-4 w-4" />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="mt-0.5">
                {item.items.map((subItem) => (
                  <div key={subItem.title} className="relative">
                    <SidebarMenuSubItem key={subItem.title} className="">
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url || "#"}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    {isPathActive(subItem.url) && (
                      <div className="absolute -left-3 top-0 h-full w-[2px] bg-primary" />
                    )}
                  </div>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // If item has no sub-items, render as direct link
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isPathActive(item.url)}>
          <Link href={item.url || "#"}>
            {item.icon && <item.icon className="mr-1 h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      {menuGroups.map((group, index) => (
        <SidebarGroup key={group.groupLabel || `group-${index}`}>
          {group.groupLabel && (
            <SidebarGroupLabel>{group.groupLabel}</SidebarGroupLabel>
          )}
          <SidebarMenu>{group.items.map(renderMenuItem)}</SidebarMenu>
        </SidebarGroup>
      ))}
      {children}
    </>
  );
};

export default SidebarNav;
