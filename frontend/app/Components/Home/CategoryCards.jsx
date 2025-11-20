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
    <section 
      className="container mx-auto py-12 px-4 sm:px-6 lg:px-8"
      aria-labelledby="category-section-title"
      role="region"
    >
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 xl:mb-12">
        <div>
          <h2 
            id="category-section-title"
            className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold text-[var(--color-text-primary)]"
          >
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Category</span>
          </h2>
          <p className="mt-2 text-sm md:text-base text-[var(--color-text-secondary)]">
            Explore our wide range of products organized by category
          </p>
        </div>
        <Link
          href="/categories"
          className="group mt-5 sm:mt-0 w-auto text-end justify-end flex flex-nowrap items-center text-sm md:text-base font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
          aria-label="View all product categories"
        >
          View All
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
              className={`group relative bg-gradient-to-br ${gradient} rounded-2xl border ${border} p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl overflow-hidden`}
              onClick={() => handleCategoryClick(category.slug)}
            >
              {/* Animated Background Overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Category Name Section */}
              <div className="mb-4 relative z-10">
                <h3 className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.subcategories?.length || 0} subcategories
                </p>
              </div>

              {/* Images Grid: First image takes full height, 2nd and 3rd stacked */}
              <div className="grid grid-cols-2 gap-3 relative z-10 h-48">
                {/* First Image - Full Height */}
                <motion.div
                  className="row-span-2 relative overflow-hidden rounded-xl shadow-md cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={(e) => handleSubcategoryClick(e, subcategoryData[0]?.slug, category.slug)}
                >
                  {subcategoryData[0]?.src ? (
                    <Image
                      src={subcategoryData[0].src}
                      alt={`${subcategoryData[0].alt} - ${category.name} subcategory`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                  {subcategoryData[0]?.slug && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  )}
                  {subcategoryData[0]?.name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{subcategoryData[0].name}</p>
                    </div>
                  )}
                </motion.div>

                {/* Second Image - Top Right */}
                <motion.div
                  className="relative overflow-hidden rounded-xl shadow-md cursor-pointer aspect-square"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={(e) => handleSubcategoryClick(e, subcategoryData[1]?.slug, category.slug)}
                >
                  {subcategoryData[1]?.src ? (
                    <Image
                      src={subcategoryData[1].src}
                      alt={`${subcategoryData[1].alt} - ${category.name} subcategory`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 flex items-center justify-center">
                      <span className="text-purple-400 dark:text-purple-500 text-sm">No Image</span>
                    </div>
                  )}
                  {subcategoryData[1]?.slug && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  )}
                  {subcategoryData[1]?.name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{subcategoryData[1].name}</p>
                    </div>
                  )}
                </motion.div>

                {/* Third Image - Bottom Right */}
                <motion.div
                  className="relative overflow-hidden rounded-xl shadow-md cursor-pointer aspect-square"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={(e) => handleSubcategoryClick(e, subcategoryData[2]?.slug, category.slug)}
                >
                  {subcategoryData[2]?.src ? (
                    <Image
                      src={subcategoryData[2].src}
                      alt={`${subcategoryData[2].alt} - ${category.name} subcategory`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center">
                      <span className="text-blue-400 dark:text-blue-500 text-sm">No Image</span>
                    </div>
                  )}
                  {subcategoryData[2]?.slug && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  )}
                  {subcategoryData[2]?.name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{subcategoryData[2].name}</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Hover Action Button */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-gray-900 via-white/90 dark:via-gray-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center z-20"
                initial={{ opacity: 0, y: 10 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-full shadow-lg transition-all duration-300"
                >
                  Explore {category.name}
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Mobile UI - Modern Card Layout */}
      <motion.section 
        className="lg:hidden mb-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {displayedCategories.map((category, index) => {
            const subcategoryData = getSubcategoryData(category);
            const gradient = cardGradients[index % cardGradients.length];
            const border = cardBorders[index % cardBorders.length];

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileTap={{ scale: 0.95 }}
                className={`group relative bg-gradient-to-br ${gradient} rounded-xl md:rounded-2xl border ${border} p-3 md:p-4 cursor-pointer transition-all duration-300 active:shadow-xl overflow-hidden`}
                onClick={() => handleCategoryClick(category.slug)}
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-300" />

                {/* Category Name */}
                <div className="mb-3 relative z-10">
                  <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white truncate">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {category.subcategories?.length || 0} items
                  </p>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 gap-2 relative z-10 h-32 md:h-40">
                  {/* First Image - Full Height */}
                  <div
                    className="row-span-2 relative overflow-hidden rounded-lg shadow-sm active:scale-95 transition-transform duration-200"
                    onClick={(e) => handleSubcategoryClick(e, subcategoryData[0]?.slug, category.slug)}
                  >
                    {subcategoryData[0]?.src ? (
                      <Image
                        src={subcategoryData[0].src}
                        alt={`${subcategoryData[0].alt} - ${category.name} subcategory`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                    {subcategoryData[0]?.name && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                        <p className="text-white text-[10px] md:text-xs font-medium truncate">
                          {subcategoryData[0].name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Second Image - Top Right */}
                  <div
                    className="relative overflow-hidden rounded-lg shadow-sm aspect-square active:scale-95 transition-transform duration-200"
                    onClick={(e) => handleSubcategoryClick(e, subcategoryData[1]?.slug, category.slug)}
                  >
                    {subcategoryData[1]?.src ? (
                      <Image
                        src={subcategoryData[1].src}
                        alt={`${subcategoryData[1].alt} - ${category.name} subcategory`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 flex items-center justify-center">
                        <span className="text-purple-400 dark:text-purple-500 text-xs">+</span>
                      </div>
                    )}
                    {subcategoryData[1]?.name && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <p className="text-white text-[9px] md:text-[10px] font-medium truncate">
                          {subcategoryData[1].name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Third Image - Bottom Right */}
                  <div
                    className="relative overflow-hidden rounded-lg shadow-sm aspect-square active:scale-95 transition-transform duration-200"
                    onClick={(e) => handleSubcategoryClick(e, subcategoryData[2]?.slug, category.slug)}
                  >
                    {subcategoryData[2]?.src ? (
                      <Image
                        src={subcategoryData[2].src}
                        alt={`${subcategoryData[2].alt} - ${category.name} subcategory`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center">
                        <span className="text-blue-400 dark:text-blue-500 text-xs">+</span>
                      </div>
                    )}
                    {subcategoryData[2]?.name && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <p className="text-white text-[9px] md:text-[10px] font-medium truncate">
                          {subcategoryData[2].name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </section>
  );
};

export default CategoryCards;