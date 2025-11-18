"use client";
import React, { useState, useEffect, useCallback } from "react";
import FilterSection from "./FilterSection";
import FilteredProduct from "./FilteredProduct";
import { getProducts } from "@/app/lib/api"; // Updated import
import { useAuth } from "@/app/contexts/AuthContext"; // Add auth context

const FilterProducts = ({ initialProducts, categories }) => {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth(); // Get authentication state
  
  // This state will hold the active filters
  const [filters, setFilters] = useState({
    category: "",
    priceRange: { min: 0, max: 10000 },
    sort: "",
  });

  // This function is called when any filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // useEffect to fetch products when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      
      try {
        // Build filter parameters for the API
        const searchParams = {};
        
        // Category filter
        if (filters.category) {
          searchParams.category = filters.category;
        }
        
        // Price range filter
        if (filters.priceRange) {
          if (filters.priceRange.min > 0) {
            searchParams.min_price = filters.priceRange.min;
          }
          if (filters.priceRange.max < 1000) { // Changed to match MAX_PRICE in FilterSection
            searchParams.max_price = filters.priceRange.max;
          }
        }
        
        // Sort filter - map frontend values to backend ordering
        if (filters.sort) {
          switch (filters.sort) {
            case 'price':
              searchParams.ordering = 'price';
              break;
            case '-price':
              searchParams.ordering = '-price';
              break;
            case 'name':
              searchParams.ordering = 'name';
              break;
            case '-name':
              searchParams.ordering = '-name';
              break;
            default:
              searchParams.ordering = filters.sort;
          }
        }

        console.log('🔧 Fetching with filters:', searchParams);
        
        const newProductsData = await getProducts(searchParams);
        
        if (newProductsData?.error) {
          console.error('API Error:', newProductsData.error);
          setProducts(initialProducts); // Fallback to initial products
        } else {
          setProducts(newProductsData?.results || []);
        }
      } catch (error) {
        console.error('Filter fetch error:', error);
        setProducts(initialProducts); // Fallback to initial products
      }
      
      setIsLoading(false);
    };
    
    // Check if any filters are applied
    const hasFilters = filters.category || 
                      (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000)) ||
                      filters.sort;
    
    if (hasFilters) {
      fetchFilteredProducts();
    } else {
      setProducts(initialProducts); // Reset to initial if no filters are applied
    }

  }, [filters, initialProducts]);

  // 🔥 NEW: Authentication-aware product refetching for wholesalers
  useEffect(() => {
    const refetchForWholesaler = async () => {
      // Only refetch if:
      // 1. User is authenticated as WHOLESALER
      // 2. No active filters (using initial products)
      // 3. Not already loading
      const isWholesaler = isAuthenticated && user?.user_type === 'WHOLESALER';
      const hasFilters = filters.category || 
                        (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000)) ||
                        filters.sort;
      
      if (isWholesaler && !hasFilters && !isLoading) {
        console.log('🔄 Refetching products for authenticated wholesaler...');
        setIsLoading(true);
        
        try {
          // Fetch products with authentication headers (wholesale pricing included)
          const authenticatedProducts = await getProducts({}, 1);
          
          if (authenticatedProducts?.results) {
            console.log('✅ Got authenticated products with wholesale pricing:', authenticatedProducts.results.length);
            setProducts(authenticatedProducts.results);
            
            // Debug: Check if wholesale prices are present
            const wholesaleCount = authenticatedProducts.results.filter(p => p.wholesale_price && parseFloat(p.wholesale_price) > 0).length;
            console.log(`✅ Found ${wholesaleCount} products with wholesale pricing out of ${authenticatedProducts.results.length} total`);
          }
        } catch (error) {
          console.error('❌ Error refetching for wholesaler:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure authentication is settled
    const timeoutId = setTimeout(refetchForWholesaler, 500);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user?.user_type, filters]); // ✅ REMOVED isLoading from dependencies

  return (
    <div className="py-0 md:py-16">
      <FilterSection categories={categories} onFilterChange={handleFilterChange} />
      <FilteredProduct productData={products} isLoading={isLoading} />
    </div>
  );
};

export default FilterProducts;
