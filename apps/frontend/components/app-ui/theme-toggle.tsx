import React, { FC } from "react";
import { useTheme } from "next-themes";
import {
  ThemeToggleButton,
  useThemeTransition,
} from "@workspace/ui/custom/theme-toggle";

interface ThemeToggleProps {}

const ThemeToggle: FC<ThemeToggleProps> = (props) => {
  const { theme, setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  const currentTheme = theme || "light";
  const toggleTheme = () =>
    startTransition(() => setTheme(currentTheme === "dark" ? "light" : "dark"));

  return <ThemeToggleButton variant="polygon" onClick={toggleTheme} />;
};

export default ThemeToggle;
