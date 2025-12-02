"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { searchProductsAndCategories } from "@/app/lib/searchApi";
import { useAuth } from "@/app/contexts/AuthContext";
import Tk_icon from "./Common/Tk_icon";

export default function SearchDropdown({ 
  searchQuery, 
  onSearchChange, 
  onClose,
  placeholder = "Search for products..." 
}) {
  const { user } = useAuth();
  const isWholesaler = user?.user_type === 'WHOLESALER';
  const [results, setResults] = useState({ products: [], categories: [], brands: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Perform search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults({ products: [], categories: [], brands: [] });
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchProductsAndCategories(searchQuery);
        
        if (searchResults.error) {
          console.error('Search error:', searchResults.error);
          setResults({ products: [], categories: [], brands: [] });
        } else {
          // Extract unique brands from products
          const brands = [...new Set(
            (searchResults.products || [])
              .map(p => p.brand_name)
              .filter(Boolean)
          )].slice(0, 3); // Limit to 3 brands

          setResults({
            products: searchResults.products || [],
            categories: searchResults.categories || [],
            brands
          });
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults({ products: [], categories: [], brands: [] });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const hasResults = results.products.length > 0 || results.categories.length > 0 || results.brands.length > 0;

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative flex items-center border border-[var(--border)] rounded-full bg-[var(--muted)] focus-within:bg-[var(--card)] focus-within:border-[var(--muted-foreground)] transition-all">
        <svg 
          className="absolute left-4 w-5 h-5 text-[var(--muted-foreground)]"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <input 
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (e.target.value.trim()) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (searchQuery.trim() && hasResults) {
              setIsOpen(true);
            }
          }}
          className="w-full h-11 pl-11 pr-14 rounded-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)] text-[var(--foreground)]"
        />
        
        {/* Clear Button */}
        {searchQuery && (
          <button 
            onClick={() => {
              onSearchChange("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-12 w-5 h-5 rounded-full bg-[var(--muted)] hover:bg-[var(--muted)]/80 flex items-center justify-center transition-colors"
          >
            <span className="text-xs">✕</span>
          </button>
        )}
        
        {/* Search Button */}
        <Link
          href={searchQuery.trim() ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products'}
          onClick={() => setIsOpen(false)}
          className="absolute right-1 h-9 w-9 bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] text-[var(--card)] rounded-full flex items-center justify-center transition-all flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && searchQuery.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Searching...</p>
              </div>
            ) : !hasResults ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm font-medium text-[var(--foreground)]">No results found</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Categories */}
                {results.categories.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                      Categories
                    </p>
                    <div className="space-y-1">
                      {results.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories?category=${encodeURIComponent(category.slug || category.name)}`}
                          onClick={() => {
                            setIsOpen(false);
                            onSearchChange("");
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--muted)] transition-colors group"
                        >
                          {category.image_url || category.image ? (
                            <Image 
                              src={category.image_url || category.image} 
                              width={24} 
                              height={24} 
                              alt={category.name} 
                              className="rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {results.brands.length > 0 && (
                  <div className="px-3 py-2 border-t border-[var(--border)]">
                    <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                      Brands
                    </p>
                    <div className="space-y-1">
                      {results.brands.map((brand, idx) => (
                        <Link
                          key={idx}
                          href={`/products?brand=${encodeURIComponent(brand)}`}
                          onClick={() => {
                            setIsOpen(false);
                            onSearchChange("");
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--muted)] transition-colors group"
                        >
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-300">
                              {brand.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {brand}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {results.products.length > 0 && (
                  <div className="px-3 py-2 border-t border-[var(--border)]">
                    <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                      Products
                    </p>
                    <div className="space-y-1">
                      {results.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            setIsOpen(false);
                            onSearchChange("");
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--muted)] transition-colors group"
                        >
                          {product.image_url || product.images?.[0]?.image ? (
                            <Image 
                              src={product.image_url || product.images[0].image} 
                              width={40} 
                              height={40} 
                              alt={product.name} 
                              className="rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-[var(--muted)] flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              {product.brand_name && (
                                <span className="text-[var(--muted-foreground)]">{product.brand_name}</span>
                              )}
                              {/* Price with Tk_icon */}
                              <div className="flex items-center gap-0.5">
                                {isWholesaler && product.wholesale_price && parseFloat(product.wholesale_price) > 0 ? (
                                  <>
                                    <Tk_icon size={12} className="text-blue-600 dark:text-blue-400" />
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                      {parseFloat(product.wholesale_price).toFixed(2)}
                                    </span>
                                    <span className="text-[9px] text-blue-600 dark:text-blue-400 ml-0.5">WSL</span>
                                  </>
                                ) : (
                                  <>
                                    <Tk_icon size={12} className="text-[var(--muted-foreground)]" />
                                    <span className="text-[var(--muted-foreground)] font-medium">
                                      {product.discount_price 
                                        ? parseFloat(product.discount_price).toFixed(2)
                                        : parseFloat(product.price).toFixed(2)
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View All Results */}
                <div className="px-3 py-2 border-t border-[var(--border)]">
                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => {
                      setIsOpen(false);
                      onSearchChange("");
                    }}
                    className="block w-full px-3 py-2 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    View all results for "{searchQuery}"
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
