"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (count, error: unknown) => {
          const status = (error as { response?: { status?: number } })?.response?.status;
          return status !== undefined && status < 500 ? false : count < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
