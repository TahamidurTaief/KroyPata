// hooks/useProducts.js
"use client";

import React from 'react';
import useSWR from 'swr';
import { getProducts, getShippingCategories } from '@/app/lib/api';

// SWR fetcher function for products with enhanced error handling
const productsFetcher = async (key) => {
  console.log('📡 SWR Fetcher called with key:', key);
  
  // Parse the key to extract filters and page
  const match = key.match(/^products:(.*):page-(\d+)$/);
  if (!match) {
    throw new Error('Invalid SWR key format');
  }
  
  const [, filterJson, pageStr] = match;
  const filters = JSON.parse(filterJson);
  const page = parseInt(pageStr, 10);
  
  // Convert comma-separated strings back to arrays
  const processedFilters = {
    category: filters.category || undefined,
    subcategory: filters.subcategory || undefined,
    subcategories: filters.subcategories ? filters.subcategories.split(',').filter(Boolean) : undefined,
    brand: filters.brand || undefined,
    brands: filters.brands ? filters.brands.split(',').filter(Boolean) : undefined,
    colors: filters.colors ? filters.colors.split(',').filter(Boolean) : undefined,
    shipping_categories: filters.shipping_categories ? filters.shipping_categories.split(',').filter(Boolean).map(Number) : undefined,
    search: filters.search || undefined,
    sort: filters.sort !== 'featured' ? filters.sort : undefined,
    priceRange: filters.priceRange && filters.priceRange !== '0-1000' ? filters.priceRange.split('-').map(Number) : undefined,
  };
  
  // Remove undefined values
  const cleanFilters = Object.fromEntries(
    Object.entries(processedFilters).filter(([_, v]) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
  );
  
  console.log('📡 Processed filters:', { cleanFilters, page });
  
  try {
    const result = await getProducts(cleanFilters, page, 24); // Always use 24 items per page
    console.log('📡 SWR Fetcher result:', {
      hasError: !!result.error,
      hasData: !!result.results || !!result.count,
      count: result.count,
      resultsLength: result.results?.length,
      error: result.error
    });
    
    // If API returned an error, throw it so SWR handles it properly
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('📡 SWR Fetcher error:', error);
    throw error;
  }
};

// Custom hook for fetching products with SWR
export const useProducts = (filters = {}, page = 1) => {
  // Create a stable, serialized key for SWR to avoid caching issues
  // Sort object keys to ensure consistent stringification
  const swrKey = React.useMemo(() => {
    const normalizedFilters = {
      brand: filters.brand || '',
      brands: (filters.brands || []).sort().join(','),
      category: filters.category || '',
      colors: (filters.colors || []).sort().join(','),
      priceRange: (filters.priceRange || [0, 1000]).join('-'),
      search: filters.search || '',
      shipping_categories: (filters.shipping_categories || []).sort().join(','),
      sort: filters.sort || 'featured',
      subcategories: (filters.subcategories || []).sort().join(','),
      subcategory: filters.subcategory || '',
    };
    // Create a simple string key instead of array to ensure uniqueness
    const filterKey = JSON.stringify(normalizedFilters);
    return `products:${filterKey}:page-${page}`;
  }, [
    filters.category,
    filters.subcategory,
    filters.subcategories,
    filters.brand,
    filters.brands,
    filters.colors,
    filters.shipping_categories,
    filters.search,
    filters.sort,
    filters.priceRange,
    page
  ]);
  
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    productsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Reduced to 2 seconds for faster filter updates
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      onError: (error, key) => {
        console.error('🚨 SWR Error:', { key, error: error.message });
      },
      // Remove fallbackData to ensure real data is always fetched
      keepPreviousData: true, // Show previous data while loading new data
    }
  );

  // Debug logging with more detail
  console.log('🔍 useProducts Debug:', {
    filters,
    page,
    data: data ? { 
      count: data.count, 
      resultsLength: data.results?.length,
      hasResults: !!data.results,
      sampleProduct: data.results?.[0]?.name || 'N/A'
    } : null,
    isLoading,
    error: error?.message || error,
    swrKey
  });

  return {
    products: data?.results || [],
    totalCount: data?.count || 0,
    totalPages: Math.ceil((data?.count || 0) / 24),
    isLoading,
    isError: error,
    mutate,
  };
};

// Custom hook for fetching shipping categories
export const useShippingCategories = () => {
  const { data, error, isLoading } = useSWR(
    'shipping-categories',
    getShippingCategories,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    shippingCategories: data || [],
    isLoading,
    isError: error,
  };
};

// SWR configuration for the entire app
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  onError: (error, key) => {
    console.error('SWR Error:', key, error);
  }
};
