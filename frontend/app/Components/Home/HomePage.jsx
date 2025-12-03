// frontend/app/Components/Home/HomePage.jsx
"use client";

import React from "react";
import Hero from "./Hero";
import CategoryCarousel from "./CategoryCarousel";
import CategoryCards from "./CategoryCards";
import FilterProducts from "./FilterProducts/FilterProducts";
import HorizontalBannerSlider from "./HorizontalBanner";
import Review from "./Review";
import BlogSection from "./BlogSection";
import OfferBanner from "./OfferBanner";
import EnhancedSectionRenderer from "../Common/EnhancedSectionRenderer";
import CategoryBasedSection from "./CategoryBasedSection";

const HomePage = ({ initialProducts = [], categories = [], horizontalBanners = [], offerBanners = [] }) => {
  // Ensure all props are arrays
  const safeProducts = Array.isArray(initialProducts) ? initialProducts : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeHorizontalBanners = Array.isArray(horizontalBanners) ? horizontalBanners : [];
  const safeOfferBanners = Array.isArray(offerBanners) ? offerBanners : [];

  return (
    <div className="w-full min-h-screen bg-[var(--background)]">
      <Hero />
      <CategoryCarousel />
      {/* <CategoryCards categories={safeCategories} /> */}
      <FilterProducts 
        initialProducts={safeProducts} 
        categories={safeCategories} 
      />
      
      {/* Category-Based Product Sections with Search */}
      <CategoryBasedSection />
      
      {/* Horizontal Banner Slider with all banners */}
      <HorizontalBannerSlider banners={safeHorizontalBanners} />
      {/* <Review /> */}
      <OfferBanner offerBanners={safeOfferBanners} />
      
      {/* Dynamic Sections - After Our Special Offers */}
      <EnhancedSectionRenderer page="home" />
      
      {/* <BlogSection /> */}
    </div>
  );
};

export default HomePage;
