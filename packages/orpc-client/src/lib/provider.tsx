"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMemo } from "react";

const makeQueryClient = () => {
  return createQueryClient();
};

let browserQueryClient: QueryClient | undefined;

export function getBrowserQueryClient() {
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

/** ORPC React Provider to wrap the app */
export function ORPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => getBrowserQueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
