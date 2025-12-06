import React, { Suspense } from "react";
import CategoriesBlock from "@/app/Components/Categories/CategoriesBlock";

// Metadata for SEO
export const metadata = {
  title: 'All Categories | ChinaKroy - Browse Products by Category',
  description: 'Browse all product categories on ChinaKroy. Find electronics, fashion, home goods, and more. Shop by category for easy product discovery.',
  keywords: 'categories, product categories, shop by category, browse products, ecommerce categories, online shopping',
  
  // Open Graph metadata
  openGraph: {
    title: 'All Categories | ChinaKroy',
    description: 'Browse all product categories and find what you need on ChinaKroy',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chinakroy.com'}/categories`,
    siteName: 'ChinaKroy',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chinakroy.com'}/og-categories.jpg`,
        width: 1200,
        height: 630,
        alt: 'ChinaKroy Categories',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'All Categories | ChinaKroy',
    description: 'Browse all product categories and find what you need on ChinaKroy',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://chinakroy.com'}/og-categories.jpg`],
    creator: '@chinakroy',
    site: '@chinakroy',
  },
  
  // Canonical URL
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chinakroy.com'}/categories`,
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Loading component for Suspense fallback
const CategoriesLoading = () => (
  <div className="container w-full mx-auto pt-5 md:pt-5 py-10 md:py-20">
    <div className="animate-pulse">
      <div className="h-8 w-64 bg-gray-200/60 dark:bg-gray-700/50 rounded-lg mb-6"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-12">
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
            <div className="h-4 w-1/2 bg-gray-200/60 dark:bg-gray-700/50 rounded mb-2"></div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({length: 4}).map((__, j) => (
                <div key={j} className="aspect-square bg-gray-200/60 dark:bg-gray-700/50 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Page = () => {
  return (
    <div className="">
      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesBlock />
      </Suspense>
    </div>
  );
};

export default Page;
