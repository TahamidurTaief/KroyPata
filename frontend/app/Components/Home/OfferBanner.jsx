'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function OfferBanner({ offerBanners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure offerBanners is always an array
  const safeOfferBanners = Array.isArray(offerBanners) ? offerBanners : [];

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Test data for development if no banners are provided
  const testBanners = [
    {
      id: 'test-1',
      title: 'Summer Sale',
      subtitle: 'Hot deals for hot weather',
      description: 'Get up to 50% off on summer essentials. Limited time offer!',
      banner_type: 'horizontal',
      image_url_final: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
      discount_text: 'UP TO 50% OFF',
      coupon_code: 'SUMMER50',
      button_text: 'Shop Now',
      button_url: '/products?offer=summer',
      gradient_colors: 'from-amber-500 to-orange-600',
      order: 1
    },
    {
      id: 'test-2',
      title: 'Electronics Mega Sale',
      subtitle: 'Latest gadgets at unbeatable prices',
      description: 'Discover the latest electronics with amazing discounts up to 60% off!',
      banner_type: 'horizontal',
      image_url_final: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=400&fit=crop',
      discount_text: 'UP TO 60% OFF',
      coupon_code: 'TECH60',
      button_text: 'Explore Deals',
      button_url: '/products?category=electronics',
      gradient_colors: 'from-blue-500 to-indigo-600',
      order: 2
    },
    {
      id: 'test-3',
      title: 'Home & Living',
      subtitle: 'Transform your space',
      description: 'Beautiful home decor and furniture to make your house a home.',
      banner_type: 'vertical',
      image_url_final: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop',
      discount_text: 'UP TO 35% OFF',
      coupon_code: 'HOME35',
      button_text: 'Shop Home',
      button_url: '/products?category=home',
      gradient_colors: 'from-emerald-500 to-teal-600',
      order: 3
    }
  ];

  // Use test data if no banners provided (for development)
  const bannersToUse = safeOfferBanners.length > 0 ? safeOfferBanners : 
    (process.env.NODE_ENV === 'development' ? testBanners : []);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('OfferBanner Debug:', {
        offerBannersType: typeof offerBanners,
        offerBannersIsArray: Array.isArray(offerBanners),
        safeOfferBannersCount: safeOfferBanners.length,
        bannersToUseCount: bannersToUse.length,
        bannersToUseType: typeof bannersToUse,
        bannersToUseIsArray: Array.isArray(bannersToUse)
      });
    }
  }, [offerBanners, safeOfferBanners, bannersToUse]);

  // Separate banners by type for proper layout
  const { horizontalBanners, verticalBanners, mainBanners } = useMemo(() => {
    if (!Array.isArray(bannersToUse)) return { horizontalBanners: [], verticalBanners: [], mainBanners: [] };
    
    const horizontal = bannersToUse.filter(banner => banner.banner_type === 'horizontal');
    const vertical = bannersToUse.filter(banner => banner.banner_type === 'vertical');
    const main = bannersToUse.filter(banner => banner.banner_type === 'main');
    
    return {
      horizontalBanners: horizontal,
      verticalBanners: vertical,
      mainBanners: main
    };
  }, [bannersToUse]);

  // Combine horizontal and main banners for carousel (mobile)
  const carouselBanners = useMemo(() => {
    return [...horizontalBanners, ...mainBanners];
  }, [horizontalBanners, mainBanners]);

  // Handle navigation for carousel
  const nextBanner = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === carouselBanners.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevBanner = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselBanners.length - 1 : prevIndex - 1
    );
  };
  
  // Auto-play functionality
  useEffect(() => {
    if (!isClient || !isAutoPlaying || carouselBanners.length <= 1) return;
    
    const interval = setInterval(nextBanner, 4000);
    return () => clearInterval(interval);
  }, [isClient, isAutoPlaying, carouselBanners.length]);
  
  // Handle hover events
  const handleHoverStart = () => setIsAutoPlaying(false);
  const handleHoverEnd = () => setIsAutoPlaying(true);
  
  // Copy coupon code functionality
  const copyCoupon = async (couponCode) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCoupon(couponCode);
      setTimeout(() => setCopiedCoupon(null), 2000);
    } catch (err) {
      console.log('Failed to copy coupon');
    }
  };

  // Prevent hydration issues by checking client state
  if (!isClient) {
    return (
      <section className="py-8 px-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Our Special Offers</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Don't miss these amazing deals!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-48 md:h-64 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-muted-bg)' }}></div>
            ))}
          </div>
          <div className="h-96 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-muted-bg)' }}></div>
        </div>
      </section>
    );
  }

  // Single banner component for reuse
  const BannerItem = ({ banner, isVertical = false, className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const [fallbackError, setFallbackError] = useState(false);
    
    // Priority system: any available image > fallback image > gradient
    const getImageSource = () => {
      // Console log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Banner image data:', {
          title: banner.title,
          image_url_final: banner.image_url_final,
          imageError,
          fallbackError
        });
      }
      
      // 1. Check if we have any image URL and it hasn't failed
      if (banner.image_url_final && !imageError) {
        return banner.image_url_final;
      }
      
      // 2. Use fallback image if original failed
      if (imageError && !fallbackError) {
        return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
      }
      
      // 3. No image available
      return null;
    };
    
    const imageSource = getImageSource();
    const hasImage = imageSource && !fallbackError;
    
    // Reset errors when banner changes
    React.useEffect(() => {
      setImageError(false);
      setFallbackError(false);
    }, [banner.id]);
    
    // Handle image error
    const handleImageError = () => {
      if (!imageError) {
        console.log(`Image failed to load for ${banner.title}: ${banner.image_url_final}`);
        setImageError(true);
      } else {
        console.log(`Fallback image failed for ${banner.title}`);
        setFallbackError(true);
      }
    };
    
    // Convert Tailwind gradient classes to CSS gradient if needed
    const getGradientStyle = (gradientColors) => {
      if (!gradientColors) {
        return `linear-gradient(135deg, var(--color-button-primary), var(--color-accent-orange))`;
      }
      
      // If it's already a CSS gradient, use it
      if (gradientColors.includes('linear-gradient') || gradientColors.includes('var(--')) {
        return gradientColors;
      }
      
      // Convert Tailwind classes to CSS colors
      const colorMap = {
        'from-amber-500': '#f59e0b',
        'to-orange-600': '#ea580c',
        'from-pink-500': '#ec4899',
        'to-rose-600': '#e11d48',
        'from-emerald-500': '#10b981',
        'to-teal-600': '#0d9488',
        'from-blue-500': '#3b82f6',
        'to-indigo-600': '#4f46e5',
        'from-purple-500': '#a855f7',
        'to-fuchsia-600': '#c026d3'
      };
      
      const parts = gradientColors.split(' ');
      const fromColor = colorMap[parts[0]] || 'var(--color-button-primary)';
      const toColor = colorMap[parts[1]] || 'var(--color-accent-orange)';
      
      return `linear-gradient(135deg, ${fromColor}, ${toColor})`;
    };
    
    return (
      <motion.div
        className={`
          relative overflow-hidden rounded-lg shadow-lg group cursor-pointer
          ${isVertical ? 'h-96 md:h-full' : 'h-48 md:h-64'}
          ${className}
        `}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        {/* Background Image or Gradient */}
        {hasImage ? (
          <Image
            src={imageSource}
            alt={banner.alt_text || banner.title || 'Special Offer'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={handleImageError}
            priority={false}
          />
        ) : (
          <div 
            className="absolute inset-0"
            style={{
              background: getGradientStyle(banner.gradient_colors)
            }}
          >
            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                No Image
              </div>
            )}
          </div>
        )}
        
        {/* Colorful Blur Gradient Overlay */}
        <div 
          className="absolute inset-0 backdrop-blur-base group-hover:backdrop-blur-md transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, 
              rgba(59, 130, 246, 0.15) 0%, 
              rgba(147, 51, 234, 0.15) 25%, 
              rgba(236, 72, 153, 0.15) 50%, 
              rgba(239, 68, 68, 0.15) 75%, 
              rgba(245, 158, 11, 0.15) 100%)`
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 text-shadow-lg/30">
              {banner.title || 'Special Offer'}
            </h3>
            <p className="text-sm md:text-base opacity-90 line-clamp-3 text-shadow-lg/30">
              {banner.description || 'Amazing deals await!'}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xl md:text-2xl font-bold text-shadow-lg/30">
              {banner.discount_text || '0% OFF'}
            </span>
            
            {banner.coupon_code && (
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  copyCoupon(banner.coupon_code);
                }}
                className="px-3 py-1 rounded text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: 'var(--color-second-bg)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copiedCoupon === banner.coupon_code ? 'Copied!' : banner.coupon_code}
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Link overlay */}
        {banner.button_url && (
          <Link href={banner.button_url} className="absolute inset-0 z-20">
            <span className="sr-only">View {banner.title}</span>
          </Link>
        )}
      </motion.div>
    );
  };

  // Return early if no banners
  if (!bannersToUse || bannersToUse.length === 0) {
    return (
      <section className="container mx-auto py-8" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Our Special Offers</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Check back soon for amazing deals!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-8" id="special-offers" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Special Offers
          </motion.h2>
          <motion.p 
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Don't miss these amazing deals!
          </motion.p>
        </div>

        {/* Desktop Layout: Grid + Vertical Banner */}
        <div className="hidden md:flex gap-4">
          {/* Left Side: 2x2 Grid of Horizontal Banners */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              {horizontalBanners.slice(0, 4).map((banner, index) => (
                <motion.div
                  key={banner.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <BannerItem banner={banner} />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Right Side: Vertical Banner */}
          {verticalBanners.length > 0 && (
            <motion.div 
              className="w-80"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <BannerItem banner={verticalBanners[0]} isVertical={true} />
            </motion.div>
          )}
        </div>

        {/* Mobile Layout: Carousel */}
        <div className="md:hidden">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
              >
                {carouselBanners[currentIndex] && (
                  <BannerItem banner={carouselBanners[currentIndex]} />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Buttons */}
            {carouselBanners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-second-bg)',
                    color: 'var(--color-text-primary)',
                    opacity: 0.9
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                  aria-label="Previous banner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={nextBanner}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-second-bg)',
                    color: 'var(--color-text-primary)',
                    opacity: 0.9
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                  aria-label="Next banner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Dots Indicator */}
          {carouselBanners.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {carouselBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: index === currentIndex 
                      ? 'var(--color-button-primary)' 
                      : 'var(--color-muted-bg)'
                  }}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Vertical Banner on Mobile (if exists) */}
          {verticalBanners.length > 0 && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <BannerItem banner={verticalBanners[0]} />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PromotionalOffer",
            "name": "Special Offers",
            "description": "Amazing deals and discounts on our products",
            "offers": Array.isArray(bannersToUse) ? bannersToUse.map(banner => ({
              "@type": "Offer",
              "name": banner.title,
              "description": banner.description,
              "discount": banner.discount_text,
              "promoCode": banner.coupon_code,
              "url": banner.button_url
            })) : []
          })
        }}
      />
    </section>
  );
}
