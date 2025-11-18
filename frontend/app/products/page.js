"use client";

import React, { Suspense } from "react";
import ProductPage from "@/app/Components/Product/ProductPage";

// This is a skeleton loader component for the product grid.
// It provides visual feedback to the user while products are loading.
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-64 w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mt-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
      </div>
    ))}
  </div>
);

// This component wraps the main ProductPage in a Suspense boundary.
// This is crucial for using `useSearchParams` and showing a loading state.
const ProductsRoute = () => {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Skeleton */}
            <div className="hidden md:block w-72 flex-shrink-0 animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-full min-h-[60vh]"></div>
            </div>
            {/* Product Grid Skeleton */}
            <div className="flex-1">
              <ProductGridSkeleton />
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
