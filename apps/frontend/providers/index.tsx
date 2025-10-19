import { FC } from "react";
import { ORPCReactProvider } from "@workspace/orpc-client";
import { Toaster } from "@workspace/ui/components/sonner";

interface AppProvidersProps {
  // Add your props here
  children?: React.ReactNode;
}

const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  return (
    <ORPCReactProvider>
      {children}
      <Toaster richColors />
    </ORPCReactProvider>
  );
};

export { AppProviders };
