"use client";
import React, { useState, useEffect, useCallback } from "react";
import CategoryCarousel from "./CategoryCarousel";
import FilteredProduct from "./FilteredProduct";
import { getProducts } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";

const FilterProducts = ({ initialProducts, categories }) => {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Handle category change from carousel
  const handleCategoryChange = useCallback((categorySlug) => {
    setSelectedCategory(categorySlug);
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      
      try {
        const searchParams = {};
        
        // Category filter
        if (selectedCategory) {
          searchParams.category = selectedCategory;
        }

        console.log('🔧 Fetching products for category:', selectedCategory || 'All Products');
        
        const newProductsData = await getProducts(searchParams);
        
        if (newProductsData?.error) {
          console.error('API Error:', newProductsData.error);
          setProducts(initialProducts);
        } else {
          setProducts(newProductsData?.results || []);
        }
      } catch (error) {
        console.error('Category filter error:', error);
        setProducts(initialProducts);
      }
      
      setIsLoading(false);
    };
    
    fetchFilteredProducts();
  }, [selectedCategory, initialProducts]);

  // Authentication-aware product refetching for wholesalers
  useEffect(() => {
    const refetchForWholesaler = async () => {
      const isWholesaler = isAuthenticated && user?.user_type === 'WHOLESALER';
      
      if (isWholesaler && !selectedCategory && !isLoading) {
        console.log('🔄 Refetching products for authenticated wholesaler...');
        setIsLoading(true);
        
        try {
          const authenticatedProducts = await getProducts({}, 1);
          
          if (authenticatedProducts?.results) {
            console.log('✅ Got authenticated products with wholesale pricing:', authenticatedProducts.results.length);
            setProducts(authenticatedProducts.results);
            
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

    const timeoutId = setTimeout(refetchForWholesaler, 500);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user?.user_type, selectedCategory]);

  return (
    <div className="py-0">
      <CategoryCarousel 
        categories={categories} 
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
      />
      <FilteredProduct productData={products} isLoading={isLoading} />
    </div>
  );
};

export default FilterProducts;
