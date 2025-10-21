"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ChevronRight } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

const DashboardBreadcrumbs: FC = () => {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");
    const breadcrumbs = [];

    // Add home breadcrumb
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isHome: true,
    });

    // Generate breadcrumbs for each path segment
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip the first segment if it's 'dashboard' since we already added it
      if (segment === "dashboard" && index === 0) return;

      // Format segment name (capitalize and replace hyphens with spaces)
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        label,
        href: currentPath,
        isHome: false,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const shouldShowDropdown = breadcrumbs.length > 3;

  return (
    <Breadcrumb className="w-fit">
      <BreadcrumbList>
        {/* Home breadcrumb */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">
              <HomeIcon size={16} aria-hidden="true" />
              <span className="sr-only">Dashboard Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.length > 1 && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight size={16} />
            </BreadcrumbSeparator>

            {/* Show dropdown if more than 3 items */}
            {shouldShowDropdown ? (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="hover:text-foreground">
                      <BreadcrumbEllipsis />
                      <span className="sr-only">Show more breadcrumbs</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {breadcrumbs.slice(1, -1).map((breadcrumb, index) => (
                        <DropdownMenuItem key={index} asChild>
                          <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight size={16} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {breadcrumbs.length > 0
                      ? breadcrumbs[breadcrumbs.length - 1]?.label
                      : ""}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              /* Show all breadcrumbs if 3 or fewer */
              breadcrumbs.slice(1).map((breadcrumb, index) => (
                <div key={index} className="flex items-center">
                  {index < breadcrumbs.length - 2 ? (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link className="mr-2" href={breadcrumb.href}>
                            {breadcrumb.label}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>
                        <ChevronRight size={16} />
                      </BreadcrumbSeparator>
                    </>
                  ) : (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DashboardBreadcrumbs;
