"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/app/Components/Common/ProductCard';
import { getProducts, getCategories } from '@/app/lib/api';
import Link from 'next/link';

const RelatedProducts = ({ product }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categorySlug, setCategorySlug] = useState(null);
  const [categoryName, setCategoryName] = useState(null);

  // Get category ID from the product's subcategory
  const categoryId = product?.sub_category?.category;

  useEffect(() => {
    const fetchCategorySlug = async () => {
      if (!categoryId) return;
      
      try {
        // Fetch categories to get the slug for the category ID
        const categoriesResponse = await getCategories();
        const categories = categoriesResponse || [];
        
        // Find the category with the matching ID
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          setCategorySlug(category.slug);
          setCategoryName(category.name);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback: try to use a default based on common category patterns
        setCategorySlug('fashion'); // Default since this is a fashion product
        setCategoryName('Fashion');
      }
    };

    fetchCategorySlug();
  }, [categoryId]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categorySlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch products from the same category, excluding the current product
        const response = await getProducts({ category: categorySlug }, 1);
        
        if (response?.error) {
          setError(response.error);
          return;
        }

        const products = response?.results || response || [];
        
        // Filter out the current product and limit to 8 related products
        const filteredProducts = products
          .filter(p => p.id !== product.id)
          .slice(0, 8);
        
        setRelatedProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categorySlug, product.id]);

  // Don't render if no category
  if (!categoryId) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-12 lg:mt-16 p-6 sm:p-8 bg-[var(--color-second-bg)] rounded-xl border border-[var(--color-border)] shadow-sm"
    >
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Related <span className="text-sky-500">Products</span>
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm md:text-base">
          {categoryName ? 'Discover more products from ' + categoryName : 'Discover more products from the same category'}
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-center text-[var(--color-text-secondary)] mb-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
            <span className="ml-3 text-sm">Loading related products...</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-[var(--color-muted-bg)] rounded-lg aspect-square mb-3 sm:mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-[var(--color-muted-bg)] rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-[var(--color-muted-bg)] rounded w-1/2"></div>
                  <div className="h-4 sm:h-6 bg-[var(--color-muted-bg)] rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-6 sm:py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && relatedProducts.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <div className="text-[var(--color-text-secondary)]">
            <p className="text-sm sm:text-base">No related products found at the moment.</p>
            <p className="text-xs sm:text-sm mt-2">Check back later for more products in this category.</p>
          </div>
        </div>
      )}

      {!loading && !error && relatedProducts.length > 0 && (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
        >
          {relatedProducts.map((relatedProduct, index) => (
            <motion.div
              key={relatedProduct.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
            >
              <ProductCard productData={relatedProduct} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && !error && relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 sm:mt-8"
        >
          <Link
            href={`/products?category=${categorySlug}`}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[var(--color-button-primary)] hover:bg-[var(--color-button-primary)]/90 text-white font-medium rounded-lg transition-all duration-200 group shadow-md hover:shadow-lg"
          >
            <span className="text-sm sm:text-base">{'View All ' + (categoryName || 'Category') + ' Products'}</span>
            <svg
              className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      )}
    </motion.section>
  );
};

export default RelatedProducts;
