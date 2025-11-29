"use client";

import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../Common/ProductCard";

const ProductGrid = ({ products, isLoading, isError }) => {
  // Debug logging with more detail
  console.log('🎯 ProductGrid Render:', {
    productsCount: products?.length || 0,
    isLoading,
    isError: isError ? {
      message: isError.message,
      name: isError.name,
      stack: isError.stack?.substring(0, 200)
    } : null,
    hasProducts: !!products && products.length > 0,
    firstProduct: products?.[0] ? {
      id: products[0].id,
      name: products[0].name,
      hasImage: !!products[0].image
    } : null
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 28
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  if (isLoading) {
    return (
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
  }

  if (isError) {
    console.error('🚨 ProductGrid Error:', isError);
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full flex flex-col items-center justify-center py-20"
      >
        <div className="text-6xl mb-4">😔</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-2">
          We couldn't load the products right now. Please check your internet connection and try again.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 text-center mb-4">
          Error: {isError?.message || JSON.stringify(isError)}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full flex flex-col items-center justify-center py-20"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    >
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            layout
            exit="exit"
            className="h-full"
          >
            <ProductCard productData={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductGrid;
