"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </AuthProvider>
    </QueryProvider>
  </ThemeProvider>
);
