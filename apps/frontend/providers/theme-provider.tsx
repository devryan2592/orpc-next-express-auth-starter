"use client";

import * as React from "react";
// import { ThemeProvider as NextThemesProvider } from "next-themes";
import dynamic from "next/dynamic";

const NextThemesProvider = dynamic(
  () => import("next-themes").then((e) => e.ThemeProvider),
  {
    ssr: false,
  }
);
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const defaultTheme =
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "system"
      : "system";
  console.log("🚀 ~ Providers ~ defaultTheme:", defaultTheme);
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      storageKey="st-theme"
      disableTransitionOnChange
      defaultTheme={defaultTheme}
    >
      {children}
    </NextThemesProvider>
  );
}
