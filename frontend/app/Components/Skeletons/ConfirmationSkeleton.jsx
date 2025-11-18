'use client';

import { motion } from "framer-motion";

const ConfirmationSkeleton = () => {
  const shimmerVariants = {
    initial: { 
      backgroundPosition: "-100% 0",
      opacity: 0.6 
    },
    animate: {
      backgroundPosition: "100% 0",
      opacity: 1,
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
        opacity: {
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const SkeletonBox = ({ className, children }) => (
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      className={`bg-gradient-to-r from-gray-200/50 via-gray-300/80 to-gray-200/50 dark:from-gray-700/60 dark:via-gray-600/90 dark:to-gray-700/60 rounded ${className}`}
      style={{
        backgroundSize: "150% 100%",
        filter: "blur(0.5px)"
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Success Header Skeleton */}
          <motion.div variants={itemVariants} className="text-center">
            {/* Success Icon Circle */}
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <SkeletonBox className="w-full h-full rounded-full" />
            </div>
            
            {/* Title */}
            <div className="mb-4">
              <SkeletonBox className="h-9 w-80 mx-auto mb-2" />
            </div>
            
            {/* Description */}
            <div className="max-w-2xl mx-auto space-y-2">
              <SkeletonBox className="h-6 w-full" />
              <SkeletonBox className="h-6 w-4/5 mx-auto" />
            </div>
          </motion.div>

          {/* Order Details Card Skeleton */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            {/* Header Section */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <SkeletonBox className="h-7 w-32 mb-4" />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <SkeletonBox className="h-4 w-24" />
                  <SkeletonBox className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <SkeletonBox className="h-4 w-20" />
                  <SkeletonBox className="h-5 w-24" />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Information Skeleton */}
              <div>
                <div className="flex items-center mb-4">
                  <SkeletonBox className="h-5 w-5 mr-2" />
                  <SkeletonBox className="h-6 w-40" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                    <SkeletonBox className="h-4 w-28" />
                    <SkeletonBox className="h-5 w-20" />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="h-5 w-36" />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2 space-y-2">
                    <SkeletonBox className="h-4 w-36" />
                    <SkeletonBox className="h-5 w-32" />
                  </div>
                </div>
              </div>

              {/* Shipping Information Skeleton */}
              <div>
                <div className="flex items-center mb-4">
                  <SkeletonBox className="h-5 w-5 mr-2" />
                  <SkeletonBox className="h-6 w-44" />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="space-y-2 flex-1">
                      <SkeletonBox className="h-5 w-40" />
                      <SkeletonBox className="h-4 w-56" />
                    </div>
                    <SkeletonBox className="h-5 w-16" />
                  </div>
                  
                  {/* Delivery Address */}
                  <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <SkeletonBox className="h-4 w-32 mb-2" />
                    <div className="space-y-1">
                      <SkeletonBox className="h-4 w-48" />
                      <SkeletonBox className="h-4 w-60" />
                      <SkeletonBox className="h-4 w-36" />
                      <SkeletonBox className="h-4 w-40" />
                      <SkeletonBox className="h-4 w-52" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Skeleton */}
              <div>
                <div className="flex items-center mb-4">
                  <SkeletonBox className="h-5 w-5 mr-2" />
                  <SkeletonBox className="h-6 w-32" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <SkeletonBox className="h-5 w-48" />
                          <div className="flex items-center space-x-2">
                            <SkeletonBox className="h-4 w-20" />
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <SkeletonBox className="h-4 w-24" />
                          </div>
                        </div>
                        <SkeletonBox className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Breakdown Skeleton */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <SkeletonBox className="h-5 w-16" />
                    <SkeletonBox className="h-5 w-20" />
                  </div>
                  <div className="flex justify-between items-center">
                    <SkeletonBox className="h-5 w-18" />
                    <SkeletonBox className="h-5 w-16" />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <SkeletonBox className="h-6 w-24" />
                    <SkeletonBox className="h-8 w-28" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What's Next Skeleton */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <SkeletonBox className="h-5 w-5 mr-2" />
              <SkeletonBox className="h-6 w-24" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start">
                  <SkeletonBox className="w-6 h-6 rounded-full mr-3 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-5 w-32" />
                    <SkeletonBox className="h-4 w-64" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons Skeleton */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <SkeletonBox className="flex-1 h-12 rounded-lg" />
            <SkeletonBox className="flex-1 h-12 rounded-lg" />
          </motion.div>

          {/* Support Information Skeleton */}
          <motion.div 
            variants={itemVariants}
            className="text-center"
          >
            <SkeletonBox className="h-4 w-72 mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationSkeleton;
