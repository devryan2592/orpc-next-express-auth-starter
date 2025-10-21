import { Home, LucideIcon, NotebookPen, Settings } from "lucide-react";
import { IconType } from "react-icons";

type NavMenuItem = {
  title: string;
  url?: string;
  isActive?: boolean;
  icon?: LucideIcon | IconType;
  items?: NavMenuItem[];
};

type NavMenuGroup = {
  groupLabel?: string;
  items: NavMenuItem[];
};

export const getMenuList = (): NavMenuGroup[] => {
  return [
    {
      groupLabel: "Main",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home },
        {
          title: "Blogs",
          icon: NotebookPen,
          items: [
            {
              title: "View Blogs",
              icon: Settings,
              url: "/dashboard/blogs/view",
            },
            {
              title: "Add Blog",
              url: "/dashboard/blogs/add",
            },
          ],
        },
      ],
    },
  ];
};

export type { NavMenuItem, NavMenuGroup };
