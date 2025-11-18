"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCategories, getProducts, getSubCategories } from "@/app/lib/api";
import CategoryCard from "@/app/Components/Common/CategoryCard";

// A self-contained component to handle image loading and fallbacks gracefully.
const SubcategoryImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(!src);

  if (hasError) {
    return (
      <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[var(--color-muted-bg)] dark:to-[#2a3441] flex items-center justify-center shadow-inner">
        <span className="text-xs text-center text-gray-500 dark:text-[var(--color-text-secondary)]">
          No Image
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className="aspect-square w-full object-cover rounded-xl bg-white shadow-inner"
      width={80}
      height={80}
      unoptimized
      onError={() => setHasError(true)}
    />
  );
};

const CategoryCards = ({ categories = [] }) => {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);

  // Safety check for categories
  if (!Array.isArray(categories)) {
    console.warn('CategoryCards: categories prop is not an array', categories);
    return (
      <section className="py-16 px-4 bg-[var(--color-background)]">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-[var(--color-text-primary)]">
            Browse by <span className="text-sky-500">Category</span>
          </h2>
          <div className="text-center text-[var(--color-text-secondary)]">
            <p>Categories are loading...</p>
          </div>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8,
      },
    },
  };

  const displayedCategories = categories.slice(0, 8);

  const getSubcategoryData = (category) => {
    const subcategories = category.subcategories || [];
    const data = [];
    for (let i = 0; i < Math.min(3, subcategories.length); i++) {
      const sub = subcategories[i];
      data.push({
        src: sub.image_url && sub.image_url.trim() !== 'null' ? sub.image_url : null,
        alt: sub.name || 'Subcategory',
        name: sub.name || 'Unknown',
        slug: sub.slug,
        fullSubcategory: sub,
      });
    }
    while (data.length < 3) {
      data.push({ src: null, alt: 'Placeholder', name: '', slug: null, fullSubcategory: null });
    }
    return data;
  };

  const handleCategoryClick = (categorySlug) => {
    router.push(`/products?category=${encodeURIComponent(categorySlug)}`);
  };

  const handleSubcategoryClick = (e, subcategorySlug, categorySlug) => {
    e.stopPropagation();
    if (subcategorySlug) {
      router.push(`/products?category=${encodeURIComponent(categorySlug)}&subcategory=${encodeURIComponent(subcategorySlug)}`);
    }
  };

  const cardGradients = [
    "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
    "from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
    "from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20",
    "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    "from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20",
  ];

  const cardBorders = [
    "border-blue-200 dark:border-blue-700/50",
    "border-purple-200 dark:border-purple-700/50",
    "border-amber-200 dark:border-amber-700/50",
    "border-emerald-200 dark:border-emerald-700/50",
    "border-violet-200 dark:border-violet-700/50",
    "border-rose-200 dark:border-rose-700/50",
    "border-green-200 dark:border-green-700/50",
    "border-indigo-200 dark:border-indigo-700/50",
  ];

  return (
    <section className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 xl:mb-12">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold text-[var(--color-text-primary)]">
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Category</span>
          </h2>
          <p className="mt-2 text-sm md:text-base text-[var(--color-text-secondary)]">
            Explore our wide range of products organized by category
          </p>
        </div>
        <Link
          href="/categories"
          className="group mt-5 sm:mt-0 w-auto text-end justify-end flex flex-nowrap items-center text-sm md:text-base font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
        >
          View All
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {/* Desktop UI - Category Cards */}
      <motion.div
        className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {displayedCategories.map((category, index) => {
          const subcategoryData = getSubcategoryData(category);
          const gradient = cardGradients[index % cardGradients.length];
          const border = cardBorders[index % cardBorders.length];

          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredCard(category.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`group relative bg-gradient-to-br ${gradient} rounded-2xl border ${border} p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl overflow-hidden`}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white truncate">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {category.subcategories?.length || 0} subcategories
                  </p>
                </div>
                <motion.span
                  className="text-2xl text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2"
                  animate={{ x: hoveredCard === category.id ? 5 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  →
                </motion.span>
              </div>

              <div className="grid grid-cols-3 gap-3 relative z-10">
                {subcategoryData.map((sub, subIndex) => (
                  <div
                    key={`${category.id}-${sub.slug || subIndex}`}
                    className={`flex flex-col items-center ${sub.slug ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={(e) => handleSubcategoryClick(e, sub.slug, category.slug)}
                  >
                    <motion.div 
                      className="w-full relative"
                      whileHover={sub.slug ? { scale: 1.1, y: -3 } : {}}
                      whileTap={sub.slug ? { scale: 0.95 } : {}}
                    >
                      <SubcategoryImage src={sub.src} alt={sub.alt} />
                      {sub.slug && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300" />
                      )}
                    </motion.div>
                    {sub.name && (
                      <p className="text-xs text-center mt-2 text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 truncate w-full px-1">
                        {sub.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <motion.div
                className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center z-20"
                initial={{ opacity: 0, y: 10 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full shadow-md transition-colors"
                >
                  View Category
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>



      {/* Mobile UI - Exact same layout as /categories page */}
      <section className="lg:hidden mb-12">
        {/* <h2 className="text-2xl md:text-2xl lg:text-3xl font-bold mb-6 text-[var(--color-text-primary)]">
          Top <span className="text-sky-500">Categories</span>
        </h2> */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.slice(0, 8).map((category) => {
            try {
              // Transform data to match CategoryCard component props exactly like /categories page
              const categoryData = {
                id: category.slug || category.id, // Use slug for routing consistency
                title: category.name || 'Unknown Category',
                images: (() => {
                  // Collect real images only (same logic as categories page)
                  const images = [];
                  if (category?.image_url) images.push(category.image_url);
                  if (Array.isArray(category?.subcategories)) {
                    for (const sc of category.subcategories) {
                      if (sc?.image_url && images.length < 4) images.push(sc.image_url);
                    }
                  }
                  // Pad with nulls so UI can render placeholders (gradients) instead of dummy images
                  while (images.length < 4) images.push(null);
                  return images.slice(0, 4);
                })(),
                total_products: category.total_products ?? 0,
                sub_categories: category.sub_category_count ?? (category.subcategories?.length || 0)
              };
              
              return (
                <CategoryCard
                  key={category.id}
                  {...categoryData}
                />
              );
            } catch (error) {
              console.error('Error rendering category:', category, error);
              return null;
            }
          })}
        </div>
      </section>
    </section>
  );
};

export default CategoryCards;
