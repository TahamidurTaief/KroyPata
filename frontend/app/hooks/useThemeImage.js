"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

/**
 * Custom hook for handling theme-aware dynamic images with fallback system
 * Prioritizes uploaded images over URLs and provides proper light/dark mode support
 */
export const useThemeImage = (imageData, fallbackUrl = null) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the actual theme (resolvedTheme handles 'system' preference)
  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';

  // Reset image error when imageData changes
  useEffect(() => {
    setImageError(false);
  }, [imageData]);

  /**
   * Get the appropriate image URL based on current theme and available data
   * Priority order:
   * 1. Uploaded images (light/dark based on theme)
   * 2. URL fields (light/dark based on theme)
   * 3. Cross-theme fallback (if one theme is missing, use the other)
   * 4. Legacy/deprecated image fields
   * 5. Provided fallback URL
   */
  const getImageUrl = () => {
    if (!imageData) return fallbackUrl;

    const isDark = currentTheme === 'dark';

    // Primary choice based on current theme
    if (isDark) {
      // Dark mode priority: dark uploaded -> dark URL -> light uploaded -> light URL -> legacy
      if (imageData.effective_image_dark) {
        return imageData.effective_image_dark;
      }
      if (imageData.image_dark_upload) {
        return imageData.image_dark_upload;
      }
      if (imageData.image_dark_url) {
        return imageData.image_dark_url;
      }
      // Fallback to light mode if dark is not available
      if (imageData.effective_image_light) {
        return imageData.effective_image_light;
      }
      if (imageData.image_light_upload) {
        return imageData.image_light_upload;
      }
      if (imageData.image_light_url) {
        return imageData.image_light_url;
      }
    } else {
      // Light mode priority: light uploaded -> light URL -> dark uploaded -> dark URL -> legacy
      if (imageData.effective_image_light) {
        return imageData.effective_image_light;
      }
      if (imageData.image_light_upload) {
        return imageData.image_light_upload;
      }
      if (imageData.image_light_url) {
        return imageData.image_light_url;
      }
      // Fallback to dark mode if light is not available
      if (imageData.effective_image_dark) {
        return imageData.effective_image_dark;
      }
      if (imageData.image_dark_upload) {
        return imageData.image_dark_upload;
      }
      if (imageData.image_dark_url) {
        return imageData.image_dark_url;
      }
    }

    // Legacy field fallbacks (for backward compatibility)
    if (imageData.image) {
      return imageData.image;
    }
    if (imageData.image_light) {
      return imageData.image_light;
    }
    if (imageData.image_dark) {
      return imageData.image_dark;
    }

    // Final fallback
    return fallbackUrl;
  };

  /**
   * Get alternative image URL for error fallback
   * If current theme image fails, try the opposite theme
   */
  const getFallbackImageUrl = () => {
    if (!imageData) return fallbackUrl;

    const isDark = currentTheme === 'dark';

    // Try opposite theme
    if (isDark) {
      // Currently dark, try light mode images
      if (imageData.effective_image_light) return imageData.effective_image_light;
      if (imageData.image_light_upload) return imageData.image_light_upload;
      if (imageData.image_light_url) return imageData.image_light_url;
    } else {
      // Currently light, try dark mode images
      if (imageData.effective_image_dark) return imageData.effective_image_dark;
      if (imageData.image_dark_upload) return imageData.image_dark_upload;
      if (imageData.image_dark_url) return imageData.image_dark_url;
    }

    // Legacy fallbacks
    if (imageData.image) return imageData.image;
    if (imageData.image_light) return imageData.image_light;
    if (imageData.image_dark) return imageData.image_dark;

    return fallbackUrl;
  };

  const primaryImageUrl = getImageUrl();
  const fallbackImageUrl = getFallbackImageUrl();

  // Image error handler
  const handleImageError = (event) => {
    if (!imageError && fallbackImageUrl && fallbackImageUrl !== primaryImageUrl) {
      setImageError(true);
      event.target.src = fallbackImageUrl;
    } else {
      // If fallback also fails, show the provided fallback or hide image
      setImageError(true);
      if (fallbackUrl && event.target.src !== fallbackUrl) {
        event.target.src = fallbackUrl;
      }
    }
  };

  // Image load success handler
  const handleImageLoad = () => {
    setImageError(false);
  };

  return {
    imageUrl: primaryImageUrl,
    fallbackImageUrl,
    currentTheme,
    mounted,
    imageError,
    handleImageError,
    handleImageLoad,
    hasImage: Boolean(primaryImageUrl)
  };
};

/**
 * Simple hook for theme-aware placeholder images
 */
export const useThemePlaceholder = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';

  return {
    placeholderUrl: currentTheme === 'dark' 
      ? '/img/no_img_dark.svg' 
      : '/img/no_img_light.svg',
    currentTheme,
    mounted
  };
};
