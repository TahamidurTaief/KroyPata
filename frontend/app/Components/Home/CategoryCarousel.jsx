"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SubcategoryModal from "./SubcategoryModal";

// Skeleton Loader Component
const CategorySkeleton = () => {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-[180px]"
        >
          <div className="bg-[var(--card)] rounded-lg overflow-hidden border border-[var(--color-border)]">
            {/* Image skeleton */}
            <div className="w-full h-32 bg-[var(--muted)] animate-pulse"></div>
            {/* Title skeleton */}
            <div className="p-3 space-y-2">
              <div className="h-4 bg-[var(--muted)] rounded animate-pulse"></div>
              <div className="h-3 w-2/3 bg-[var(--muted)] rounded animate-pulse mx-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const scrollContainerRef = useRef(null);
  const cardRefs = useRef({});

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.chinakroy.com/api/products/categories/"
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        // Handle both array and object responses
        const categoriesData = Array.isArray(data) ? data : (data.results || data.categories || []);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching categories:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Scroll handler
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  // Handle mouse enter on category card
  const handleMouseEnter = (category, event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    
    setModalPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY,
    });
    
    setHoveredCategory(category);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredCategory(null);
  };

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-red-500 dark:text-red-400">
            Error loading categories: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-8 bg-[var(--background)]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-1">
              Shop by Category
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Explore our wide range of product categories
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-[var(--card)] border border-[var(--color-border)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-[var(--card)] border border-[var(--color-border)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Cards Container */}
        {loading ? (
          <CategorySkeleton />
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {Array.isArray(categories) && categories.map((category) => (
              <div
                key={category.id}
                ref={(el) => (cardRefs.current[category.id] = el)}
                onMouseEnter={(e) => handleMouseEnter(category, e)}
                onMouseLeave={handleMouseLeave}
                className="flex-shrink-0 w-[180px] group cursor-pointer"
              >
                <div className="bg-[var(--card)] rounded-lg overflow-hidden border border-[var(--color-border)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {/* Category Image */}
                  <div className="relative w-full h-32 bg-[var(--card)] overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]">
                        <span className="text-3xl font-bold text-[var(--muted-foreground)]">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Category Name */}
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-300 line-clamp-2">
                      {category.name}
                    </h3>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {category.subcategories.length} subcategories
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show message if no categories */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[var(--muted-foreground)]">
              No categories available at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Subcategory Modal */}
      {hoveredCategory && hoveredCategory.subcategories && hoveredCategory.subcategories.length > 0 && (
        <SubcategoryModal
          category={hoveredCategory}
          position={modalPosition}
          onClose={handleMouseLeave}
        />
      )}
    </section>
  );
};

export default CategoryCarousel;
