// hooks/useWebsiteData.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/app/lib/api';

export const useWebsiteData = () => {
  const [data, setData] = useState({
    navbar_links: [],
    offer_categories: [],
    hero_banners: [],
    offer_banners: [],
    horizontal_banners: [],
    blog_posts: [],
    footer_sections: [],
    social_links: [],
    site_settings: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/website/api/data/all/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      
      // Cache data in localStorage
      localStorage.setItem('website_data', JSON.stringify(result));
      localStorage.setItem('website_data_timestamp', Date.now().toString());
      
    } catch (err) {
      console.error('Error fetching website data:', err);
      setError(err.message);
      
      // Try to load from cache if API fails
      const cachedData = localStorage.getItem('website_data');
      if (cachedData) {
        setData(JSON.parse(cachedData));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNavbarData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/website/api/data/navbar/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setData(prev => ({
        ...prev,
        navbar_links: result.navbar_links,
        offer_categories: result.offer_categories
      }));
      
      return result;
    } catch (err) {
      console.error('Error fetching navbar data:', err);
      setError(err.message);
    }
  }, []);

  const fetchHomepageData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/website/api/data/homepage/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setData(prev => ({
        ...prev,
        hero_banners: result.hero_banners,
        offer_banners: result.offer_banners,
        horizontal_banners: result.horizontal_banners,
        blog_posts: result.blog_posts
      }));
      
      return result;
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setError(err.message);
    }
  }, []);

  const fetchFooterData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/website/api/data/footer/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      setData(prev => ({
        ...prev,
        footer_sections: result.footer_sections,
        social_links: result.social_links,
        site_settings: result.site_settings
      }));
      
      return result;
    } catch (err) {
      console.error('Error fetching footer data:', err);
      setError(err.message);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/website/api/cache/clear/`, {
        method: 'POST'
      });
      
      // Clear local cache too
      localStorage.removeItem('website_data');
      localStorage.removeItem('website_data_timestamp');
      
      // Refetch data
      await fetchAllData();
      
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, [fetchAllData]);

  const getSetting = useCallback((key, defaultValue = '') => {
    const setting = data.site_settings.find(s => s.key === key);
    return setting ? setting.typed_value : defaultValue;
  }, [data.site_settings]);

  const getOfferBannersByType = useCallback((type) => {
    return data.offer_banners.filter(banner => banner.banner_type === type);
  }, [data.offer_banners]);

  const getFeaturedBlogs = useCallback(() => {
    return data.blog_posts.filter(post => post.is_featured);
  }, [data.blog_posts]);

  const getFooterSectionByType = useCallback((sectionType) => {
    return data.footer_sections.find(section => section.section_type === sectionType);
  }, [data.footer_sections]);

  // Check cache on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('website_data');
    const cacheTimestamp = localStorage.getItem('website_data_timestamp');
    
    if (cachedData && cacheTimestamp) {
      const now = Date.now();
      const cacheAge = now - parseInt(cacheTimestamp);
      const cacheValidFor = 15 * 60 * 1000; // 15 minutes
      
      if (cacheAge < cacheValidFor) {
        // Use cached data
        setData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
    }
    
    // Fetch fresh data
    fetchAllData();
  }, [fetchAllData]);

  return {
    // Data
    data,
    loading,
    error,
    
    // Fetch functions
    fetchAllData,
    fetchNavbarData,
    fetchHomepageData,
    fetchFooterData,
    clearCache,
    
    // Helper functions
    getSetting,
    getOfferBannersByType,
    getFeaturedBlogs,
    getFooterSectionByType,
    
    // Individual data access
    navbarLinks: data.navbar_links,
    offerCategories: data.offer_categories,
    heroBanners: data.hero_banners,
    offerBanners: data.offer_banners,
    horizontalBanners: data.horizontal_banners,
    blogPosts: data.blog_posts,
    footerSections: data.footer_sections,
    socialLinks: data.social_links,
    siteSettings: data.site_settings
  };
};

export default useWebsiteData;
