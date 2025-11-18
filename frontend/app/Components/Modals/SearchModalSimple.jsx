'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for testing
const mockProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    rating: 4.5,
    inStock: true,
    discount: "31% OFF"
  },
  {
    id: 2,
    name: "Gaming Keyboard",
    category: "Gaming",
    price: 159.99,
    originalPrice: 199.99,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
    rating: 4.8,
    inStock: true,
    discount: "20% OFF"
  }
];

const ProductCard = ({ product }) => {
  return (
    <motion.div
      className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="256px"
            />
            
            {/* Discount Badge */}
            {product.discount && (
              <span className="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                {product.discount}
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {product.category}
            </span>
            
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mb-3">
              <span className="text-yellow-400">★</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.rating}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <button
              className={`w-full py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                product.inStock
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const SearchModal = ({ isOpen, onClose, searchQuery }) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const filteredProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(filteredProducts);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-4 sm:inset-x-8 md:inset-x-16 lg:inset-x-32 xl:inset-x-48 bottom-20 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Search Results
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? `Results for "${searchQuery}"` : 'Start typing to search...'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-6">
                    <div className="flex items-center justify-center h-32">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 dark:text-gray-400">Searching...</span>
                      </div>
                    </div>
                  </div>
                ) : !searchQuery ? (
                  <div className="p-6">
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Start your search
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Type in the search box above to find products
                      </p>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-6">
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search terms
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Products ({results.length})
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                      {results.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {results.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Found {results.length} products
                    </div>
                    <button
                      onClick={() => {
                        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View All Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
