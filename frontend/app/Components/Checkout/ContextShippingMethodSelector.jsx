"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiX, FiTruck, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useShippingMethods } from '@/app/hooks';
import { useCheckout } from '@/app/contexts/CheckoutContext';
import Tk_icon from '../Common/Tk_icon';

// Info Modal Component (same as before)
const ShippingInfoModal = ({ isOpen, onClose, shippingMethod }) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: { opacity: 0, y: 30, scale: 0.95 },
  };

  if (!isOpen || !shippingMethod) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-[var(--color-surface)] rounded-lg p-6 max-w-md w-full mx-4 relative z-50"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="pr-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiTruck className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {shippingMethod.title || shippingMethod.name}
                  </h3>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                    <Tk_icon size={18} className="mr-1" />{shippingMethod.price}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {shippingMethod.description || "No description available for this shipping method."}
                  </p>
                </div>
                
                {shippingMethod.delivery_estimated_time && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Estimated Delivery Time
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      {shippingMethod.delivery_estimated_time}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Individual Shipping Method Card
const ShippingMethodCard = ({ 
  method, 
  isSelected, 
  onSelect, 
  onInfoClick,
  className = ""
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: { 
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
        }
        ${className}
      `}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={() => onSelect(method)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInfoClick(method);
        }}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-10"
      >
        <FiInfo size={16} />
      </button>

      <div className="flex items-center space-x-3">
        <div className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}
        `}>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </div>

        <div className={`
          p-2 rounded-lg flex-shrink-0
          ${isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}
        `}>
          <FiTruck 
            size={20} 
            className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} 
          />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {method.title || method.name}
              </h3>
              {method.delivery_estimated_time && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 flex-shrink-0">
                  {method.delivery_estimated_time}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 ml-2 flex items-center">
              <Tk_icon size={18} className="mr-1" />{method.price}
            </p>
          </div>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <FiCheck size={12} className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Loading Skeleton (same as before)
const ShippingMethodSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// Error State (same as before)
const ShippingMethodError = ({ error, onRetry }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
      <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Failed to Load Shipping Methods
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {error || "Something went wrong while fetching shipping options."}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Main Context-Aware Shipping Method Selector
const ContextShippingMethodSelector = ({ 
  className = "",
  title = "Shipping Methods"
}) => {
  const { shippingMethods, loading, error, refetch } = useShippingMethods();
  const { selectedShippingMethod, handleShippingMethodChange } = useCheckout();
  
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalMethod, setInfoModalMethod] = useState(null);

  const handleSelect = (method) => {
    handleShippingMethodChange(method);
  };

  const handleInfoClick = (method) => {
    setInfoModalMethod(method);
    setInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setInfoModalOpen(false);
    setInfoModalMethod(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <ShippingMethodSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <ShippingMethodError error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!shippingMethods.length) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <div className="text-center py-8">
          <FiTruck size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No shipping methods available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      
      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {shippingMethods.map((method) => (
          <ShippingMethodCard
            key={method.id}
            method={method}
            isSelected={selectedShippingMethod?.id === method.id}
            onSelect={handleSelect}
            onInfoClick={handleInfoClick}
          />
        ))}
      </motion.div>

      {/* Context Status Indicator */}
      {selectedShippingMethod && (
        <motion.div 
          className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <FiCheck className="w-4 h-4" />
            <span className="text-sm font-medium">
              {selectedShippingMethod.name || selectedShippingMethod.title} selected
            </span>
          </div>
        </motion.div>
      )}

      <ShippingInfoModal
        isOpen={infoModalOpen}
        onClose={handleCloseInfoModal}
        shippingMethod={infoModalMethod}
      />
    </div>
  );
};

export default ContextShippingMethodSelector;
