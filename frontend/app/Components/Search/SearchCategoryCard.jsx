'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const SearchCategoryCard = ({ category, index = 0 }) => {
  // Helper function to safely extract text from object or string
  const safeText = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return value.name || value.title || '';
    }
    return '';
  };
  
  // Generate slug from category data if not available
  const categorySlug = category.slug || safeText(category.name)?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const getIcon = () => {
    // Only use icon from API data, no hardcoded fallbacks
    return category.icon || '📦'; // Simple default fallback
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      className="w-full"
    >
      <Link href={`/categories?category=${categorySlug}`} className="block">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700 dark:hover:to-gray-600 group">
          <div className="text-center">
            {/* Category Image or Icon */}
            <div className="relative mb-3">
              {category.image || category.image_url ? (
                <div className="relative w-12 h-12 mx-auto">
                  <Image
                    src={category.image || category.image_url}
                    alt={safeText(category.name) || 'Category'}
                    fill
                    className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                    sizes="48px"
                  />
                </div>
              ) : (
                <motion.div 
                  className="text-3xl mb-2"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  {getIcon()}
                </motion.div>
              )}
            </div>
            
            {/* Category Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {safeText(category.name) || 'Unnamed Category'}
            </h3>
            
            {/* Product Count */}
            {category.count !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.count} {category.count === 1 ? 'item' : 'items'}
              </p>
            )}
            
            {/* Subcategories count if available */}
            {category.subcategories_count && (
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                {category.subcategories_count} subcategories
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default SearchCategoryCard;
