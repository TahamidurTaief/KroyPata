"use client";

import React, { Suspense } from "react";
import ProductPage from "@/app/Components/Product/ProductPage";
import { motion } from "framer-motion";

// This is a skeleton loader component for the product grid.
// It provides visual feedback to the user while products are loading.
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div 
        key={i} 
        className="animate-pulse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-64 w-full mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
      </motion.div>
    ))}
  </div>
);

// This component wraps the main ProductPage in a Suspense boundary.
// This is crucial for using `useSearchParams` and showing a loading state.
const ProductsRoute = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Sidebar Skeleton */}
              <aside className="hidden xl:block w-80 flex-shrink-0">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-96 animate-pulse"></div>
              </aside>
              {/* Main Content Skeleton */}
              <main className="flex-1 min-w-0">
                {/* Search/Sort Skeleton */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 h-11 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="w-40 h-11 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="xl:hidden w-24 h-11 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                </div>
                {/* Product Grid Skeleton */}
                <ProductGridSkeleton />
              </main>
            </div>
          </div>
        </div>
      }
    >
      <ProductPage />
    </Suspense>
  );
};

export default ProductsRoute;
