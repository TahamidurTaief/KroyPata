"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductGrid from "./ProductGrid";
import ProductListHeader from "./ProductListHeader";
import Pagination from "../Common/Pagination";
import EnhancedSectionRenderer from "../Common/EnhancedSectionRenderer";
import { FiX } from "react-icons/fi";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/app/hooks/useProducts";
import { getCategories } from "@/app/lib/api";

const ProductPage = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle hydration for theme
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // State for loading status
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Centralized state for all filters, initialized from URL parameters
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    subcategories: [],
    brand: "",
    brands: [],
    priceRange: [0, 1000],
    sort: "featured",
    colors: [],
    shipping_categories: [],
    search: "",
  });

  // Initialize filters from URL params after mount to prevent hydration issues
  useEffect(() => {
    if (mounted) {
      setFilters({
        category: searchParams.get("category") || "",
        subcategory: searchParams.get("subcategory") || "",
        subcategories: searchParams.get("subcategories")?.split(',') || [],
        brand: searchParams.get("brand") || "",
        brands: searchParams.get("brands")?.split(',') || [],
        priceRange: [0, 1000],
        sort: searchParams.get("sort") || "featured",
        colors: searchParams.get("colors")?.split(',') || [],
        shipping_categories: searchParams.get("shipping_categories")?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) || [],
        search: searchParams.get("search") || "",
      });
    }
  }, [mounted, searchParams]);

  // Fetch categories for dynamic title
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Get current category name for dynamic title
  const currentCategoryName = useMemo(() => {
    if (!filters.category || !categories.length) return null;
    const category = categories.find(cat => cat.slug === filters.category);
    return category ? category.name : null;
  }, [filters.category, categories]);

  // Generate page title based on current filters
  const pageTitle = useMemo(() => {
    if (currentCategoryName) {
      if (filters.subcategories?.length > 0) {
        return `${currentCategoryName} > Filtered Products`;
      } else if (filters.subcategory) {
        return `${currentCategoryName} > Products`;
      }
      return `${currentCategoryName} Products`;
    }
    return 'All Products';
  }, [currentCategoryName, filters.subcategory, filters.subcategories]);

  // Generate page description
  const pageDescription = useMemo(() => {
    if (currentCategoryName) {
      return `Explore our ${currentCategoryName.toLowerCase()} collection with shipping options`;
    }
    return 'Discover our entire collection of products with shipping options';
  }, [currentCategoryName]);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize page from URL after mount
  useEffect(() => {
    if (mounted) {
      setCurrentPage(Number(searchParams.get("page")) || 1);
    }
  }, [mounted, searchParams]);
  
  // Use SWR hook for fetching products
  const { products, totalCount, totalPages, isLoading, isError } = useProducts(filters, currentPage);

  // Debug filter changes
  useEffect(() => {
    console.log('🔧 ProductPage filters changed:', filters);
  }, [filters]);

  // Function to sync the URL with the current filter and page state
  const updateURL = useCallback((newFilters, newPage) => {
      const params = new URLSearchParams();
  if (newFilters.category) params.set('category', newFilters.category);
  if (newFilters.subcategory) params.set('subcategory', newFilters.subcategory);
  if (newFilters.subcategories?.length > 0) params.set('subcategories', newFilters.subcategories.join(','));
  if (newFilters.brand) params.set('brand', newFilters.brand);
  if (newFilters.brands?.length > 0) params.set('brands', newFilters.brands.join(','));
      if (newFilters.colors.length > 0) params.set('colors', newFilters.colors.join(','));
      if (newFilters.shipping_categories.length > 0) params.set('shipping_categories', newFilters.shipping_categories.join(','));
      if (newFilters.sort !== 'featured') params.set('sort', newFilters.sort);
      if (newFilters.search) params.set('search', newFilters.search);
      if (newPage > 1) params.set('page', newPage);
      // Use replace to avoid polluting browser history on every filter change
      router.replace(`/products?${params.toString()}`);
  }, [router]);

  // Effect to update URL whenever filters or current page change
  useEffect(() => {
    updateURL(filters, currentPage);
  }, [filters, currentPage, updateURL]);

  // Callback for when filters are changed in the Sidebar
  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters(prev => ({ ...prev, ...newFilterValues }));
    setCurrentPage(1); // Reset to the first page whenever filters change
  }, []);

  // Callback to clear all filters
  const clearFilters = useCallback(() => {
    setFilters({ 
      category: "", 
      subcategory: "",
      subcategories: [],
      brand: "",
      brands: [],
      priceRange: [0, 1000], 
      sort: "featured", 
      colors: [], 
      shipping_categories: [],
      search: "" 
    });
    setCurrentPage(1);
    router.push('/products');
  }, [router]);

  // Callback for the Pagination component
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = useCallback((sortValue) => {
    handleFilterChange({ sort: sortValue });
  }, [handleFilterChange]);

  // Handle search with debouncing
  const handleSearch = useCallback((searchQuery) => {
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set a new timeout for debounced search
    window.searchTimeout = setTimeout(() => {
      handleFilterChange({ search: searchQuery });
    }, 300); // 300ms debounce
  }, [handleFilterChange]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col xl:flex-row gap-6">
            <aside className="hidden xl:block w-full xl:w-80 flex-shrink-0">
              <div className="h-96 bg-[var(--muted)] rounded-xl animate-pulse"></div>
            </aside>
            <main className="flex-1 min-w-0">
              {/* Skeleton for Search/Sort Row */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 h-11 bg-[var(--muted)] rounded-lg animate-pulse"></div>
                <div className="w-40 h-11 bg-[var(--muted)] rounded-lg animate-pulse"></div>
                <div className="xl:hidden w-24 h-11 bg-[var(--muted)] rounded-lg animate-pulse"></div>
              </div>
              {/* Skeleton for Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-[var(--muted)] rounded-xl h-56 md:h-64 w-full mb-3"></div>
                    <div className="h-4 bg-[var(--muted)] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[var(--muted)] rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-[var(--muted)] rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Desktop Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden xl:block w-full xl:w-80 flex-shrink-0"
          >
            <div className="sticky top-6">
              <Sidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onClearFilters={clearFilters} 
                theme={mounted ? resolvedTheme : 'light'} 
              />
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Compact Header with Search and Sort */}
            <ProductListHeader
              totalProducts={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onSortChange={handleSortChange}
              currentSort={filters.sort}
              onToggleMobileFilters={() => setShowMobileFilters(true)}
              onSearch={handleSearch}
              searchQuery={filters.search}
            />

            {/* Product Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ProductGrid 
                products={products}
                isLoading={isLoading}
                isError={isError}
              />
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            )}
          </main>
        </div>

        {/* Mobile Filter Panel */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 xl:hidden"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              
              {/* Panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--card)] shadow-2xl overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--primary)]">
                  <h3 className="text-lg font-semibold text-white">
                    Filters
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX size={20} className="text-white" />
                  </motion.button>
                </div>
                
                {/* Sidebar Content */}
                <div className="p-4">
                  <Sidebar
                    filters={filters}
                    onFilterChange={(newFilters) => {
                      handleFilterChange(newFilters);
                      setShowMobileFilters(false);
                    }}
                    onClearFilters={() => {
                      clearFilters();
                      setShowMobileFilters(false);
                    }}
                    theme={mounted ? resolvedTheme : 'light'}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Dynamic Sections for Products Page */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <EnhancedSectionRenderer page="products" />
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;
