"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getProducts, getCategories, getOfferBanners } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import ProductCard from "@/app/Components/Common/ProductCard";
import SkeletonCard from "@/app/Components/Common/SkeletonCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useThemePlaceholder } from "@/app/hooks/useThemeImage";

const CategoryBasedSection = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [verticalBanners, setVerticalBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch top 3 categories and vertical banners on mount
  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const [categoriesData, bannersData] = await Promise.all([
          getCategories(),
          getOfferBanners()
        ]);
        
        console.log("📦 Categories Data:", categoriesData);
        console.log("🎨 Banners Data:", bannersData);
        
        const topCategories = categoriesData.slice(0, 3);
        setCategories(topCategories);

        // Filter vertical banners - get all active vertical banners
        const verticalBannersFiltered = (bannersData?.results || bannersData || [])
          .filter(banner => banner.banner_type === 'vertical' && banner.is_active);
        
        console.log("🎨 Filtered Vertical Banners:", verticalBannersFiltered);
        setVerticalBanners(verticalBannersFiltered);

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
    <section className="w-full bg-[var(--color-background)] py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 md:mb-8 lg:mb-10 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--foreground)]">
            Featured <span className="text-[var(--primary)]">Collections</span>
          </h2>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Discover our top categories with curated products
          </p>
        </div>

        {/* Category Sections */}
        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : (
            categories.map((category, index) => (
              <CategoryProductCarousel
                key={category.id}
                category={category}
                products={categoryProducts[category.slug] || []}
                verticalBanner={verticalBanners[index] || null}
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
const CategoryProductCarousel = ({ category, products, verticalBanner, index, onCategoryClick }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = React.useRef(null);
  const { placeholderUrl } = useThemePlaceholder();

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
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--foreground)] transition-colors">
            <span className="text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              {category.name}'s
            </span>
            <span className="ml-2">products</span>
          </h3>
          <motion.span
            initial={{ x: 0, opacity: 0 }}
            whileHover={{ x: 5, opacity: 1 }}
            className="text-[var(--primary)] text-xl md:text-2xl font-bold"
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
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
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
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Products Grid/Carousel - Responsive with Fixed Banner */}
      <div className="relative">
        {/* Fixed Vertical Banner - Always shown on desktop, stays in place */}
        <VerticalBannerCard 
          banner={verticalBanner} 
          placeholderUrl={placeholderUrl}
        />

        {/* Scrollable Products Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 lg:overflow-x-auto lg:flex lg:scrollbar-hide lg:scroll-smooth lg:ml-[220px] xl:ml-[240px] pb-2"
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
            <div className="col-span-full text-center py-12 text-[var(--muted-foreground)]">
              <p className="text-base md:text-lg">No products available in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator Dots (Mobile/Tablet) */}
      {products.length > 4 && (
        <div className="flex justify-center mt-4 lg:hidden gap-1.5">
          {Array.from({ length: Math.min(5, Math.ceil(products.length / 2)) }).map((_, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Vertical Banner Card Component with fallback - Fixed Position
const VerticalBannerCard = ({ banner, placeholderUrl }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get the banner image URL with priority: image > image_url > effective_image_light/dark
  const getBannerImageUrl = () => {
    if (!banner) return null;
    
    return banner.image || 
           banner.image_url || 
           banner.effective_image_light || 
           banner.effective_image_dark ||
           banner.image_light_upload ||
           banner.image_dark_upload ||
           null;
  };

  const bannerImageUrl = getBannerImageUrl();
  const displayImageUrl = imageError ? placeholderUrl : (bannerImageUrl || placeholderUrl);
  
  // Determine if this is a clickable banner
  const isClickable = banner && banner.button_url;
  
  const bannerContent = (
    <>
      <Image
        src={displayImageUrl}
        alt={banner?.alt_text || banner?.title || 'Category Banner'}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 1024px) 0px, (max-width: 1280px) 200px, 220px"
        onError={() => setImageError(true)}
        priority={false}
      />
      
      {/* Overlay with title if exists and has actual banner */}
      {banner && banner.title && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
          <div className="text-white">
            <h4 className="font-bold text-lg mb-1">{banner.title}</h4>
            {banner.discount_text && (
              <p className="text-sm font-semibold text-[var(--accent)]">{banner.discount_text}</p>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="hidden lg:block lg:absolute lg:left-0 lg:top-0 lg:z-10 lg:w-[200px] xl:w-[220px] h-[400px] relative overflow-hidden rounded-xl shadow-lg group cursor-pointer">
      {isClickable ? (
        <a 
          href={banner.button_url} 
          target={banner.button_url?.startsWith('http') ? '_blank' : '_self'}
          rel={banner.button_url?.startsWith('http') ? 'noopener noreferrer' : ''}
          className="block w-full h-full"
        >
          {bannerContent}
        </a>
      ) : (
        <div className="block w-full h-full">
          {bannerContent}
        </div>
      )}
    </div>
  );
};

export default CategoryBasedSection;
