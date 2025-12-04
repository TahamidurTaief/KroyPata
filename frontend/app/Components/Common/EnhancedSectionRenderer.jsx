"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const EnhancedSectionRenderer = ({ page = 'home', className = '' }) => {
  const [sections, setSections] = useState([]);
  const [verticalBanners, setVerticalBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL helper
  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.chinakroy.com';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = getApiBaseUrl();
        
        // Fetch sections for the page
        const sectionsResponse = await fetch(`${baseUrl}/api/sections/sections/by_page/?page=${page}`);
        const sectionsData = await sectionsResponse.json();
        
        // Fetch vertical banners
        const bannersResponse = await fetch(`${baseUrl}/api/website/offer-banners/?banner_type=vertical`);
        const bannersData = await bannersResponse.json();
        
        setSections(sectionsData || []);
        setVerticalBanners(bannersData?.results || bannersData || []);
      } catch (err) {
        console.error('Error fetching sections and banners:', err);
        setError(err.message);
        setSections([]);
        setVerticalBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  if (loading) {
    return (
      <div className={`sections-container ${className}`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <span className="ml-3 text-[var(--muted-foreground)]">Loading sections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn(`SectionRenderer: Error loading sections for page "${page}":`, error);
    return null; // Fail silently to not break the page
  }

  if (!sections || sections.length === 0) {
    return null; // No sections to render
  }

  const VerticalBanner = ({ banner }) => {
    const imageUrl = banner.image_url || (banner.image ? `${getApiBaseUrl()}${banner.image}` : null);
    
    if (!imageUrl) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-4"
      >
        <div className={`relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br ${banner.gradient_colors || 'from-amber-500 to-orange-600'} group cursor-pointer`}>
          <div className="relative h-96 w-full">
            <Image
              src={imageUrl}
              alt={banner.alt_text || banner.title || 'Vertical Banner'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            {banner.discount_text && (
              <div className="text-sm font-bold mb-1 text-[var(--accent)]">
                {banner.discount_text}
              </div>
            )}
            {banner.title && (
              <h3 className="text-lg font-bold mb-2 line-clamp-2">
                {banner.title}
              </h3>
            )}
            {banner.subtitle && (
              <p className="text-sm opacity-90 mb-3 line-clamp-2">
                {banner.subtitle}
              </p>
            )}
            {banner.button_url && (
              <Link href={banner.button_url}>
                <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors">
                  {banner.button_text || 'Shop Now'}
                </button>
              </Link>
            )}
            {banner.coupon_code && (
              <div className="mt-2 text-xs bg-[var(--accent)] text-black px-2 py-1 rounded inline-block">
                Code: {banner.coupon_code}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const Section = ({ sectionData, index }) => {
    const section = sectionData.section_info || sectionData.section || {};
    const items = sectionData.items || [];
    
    if (!items.length || !section.id) return null;

    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          staggerChildren: 0.1
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
      }
    };

    // Determine grid columns based on items per row
    const itemsPerRow = sectionData.items_per_row || 4;
    const gridCols = {
      2: 'grid-cols-2',
      3: 'grid-cols-2 sm:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    };

    return (
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mb-12"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {sectionData.show_title && section.title_display && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--foreground)]">
                {section.title_display}
              </h2>
            )}
            {sectionData.show_subtitle && section.subtitle_display && (
              <p className="text-[var(--muted-foreground)] mt-2">
                {section.subtitle_display}
              </p>
            )}
          </div>
          
          {sectionData.show_view_all && (
            <Link
              href={`/${section.section_type === 'category' ? 'categories' : 'products'}?section=${section.id}`}
              className="group flex items-center text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium transition-colors"
            >
              <span>View All</span>
              <svg
                className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Section Items Grid */}
        <motion.div
          className={`grid ${gridCols[itemsPerRow] || gridCols[4]} gap-4 md:gap-6`}
          variants={containerVariants}
        >
          {items.map((item, itemIndex) => (
            <motion.div key={item.id} variants={itemVariants}>
              {section.section_type === 'product' || section.section_type === 'special_offer' ? (
                <ProductCard 
                  productData={{
                    ...item.product,
                    // Override price if special pricing is set
                    price: item.special_price || item.product?.price,
                    // Add section-specific data
                    sectionTitle: item.custom_title,
                    sectionDescription: item.custom_description,
                    isFeatured: item.is_featured
                  }} 
                />
              ) : section.section_type === 'category' ? (
                <CategoryCard
                  id={item.category?.id || item.category?.slug}
                  title={item.custom_title || item.category?.name}
                  images={item.category?.subcategories?.map(sub => sub.image_url || sub.image).filter(Boolean) || [item.category?.image_url || item.category?.image].filter(Boolean)}
                  total_products={item.category?.total_products || 0}
                  sub_categories={item.category?.sub_category_count || 0}
                />
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    );
  };

  return (
    <div className={`sections-container ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Sections Content */}
          <div className="flex-1">
            {sections.map((sectionData, index) => (
              <Section key={sectionData.section_info?.id || sectionData.id || index} sectionData={sectionData} index={index} />
            ))}
          </div>

          {/* Vertical Banners Sidebar */}
          {verticalBanners.length > 0 && (
            <div className="hidden lg:block w-80 space-y-6">
              {verticalBanners.slice(0, 2).map((banner, index) => (
                <VerticalBanner key={banner.id} banner={banner} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSectionRenderer;
