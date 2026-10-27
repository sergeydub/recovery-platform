"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Light, dark or follow the OS. Sets the `dark` class on <html>, which the
// shadcn tokens in globals.css (and Clerk's shadcn theme) key off.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
