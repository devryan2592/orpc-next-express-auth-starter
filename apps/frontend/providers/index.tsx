import { FC } from "react";
import { ORPCReactProvider } from "@workspace/orpc-client";
import { Toaster } from "@workspace/ui/components/sonner";
import { ThemeProvider } from "./theme-provider";

interface AppProvidersProps {
  // Add your props here
  children?: React.ReactNode;
}

const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ORPCReactProvider>
        {children}
        <Toaster richColors />
      </ORPCReactProvider>
    </ThemeProvider>
  );
};

export { AppProviders };
