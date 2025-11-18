"use client";
import Link from "next/link";
import React from "react";

const ProductHighlight = () => {
  return (
    <div className="bg-white dark:bg-gray-950 py-12 sm:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Explore Our Collection
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Find the perfect items for your needs. We have a wide range of products waiting for you.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-block rounded-md bg-sky-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductHighlight;
