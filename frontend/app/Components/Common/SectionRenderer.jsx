"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SectionRenderer = ({ page = 'home', className = '' }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sections/sections/by_page/?page=${page}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sections: ${response.status}`);
        }
        
        const data = await response.json();
        setSections(data || []);
      } catch (err) {
        console.error('Error fetching sections:', err);
        setError(err.message);
        setSections([]); // Set empty array as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [page]);

  if (loading) {
    return (
      <div className={`sections-container ${className}`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading sections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn(`SectionRenderer: Error loading sections for page "${page}":`, error);
    return null; // Silently fail to not break the page
  }

  if (!sections || sections.length === 0) {
    // Don't show anything if no sections are configured for this page
    return null;
  }

  return (
    <div className={`sections-container space-y-8 md:space-y-12 ${className}`}>
      {sections.map((pageSection, index) => (
        <Section 
          key={pageSection.id || index}
          pageSection={pageSection}
          index={index}
        />
      ))}
    </div>
  );
};

const Section = ({ pageSection, index }) => {
  const {
    section_info,
    items = [],
    show_title = true,
    show_subtitle = true,
    show_view_all = true,
    items_per_row = 4
  } = pageSection;

  const {
    name,
    title_display,
    subtitle_display,
    section_type,
    discount_percentage
  } = section_info || {};

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Grid classes based on items_per_row
  const getGridClass = () => {
    switch (items_per_row) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      case 6: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.section 
      className="section-wrapper"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Section Header */}
      <div className="section-header mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1">
            {show_title && title_display && (
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                  {title_display}
                </h2>
                
                {/* Special offer badge */}
                {section_type === 'special_offer' && discount_percentage && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    {discount_percentage}% OFF
                  </span>
                )}
              </div>
            )}
            
            {show_subtitle && subtitle_display && (
              <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed">
                {subtitle_display}
              </p>
            )}
          </div>
          
          {/* View All Button */}
          {show_view_all && (
            <div className="flex-shrink-0">
              <Link 
                href={`/products?section=${encodeURIComponent(name || '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
              >
                View All
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Section Items Grid */}
      <motion.div 
        className={`grid gap-4 md:gap-6 ${getGridClass()}`}
        variants={containerVariants}
      >
        {items.map((item, itemIndex) => (
          <motion.div 
            key={item.id || itemIndex}
            variants={itemVariants}
            className="h-full"
          >
            {/* Product Card */}
            {item.product && (
              <ProductCard 
                productData={{
                  ...item.product,
                  // Override with section-specific data if available
                  price: item.special_price || item.product.price,
                  discount_price: item.special_price ? item.product.price : item.product.discount_price,
                  // Add section context
                  _section_context: {
                    is_featured: item.is_featured,
                    custom_title: item.custom_title,
                    custom_description: item.custom_description,
                    section_name: section_info?.name,
                    section_type: section_info?.section_type
                  }
                }}
              />
            )}
            
            {/* Category Card */}
            {item.category && (
              <CategoryCard
                id={item.category.id}
                title={item.custom_title || item.category.name}
                images={[
                  item.category.image,
                  // Add some product images from this category if available
                  ...(item.category.sample_products?.slice(0, 3).map(p => p.thumbnail_url) || [])
                ]}
                total_products={item.category.total_products || 0}
                sub_categories={item.category.sub_category_count || 0}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Section Footer - Additional info for special offers */}
      {section_type === 'special_offer' && section_info?.offer_end_date && (
        <motion.div 
          className="section-footer mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-2 text-sm text-red-700 dark:text-red-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Limited time offer ends soon!</span>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default SectionRenderer;
