"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";

/**
 * CategoryCarousel Component
 * 
 * A modern, responsive carousel for product category filtering.
 * Features:
 * - Horizontal scrolling carousel with navigation arrows
 * - "All Products" option to show all items
 * - Fixed-height category images with optimized loading
 * - Smooth scroll behavior with snap points
 * - Mobile-responsive with touch scrolling
 * - SEO-friendly with semantic HTML and proper ARIA labels
 * 
 * @param {Array} categories - Array of category objects with id, name, slug, and image
 * @param {Function} onCategoryChange - Callback when category selection changes
 * @param {String} selectedCategory - Currently selected category slug
 */
const CategoryCarousel = ({ categories = [], onCategoryChange, selectedCategory = "" }) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide navigation arrows
  const checkScrollPosition = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        carousel.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [categories]);

  // Smooth scroll navigation
  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 200; // Adjusted for smaller card width
      const newScrollLeft = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (categorySlug) => {
    if (onCategoryChange) {
      onCategoryChange(categorySlug);
    }
  };

  return (
    <section className="w-full bg-[var(--color-second-bg)] py-4 md:py-6">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-4 md:mb-5">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
            Explore <span className="text-[var(--primary)]">Products</span>
          </h2>
          <p className="mt-1 text-xs md:text-sm text-[var(--muted-foreground)]">
            Browse our curated collection by category
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Navigation Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--card)] shadow-lg rounded-full p-1.5 md:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-[var(--foreground)]" />
            </button>
          )}

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-2 md:gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* All Products Card */}
            <button
              onClick={() => handleCategoryClick("")}
              className={`flex-shrink-0 snap-start group/card cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedCategory === "" 
                  ? "ring-2 ring-[var(--primary)] shadow-lg shadow-[var(--primary)]/50" 
                  : "hover:shadow-xl"
              }`}
              aria-label="Show all products"
              aria-pressed={selectedCategory === ""}
            >
              <div className="flex flex-col items-center w-[80px] md:w-[90px] lg:w-[100px]">
                {/* Image Container */}
                <div className={`relative w-[20px] h-[20px] md:w-[30px] md:h-[30px] lg:w-[50px] lg:h-[50px] rounded-full overflow-hidden mb-2 ${
                  selectedCategory === "" 
                    ? "bg-[var(--primary)]" 
                    : "bg-[var(--primary)]/80"
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Grid3x3 className="w-8 h-8 md:w-10 md:h-10 text-white opacity-90" strokeWidth={1.5} />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors duration-300" />
                </div>
                
                {/* Category Name */}
                <h3 className={`text-xs md:text-sm font-semibold text-center px-1 transition-colors duration-300 line-clamp-2 ${
                  selectedCategory === "" 
                    ? "text-[var(--primary)]" 
                    : "text-[var(--foreground)] group-hover/card:text-[var(--primary)]"
                }`}>
                  All Products
                </h3>
              </div>
            </button>

            {/* Category Cards */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`flex-shrink-0 snap-start group/card cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.slug 
                    ? "ring-2 ring-[var(--primary)] shadow-lg shadow-[var(--primary)]/50" 
                    : "hover:shadow-xl"
                }`}
                aria-label={`Filter by ${category.name}`}
                aria-pressed={selectedCategory === category.slug}
              >
                <div className="flex flex-col items-center w-[30px] md:w-[40px] lg:w-[60px]">
                  {/* Image Container */}
                  <div className="relative w-[20px] h-[20px] md:w-[30px] md:h-[30px] lg:w-[50px] lg:h-[50px] rounded-full overflow-hidden mb-2 bg-[var(--card)]">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={`${category.name} category`}
                        fill
                        sizes="(max-width: 768px) 80px, (max-width: 1024px) 90px, 100px"
                        className="object-cover transition-transform duration-300 group-hover/card:scale-110"
                        loading="lazy"
                        quality={85}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-border)]">
                        <span className="text-2xl md:text-3xl opacity-30">📦</span>
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors duration-300" />
                    
                    {/* Selected indicator */}
                    {selectedCategory === category.slug && (
                      <div className="absolute top-1 right-1 bg-[var(--primary)] text-white rounded-full p-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Category Name */}
                  <h3 className={`text-xs md:text-sm font-semibold text-center px-1 transition-colors duration-300 line-clamp-1 ${
                    selectedCategory === category.slug 
                      ? "text-[var(--primary)]" 
                      : "text-[var(--foreground)] group-hover/card:text-[var(--primary)]"
                  }`}>
                    {category.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          {/* Right Navigation Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--card)] shadow-lg rounded-full p-1.5 md:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--foreground)]" />
            </button>
          )}
        </div>

        {/* Scroll Indicator Dots (Mobile) */}
        <div className="flex justify-center mt-3 md:hidden gap-1.5">
          {categories.length > 3 && Array.from({ length: Math.min(5, categories.length) }).map((_, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"
            />
          ))}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default CategoryCarousel;
