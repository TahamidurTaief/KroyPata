"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }) {
  // <-- The 'export' keyword is crucial
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="chinakroy-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
