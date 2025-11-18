// frontend/app/Components/Home/HomePage.jsx
"use client";

import React from "react";
import Hero from "./Hero";
import CategoryCards from "./CategoryCards";
import FilterProducts from "./FilterProducts/FilterProducts";
import HorizontalBannerSlider from "./HorizontalBanner";
import Review from "./Review";
import BlogSection from "./BlogSection";
import OfferBanner from "./OfferBanner";
import EnhancedSectionRenderer from "../Common/EnhancedSectionRenderer";

const HomePage = ({ initialProducts, categories, horizontalBanners, offerBanners }) => {
  return (
    <div className="w-full min-h-screen bg-[var(--color-background)]">
      <Hero />
      <CategoryCards categories={categories} />
      <FilterProducts 
        initialProducts={initialProducts} 
        categories={categories} 
      />
      {/* Horizontal Banner Slider with all banners */}
      <HorizontalBannerSlider banners={horizontalBanners} />
      {/* <Review /> */}
      <OfferBanner offerBanners={offerBanners} />
      
      {/* Dynamic Sections - After Our Special Offers */}
      <EnhancedSectionRenderer page="home" />
      
      {/* <BlogSection /> */}
    </div>
  );
};

export default HomePage;
