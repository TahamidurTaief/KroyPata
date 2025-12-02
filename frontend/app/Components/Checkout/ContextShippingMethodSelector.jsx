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
            className="bg-[var(--card)] rounded-lg p-6 max-w-md w-full mx-4 relative z-50"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="pr-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                  <FiTruck className="text-[var(--primary)]" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    {shippingMethod.title || shippingMethod.name}
                  </h3>
                  <p className="text-lg font-semibold text-[var(--primary)] flex items-center">
                    <Tk_icon size={18} className="mr-1" />{shippingMethod.price}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[var(--foreground)] mb-2">
                    Description
                  </h4>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">
                    {shippingMethod.description || "No description available for this shipping method."}
                  </p>
                </div>
                
                {shippingMethod.delivery_estimated_time && (
                  <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-4">
                    <h4 className="font-semibold text-[var(--primary)] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                      Estimated Delivery Time
                    </h4>
                    <p className="text-[var(--primary)] font-medium">
                      {shippingMethod.delivery_estimated_time}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
        relative rounded-lg p-4 border-2 cursor-pointer transition-all
        ${className}
      `}
      style={{
        backgroundColor: isSelected ? 'var(--primary-10)' : 'var(--card)',
        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
      }}
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
        className="absolute top-3 right-3 p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors z-10"
      >
        <FiInfo size={16} />
      </button>

      <div className="flex items-center space-x-3">
        <div 
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          style={{
            borderColor: isSelected ? 'var(--primary)' : 'var(--muted-foreground)',
            backgroundColor: isSelected ? 'var(--primary)' : 'transparent'
          }}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </div>

        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: isSelected ? 'var(--primary)' : 'var(--border)'
          }}
        >
          <FiTruck 
            size={20} 
            style={{
              color: isSelected ? 'white' : 'var(--muted-foreground)'
            }}
          />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {method.title || method.name}
              </h3>
              {method.delivery_estimated_time && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: 'var(--primary-10)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                  {method.delivery_estimated_time}
                </span>
              )}
            </div>
            <p className="text-lg font-bold ml-2 flex items-center" style={{ color: 'var(--foreground)' }}>
              <Tk_icon size={18} className="mr-1" />{method.price}
            </p>
          </div>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center"
        >
          <FiCheck size={12} className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Loading Skeleton (same as before)
const ShippingMethodSkeleton = () => (
  <div className="rounded-lg p-4 border-2 animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: 'var(--border)' }}></div>
      <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--border)' }}></div>
      <div className="flex-1">
        <div className="h-4 rounded mb-2 w-3/4" style={{ backgroundColor: 'var(--border)' }}></div>
        <div className="h-5 rounded w-1/2" style={{ backgroundColor: 'var(--border)' }}></div>
      </div>
    </div>
  </div>
);

// Error State (same as before)
const ShippingMethodError = ({ error, onRetry }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
      <FiAlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
      Failed to Load Shipping Methods
    </h3>
    <p className="text-[var(--muted-foreground)] mb-4">
      {error || "Something went wrong while fetching shipping options."}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Main Context-Aware Shipping Method Selector
const ContextShippingMethodSelector = ({ 
  className = "",
  title = "3. Shipping Method",
  compact = false,
  validationErrors = {}
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
    if (compact) {
      return (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-sm font-bold mb-3" 
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </motion.h3>
          <div className="space-y-2">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="w-full p-3 rounded animate-pulse" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 rounded mb-1" style={{ backgroundColor: 'var(--border)' }}></div>
                    <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--border)' }}></div>
                  </div>
                  <div className="h-4 w-12 rounded" style={{ backgroundColor: 'var(--border)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
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
    if (compact) {
      return (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-sm font-bold mb-3" 
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </motion.h3>
          <div className="text-center py-4">
            <p className="text-sm text-red-500 mb-2">{error || "Failed to load shipping methods"}</p>
            <button
              onClick={refetch}
              className="text-xs px-3 py-1 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary)]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4" 
          style={{ color: 'var(--foreground)' }}
        >
          {title}
        </motion.h2>
        <ShippingMethodError error={error} onRetry={refetch} />
      </div>
    );
  }

  if (!shippingMethods.length) {
    if (compact) {
      return (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-sm font-bold mb-3" 
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </motion.h3>
          <div className="text-center py-4">
            <FiTruck size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No shipping methods available
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4" 
          style={{ color: 'var(--foreground)' }}
        >
          {title}
        </motion.h2>
        <div className="text-center py-8">
          <FiTruck size={48} className="mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
            No shipping methods available at the moment.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-sm font-bold mb-3" 
          style={{ color: 'var(--foreground)' }}
        >
          {title} {validationErrors.shippingMethod && <span className="text-red-500">*</span>}
        </motion.h3>
        {validationErrors.shippingMethod && (
          <p className="text-xs text-red-500 mb-2">{validationErrors.shippingMethod}</p>
        )}
        <div className="space-y-2">
          {shippingMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => handleSelect(method)}
              className={`w-full p-3 rounded text-left transition-all flex items-center justify-between ${
                selectedShippingMethod?.id === method.id
                  ? 'border-2' 
                  : 'border'
              }`}
              style={{
                backgroundColor: selectedShippingMethod?.id === method.id 
                  ? 'var(--primary-10)' 
                  : 'var(--background)',
                borderColor: selectedShippingMethod?.id === method.id 
                  ? 'var(--primary)' 
                  : 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <div>
                <div className="text-sm font-medium">{method.name || method.title}</div>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {method.description || method.delivery_estimated_time || '3-5 business days'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium flex items-center"><Tk_icon size={14} className="mr-1" />{method.price}</span>
                {selectedShippingMethod?.id === method.id && (
                  <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4" 
        style={{ color: 'var(--foreground)' }}
      >
        {title}
      </motion.h2>
      
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
          className="mt-4 p-3 rounded-lg"
          style={{ backgroundColor: 'var(--primary-10)', border: '1px solid var(--primary)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
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
