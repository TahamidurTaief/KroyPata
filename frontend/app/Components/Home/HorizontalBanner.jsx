"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HorizontalBannerSlider = ({ banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Fallback banner if no data is available
  const fallbackBanners = [
    {
      id: 'fallback',
      title: "Limited Time Offer",
      subtitle: "Flash Sale - Don't Miss Out!",
      button_text: "Shop Sale",
      button_url: "/products?sort=discount",
      overlay_colors: "from-purple-900/70 via-blue-900/50 to-transparent",
      image_url_final: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    }
  ];

  const displayBanners = banners && banners.length > 0 ? banners : fallbackBanners;

  // Minimum swipe distance (in px) to trigger a swipe
  const minSwipeDistance = 50;

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || displayBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === displayBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [displayBanners.length, isAutoPlaying]);

  // Handle manual navigation
  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? displayBanners.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === displayBanners.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <section className="w-full my-8 md:my-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* 
        Fixed Height: Maximum 300px across all devices
        */}
        <div 
          className="relative w-full h-[250px] sm:h-[280px] md:h-[300px] rounded-2xl overflow-hidden shadow-2xl group slider-container"
          role="banner"
          aria-label="Promotional banner slider"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Slider Container */}
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full slider-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {displayBanners.map((banner, index) => (
              <BannerSlide 
                key={banner.id || `banner-${index}`}
                banner={banner}
                isActive={index === currentIndex}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          {displayBanners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white min-h-[44px] min-w-[44px] p-2 md:p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 group-hover:opacity-100 opacity-0 flex items-center justify-center"
                aria-label="Previous banner"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white min-h-[44px] min-w-[44px] p-2 md:p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 group-hover:opacity-100 opacity-0 flex items-center justify-center"
                aria-label="Next banner"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {displayBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {displayBanners.length > 1 && isAutoPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-[var(--primary)] transition-all duration-100 ease-linear"
                style={{ 
                  width: `${((currentIndex + 1) / displayBanners.length) * 100}%`,
                  animation: isAutoPlaying ? 'progress 4s linear infinite' : 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for progress animation and smooth transitions */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .slider-container {
          touch-action: pan-y pinch-zoom;
        }
        
        .slider-track {
          will-change: transform;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .slider-track {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

const BannerSlide = ({ banner, isActive }) => {
  const [imageError, setImageError] = useState(false);
  
  // Fallback gradient background if image fails to load
  const fallbackBackground = "bg-[var(--primary)]";
  
  // Handle empty or null values
  const displayTitle = banner.title || "Special Offer";
  const displaySubtitle = banner.subtitle || "Don't miss out on this amazing deal!";
  const displayButtonText = banner.button_text || "Shop Now";
  const displayButtonLink = banner.button_url || "/products";
  const displayOverlayColor = banner.overlay_colors || "from-black/60 via-black/40 to-transparent";

  return (
    <div className={`relative flex-shrink-0 w-full h-full ${imageError ? fallbackBackground : ''}`}>
      {/* Background Image */}
      {!imageError && banner.image_url_final && (
        <Image
          src={banner.image_url_final}
          alt={`${displayTitle} - Promotional Banner`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={isActive}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1440px) 1200px, 1400px"
          onError={() => setImageError(true)}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${displayOverlayColor}`} />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8 md:p-10">
        <div className="text-center max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Subtitle */}
          <p className="text-white/90 text-shadow-lg/30 text-xs sm:text-sm md:text-base font-medium mb-2 md:mb-3 tracking-wide text-center drop-shadow-lg">
            {displaySubtitle}
          </p>
          
          {/* Title */}
          <h2 className="text-white text-shadow-lg/30 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 leading-tight text-center drop-shadow-xl">
            {displayTitle}
          </h2>
          
          {/* Call to Action Button */}
          <div className="flex justify-center shadow-2xl">
            <Link href={displayButtonLink} aria-label={`${displayButtonText} - ${displayTitle}`}>
              <button className="group/btn bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold min-h-[44px] py-2 px-4 md:py-3 md:px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-white/50 focus:outline-none flex items-center justify-center gap-2">
                <span className="text-xs sm:text-sm md:text-base">{displayButtonText}</span>
                <svg 
                  className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover/btn:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4">
        <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-2 border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
          <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Legacy component for backward compatibility
const HorizontalBanner = (props) => {
  return <HorizontalBannerSlider banners={[props]} />;
};

export default HorizontalBannerSlider;
export { HorizontalBanner };
