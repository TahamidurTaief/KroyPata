'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../Common/ProductCard';
import SearchCategoryCard from '../Search/SearchCategoryCard';
import { searchProductsAndCategories } from '../../lib/searchApi';

const SimpleSearchModal = ({ isOpen, onClose, searchQuery, onSearchChange }) => {
  const [results, setResults] = useState({ products: [], categories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // Sync local search query with prop only on initial load to prevent loops
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery || '');
    }
  }, [searchQuery]); // Removed localSearchQuery from dependencies to prevent loops

  // Focus search input when modal opens and handle keyboard trap
  useEffect(() => {
    const handleTabKey = (e) => {
      if (!modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleTabKey, false);
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleTabKey, false);
    };
  }, [isOpen]);

  // Handle local search input change
  const handleLocalSearchChange = (value) => {
    console.log('🔍 Modal search input changed:', value);
    setLocalSearchQuery(value);
    // Remove immediate sync to parent to prevent loops
    // onSearchChange?.(value); 
  };

  // Debounced search function with better memoization
  const performSearch = useCallback(async (query) => {
    console.log('🔍 performSearch called with query:', query);
    if (!query || query.trim().length === 0) {
      setResults({ products: [], categories: [] });
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching for:', query);
      const searchResults = await searchProductsAndCategories(query);
      console.log('🔍 Search results received:', searchResults);
      
      if (searchResults.error) {
        console.error('🚨 Search error:', searchResults.error);
        setError(searchResults.error);
        setResults({ products: [], categories: [] });
      } else {
        console.log('✅ Setting search results:', {
          products: searchResults.products?.length || 0,
          categories: searchResults.categories?.length || 0
        });
        setResults({
          products: searchResults.products || [],
          categories: searchResults.categories || []
        });
      }
    } catch (err) {
      console.error('🚨 Search error:', err);
      setError('Failed to search. Please try again.');
      setResults({ products: [], categories: [] });
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove dependencies to prevent re-creation

  // Effect to handle search query changes with better debouncing
  useEffect(() => {
    if (!isOpen) return; // Only search when modal is open
    
    console.log('🔍 SimpleSearchModal: searchQuery changed to:', localSearchQuery);
    const timeoutId = setTimeout(() => {
      performSearch(localSearchQuery);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, isOpen]); // Removed performSearch dependency

  const hasResults = results.products.length > 0 || results.categories.length > 0;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
          />
          
          {/* Modern Responsive Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.4
            }}
            className="fixed top-4 md:top-20 left-1 right-1 md:left-8 md:right-8 lg:left-16 lg:right-16 xl:left-32 xl:right-32 bottom-4 md:bottom-16 z-[70] flex flex-col max-h-[calc(100vh-2rem)]"
          >
            <div className="w-full h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg md:rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex flex-col min-h-0">
              {/* Modern Search Header */}
              <div className="flex-shrink-0 p-3 md:p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                {/* Search Input Section */}
                <div className="mb-3 md:mb-4">
                  <div className="relative group">
                    {/* Animated Border Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 animate-pulse"></div>
                    
                    {/* Main Search Container */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-1">
                      <div className="flex items-center bg-gray-50/80 dark:bg-gray-700/50 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 transition-all duration-300 group-focus-within:bg-white dark:group-focus-within:bg-gray-700">
                        {/* Search Icon */}
                        <motion.div
                          className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 mr-2 md:mr-3"
                          animate={localSearchQuery ? { 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, 0]
                          } : { scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          🔍
                        </motion.div>
                        
                        {/* Search Input */}
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search products, categories..."
                          value={localSearchQuery}
                          onChange={(e) => handleLocalSearchChange(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base font-medium"
                          aria-label="Search products and categories"
                          id="search-modal-title"
                        />
                        
                        {/* Clear Button */}
                        <AnimatePresence>
                          {localSearchQuery && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleLocalSearchChange('')}
                              className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center transition-colors"
                              aria-label="Clear search"
                            >
                              <span className="text-xs text-gray-600 dark:text-gray-300" aria-hidden="true">✕</span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Info and Close Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isLoading ? 'Searching...' : localSearchQuery ? `Results for "${localSearchQuery}"` : 'Ready to search'}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="Close search modal"
                  >
                    <span aria-hidden="true">✕</span>
                  </motion.button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                {isLoading ? (
                  <div className="p-4 md:p-8">
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 md:w-8 md:h-8 border-2 md:border-3 border-blue-600 border-t-transparent rounded-full"
                      />
                      <span className="ml-3 text-sm md:text-base text-gray-600 dark:text-gray-400">Searching...</span>
                    </div>
                  </div>
                ) : !localSearchQuery ? (
                  <div className="p-8">
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          y: [0, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <span className="text-2xl">🔍</span>
                      </motion.div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Start your search
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Type in the search box above to find products and categories
                      </p>
                    </div>
                  </div>
                ) : results.products.length === 0 && results.categories.length === 0 ? (
                  <div className="p-8">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <span className="text-2xl">📦</span>
                      </motion.div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Try searching with different keywords
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Categories Section */}
                    {results.categories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                      >
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-lg">📂</span>
                          Categories ({results.categories.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                          {results.categories.map((category, index) => (
                            <motion.div
                              key={category.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <SearchCategoryCard category={category} onClick={onClose} />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Products Section */}
                    {results.products.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                      >
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-lg">📦</span>
                          Products ({results.products.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                          {results.products.map((product, index) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="cursor-pointer"
                            >
                              <ProductCard productData={product} />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer - Fixed */}
              {(results.products.length > 0 || results.categories.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 p-2 sm:p-3 lg:p-4 bg-gray-50/50 dark:bg-gray-800/50"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                      Found {results.products.length} products{results.categories.length > 0 && `, ${results.categories.length} categories`}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SimpleSearchModal;
