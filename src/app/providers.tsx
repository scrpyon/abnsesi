"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SessionProvider>{children}</SessionProvider>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}

