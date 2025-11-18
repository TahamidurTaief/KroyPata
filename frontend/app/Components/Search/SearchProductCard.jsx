'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { WholesalePricingDisplay, WholesalePricingBadge } from '../Common/WholesalePricingNew';
import Tk_icon from '../Common/Tk_icon';

const SearchProductCard = ({ product, index = 0 }) => {
  // Generate slug from product data if not available
  const productSlug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Helper function to safely convert price to number
  const parsePrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 0 : numPrice;
  };
  
  // Helper function to safely parse rating
  const parseRating = (rating) => {
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? 0 : Math.max(0, Math.min(5, numRating));
  };
  
  // Helper function to safely extract text from object or string
  const safeText = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return value.name || value.title || '';
    }
    return '';
  };
  
  const rating = parseRating(product.rating);
  
  // Determine stock status
  const isInStock = product.inStock !== false && 
                   product.stock !== 0 && 
                   product.stock !== '0' && 
                   (!product.stock || parseInt(product.stock) > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="w-full"
    >
      <Link href={`/products/${productSlug}`} className="block">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 group">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative w-20 h-20 flex-shrink-0">
              {(product.image || product.image_url || product.thumbnail_url) ? (
                <Image
                  src={product.image || product.image_url || product.thumbnail_url}
                  alt={safeText(product.name) || 'Product'}
                  fill
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 80px, 80px"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📦</span>
                </div>
              )}
              
              {/* Wholesale pricing badge */}
              <div className="absolute -top-2 -right-2">
                <WholesalePricingBadge 
                  product={product}
                  hideUnavailableOnUnauthenticated={false}
                  forceShowUnavailable={false}
                />
              </div>
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Out of Stock</span>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {safeText(product.name) || 'Unnamed Product'}
              </h3>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 capitalize">
                {safeText(product.category) || safeText(product.sub_category) || 'Uncategorized'}
              </p>
              
              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({rating.toFixed(1)})</span>
                </div>
              )}
              
              {/* Enhanced Price Display with Wholesale Logic */}
              <div className="mb-2">
                <WholesalePricingDisplay 
                  product={product} 
                  size="medium"
                  showLabels={true}
                  hideUnavailableOnUnauthenticated={false}
                  forceShowUnavailable={false}
                  showOnlyPrimaryPrice={false}
                />
              </div>
              
              {/* Stock Status */}
              <div className="mt-2">
                {isInStock ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default SearchProductCard;
