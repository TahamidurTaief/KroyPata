"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

/**
 * Custom hook for theme-aware assets (logos, placeholders, and banners)
 * Returns appropriate assets based on current theme
 */
export const useThemeAssets = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the actual theme (resolvedTheme handles 'system' preference)
  // Use a more robust theme detection that doesn't default to light
  const currentTheme = mounted ? (resolvedTheme || theme || 'dark') : (resolvedTheme || theme || 'dark');

  // Logo paths based on theme
  const logoSrc = currentTheme === 'dark' 
    ? '/img/logo_dark.svg' 
    : '/img/logo_light.svg';

  // No-image placeholder paths based on theme
  const noImagePlaceholder = currentTheme === 'dark'
    ? '/img/no_img_dark.svg'
    : '/img/no_img_light.svg';

  // Theme-aware banner images with fallback system
  const getThemeBanner = (bannerName) => {
    const basePath = '/img/banner/';
    const darkVersion = `${basePath}${bannerName}_dark.jpg`;
    const lightVersion = `${basePath}${bannerName}_light.jpg`;
    const fallbackVersion = `${basePath}${bannerName}.jpg`;
    
    return {
      primary: currentTheme === 'dark' ? darkVersion : lightVersion,
      fallback: fallbackVersion,
      dark: darkVersion,
      light: lightVersion
    };
  };

  // Fallback for old placeholder if needed
  const fallbackPlaceholder = 'https://placehold.co/500x500/e2e8f0/e2e8f0.png?text=img';

  return {
    logoSrc,
    noImagePlaceholder,
    fallbackPlaceholder,
    currentTheme,
    mounted,
    getThemeBanner
  };
};
