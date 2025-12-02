// components/ThemeToggle.jsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder to prevent layout shift and hydration mismatch
    return <div className="w-9 h-9" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
      style={{
        backgroundColor: "var(--muted)",
        color: "var(--muted-foreground)",
      }}
      aria-label="Toggle theme"
    >
      <Sun className="theme-toggle-sun w-5 h-5" />
      <Moon className="theme-toggle-moon w-5 h-5" />
    </button>
  );
};
