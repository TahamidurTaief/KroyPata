// hooks/useProducts.js
"use client";

import React from 'react';
import useSWR from 'swr';
import { getProducts, getShippingCategories } from '@/app/lib/api';

// SWR fetcher function for products with enhanced error handling
const productsFetcher = async (key) => {
  // Extract the actual parameters from the SWR key
  const [, filters, page] = key;
  
  console.log('📡 SWR Fetcher called with:', { key, filters, page });
  
  try {
    const result = await getProducts(filters, page);
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
  // Create a stable key for SWR
  const swrKey = React.useMemo(() => ['products', filters, page], [filters, page]);
  
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    productsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      onError: (error, key) => {
        console.error('🚨 SWR Error:', { key, error: error.message });
      },
      // Add fallback data to prevent empty states
      fallbackData: {
        results: [],
        count: 0
      }
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
