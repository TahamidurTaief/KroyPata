"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getProducts, getCategories } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import ProductCard from "@/app/Components/Common/ProductCard";
import SkeletonCard from "@/app/Components/Common/SkeletonCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryBasedSection = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch top 3 categories on mount
  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const categoriesData = await getCategories();
        const topCategories = categoriesData.slice(0, 3);
        setCategories(topCategories);

        // Fetch products for each category
        const productsPromises = topCategories.map(async (category) => {
          const productsData = await getProducts({ category: category.slug, page_size: 12 });
          return { slug: category.slug, products: productsData?.results || [] };
        });

        const productsResults = await Promise.all(productsPromises);
        const productsMap = {};
        productsResults.forEach(({ slug, products }) => {
          productsMap[slug] = products;
        });

        setCategoryProducts(productsMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchTopCategories();
  }, []);

  const handleCategoryClick = useCallback((categorySlug) => {
    router.push(`/products?category=${categorySlug}`);
  }, [router]);

  return (
    <section className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-slate-900 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 md:mb-8 lg:mb-10 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Featured <span className="text-sky-500">Collections</span>
          </h2>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our top categories with curated products
          </p>
        </div>

        {/* Category Sections */}
        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
          ) : (
            categories.map((category, index) => (
              <CategoryProductCarousel
                key={category.id}
                category={category}
                products={categoryProducts[category.slug] || []}
                index={index}
                onCategoryClick={handleCategoryClick}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// Product Carousel Component for each category
const CategoryProductCarousel = ({ category, products, index, onCategoryClick }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = React.useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newPosition = direction === "left" 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    handleScroll();
    const carousel = scrollContainerRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      return () => {
        carousel.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [products]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <motion.button
          onClick={() => onCategoryClick(category.slug)}
          whileHover={{ x: 5 }}
          className="group flex items-center gap-2 md:gap-3"
        >
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors">
            <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent group-hover:from-sky-600 group-hover:via-blue-600 group-hover:to-indigo-600">
              {category.name}'s
            </span>
            <span className="ml-2">products</span>
          </h3>
          <motion.span
            initial={{ x: 0, opacity: 0 }}
            whileHover={{ x: 5, opacity: 1 }}
            className="text-sky-500 dark:text-sky-400 text-xl md:text-2xl font-bold"
          >
            →
          </motion.span>
        </motion.button>

        {/* Scroll Buttons - Desktop Only */}
        {products.length > 5 && (
          <div className="hidden lg:flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full transition-all shadow-md ${
                canScrollLeft
                  ? "bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full transition-all shadow-md ${
                canScrollRight
                  ? "bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Products Grid/Carousel - Responsive */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 lg:overflow-x-auto lg:flex lg:scrollbar-hide lg:scroll-smooth pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.length > 0 ? (
          products.map((product, idx) => (
            <div key={product.id} className="h-full lg:flex-shrink-0 lg:w-[200px] xl:w-[220px]">
              <ProductCard productData={product} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-base md:text-lg">No products available in this category</p>
          </div>
        )}
      </div>

      {/* Scroll Indicator Dots (Mobile/Tablet) */}
      {products.length > 4 && (
        <div className="flex justify-center mt-4 lg:hidden gap-1.5">
          {Array.from({ length: Math.min(5, Math.ceil(products.length / 2)) }).map((_, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CategoryBasedSection;
