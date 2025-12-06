// app/Components/Cart/ShippingSelector.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiTruck, FiAlertCircle, FiRefreshCw, FiCheck, FiClock, FiInfo } from "react-icons/fi";
import { formatShippingMethod } from "@/app/lib/shippingUtils";
import Tk_icon from "../Common/Tk_icon";
import { memo } from "react";

const ShippingSelector = memo(({
  availableMethods = [],
  selectedMethod = null,
  onSelectMethod = () => {},
  loading = false,
  error = null,
  shippingAnalysis = null,
  onRetry = () => {},
  onShowShippingInfo = () => {}
}) => {
  const formattedMethods = availableMethods.map(formatShippingMethod);
  
  // Debug logging - reduce frequency
  if (process.env.NODE_ENV === 'development') {
    console.log('🚚 ShippingSelector render:', {
      availableMethods: availableMethods?.length || 0,
      formattedMethods: formattedMethods?.length || 0,
      selectedMethod,
      loading,
      error
    });
  }
  
  if (loading) {
    return (
      <motion.div 
        className="bg-[var(--color-second-bg)] rounded-xl border border-border p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <FiRefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-foreground">Loading Shipping Options...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-[var(--color-border)] rounded-lg"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <FiAlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Shipping Error</h3>
        </div>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Retry
        </button>
      </motion.div>
    );
  }

  if (formattedMethods.length === 0) {
    // Extract constraint violations from shipping analysis
    const constraintViolations = shippingAnalysis?.shipping_analysis?.constraint_violations || [];
    const hasConstraintViolations = constraintViolations.length > 0;
    
    // Find max limits from violations or fallback to analysis data
    let maxQuantity = null;
    let maxWeight = null;
    
    if (hasConstraintViolations) {
      // Get max limits from constraint violations
      const quantityViolations = constraintViolations.filter(v => v.type === 'quantity_exceeded');
      const weightViolations = constraintViolations.filter(v => v.type === 'weight_exceeded');
      
      if (quantityViolations.length > 0) {
        maxQuantity = Math.max(...quantityViolations.map(v => v.max_allowed));
      }
      
      if (weightViolations.length > 0) {
        maxWeight = Math.max(...weightViolations.map(v => v.max_allowed));
      }
    }
    
    return (
      <motion.div 
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
              Shipping Not Available
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              Your cart exceeds shipping limits
            </p>
          </div>
        </div>

        {/* Main message */}
        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-200 font-medium mb-2">
            {hasConstraintViolations 
              ? "Your cart items exceed the maximum shipping limits for available methods."
              : "No shipping methods are available for your current cart items."
            }
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm">
            Please adjust your cart quantities or contact customer support for assistance.
          </p>
        </div>

        {/* Shipping Limits Display */}
        {(maxQuantity || maxWeight) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <FiTruck className="w-4 h-4" />
              Maximum Shipping Limits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {maxQuantity && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm">#</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">
                        Max Quantity
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        Per shipment
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-800 dark:text-red-200">
                      {maxQuantity}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      items
                    </div>
                  </div>
                </div>
              )}
              
              {maxWeight && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 font-bold text-xs">kg</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-red-800 dark:text-red-200">
                        Max Weight
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        Per shipment
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-800 dark:text-red-200">
                      {maxWeight}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      kg
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Cart Info */}
        {shippingAnalysis?.cart_analysis && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Your Cart Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {shippingAnalysis.cart_analysis.total_quantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Weight:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {parseFloat(shippingAnalysis.cart_analysis.total_weight).toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          >
            <FiRefreshCw className="w-4 h-4" />
            Retry Check
          </button>
          <button
            onClick={() => window.open('mailto:support@chinakroy.com?subject=Shipping Support Needed', '_blank')}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            Contact Support
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-[var(--color-second-bg)] rounded-xl border border-border p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiTruck className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-foreground">Select Shipping Method</h3>
          {shippingAnalysis?.requires_split_shipping && (
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full">
              Split Shipping
            </span>
          )}
        </div>
        
        {/* Info Button */}
        <button
          onClick={onShowShippingInfo}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors group"
          title="Shipping Information"
        >
          <FiInfo className="w-4 h-4 text-blue-600 group-hover:text-blue-700 dark:group-hover:text-blue-500" />
        </button>
      </div>

      <div className="space-y-3" x-data="{ selectedMethod: selectedMethod }">
        <AnimatePresence>
          {formattedMethods.map((method) => {
            const isSelected = selectedMethod === method.id.toString();
            const isFree = method.isFree;
            const isPriceTiered = method.isPriceTiered;
            
            return (
              <motion.div
                key={method.id}
                className={`
                  relative cursor-pointer rounded-lg border p-4 transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                    : 'border-[var(--color-border)] hover:border-blue-300 hover:bg-[var(--color-surface)]/50'
                  }
                `}
                onClick={() => onSelectMethod(method.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                layout
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Radio Button */}
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-[var(--color-border)]'
                      }
                    `}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiCheck className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Method Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${isSelected ? 'text-blue-800 dark:text-blue-200' : 'text-foreground'}`}>
                          {method.name}
                        </h4>
                        {isFree && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-bold rounded-full">
                            FREE
                          </span>
                        )}
                        {isPriceTiered && !isFree && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                            Bulk Discount
                          </span>
                        )}
                      </div>
                      {method.description && (
                        <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-[var(--color-text-secondary)]'}`}>
                          {method.description}
                        </p>
                      )}
                      
                      {/* Delivery Time */}
                      {method.delivery_estimated_time && (
                        <div className="flex items-center gap-1 mt-1">
                          <FiClock className={`w-3 h-3 ${isSelected ? 'text-blue-600' : 'text-[var(--color-text-secondary)]'}`} />
                          <span className={`text-xs ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-[var(--color-text-secondary)]'}`}>
                            {method.delivery_estimated_time}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="text-right">
                    <div className={`text-lg font-bold flex items-center justify-end gap-1 ${isFree ? 'text-green-600' : isSelected ? 'text-blue-700 dark:text-blue-200' : 'text-foreground'}`}>
                      {isFree ? (
                        'Free'
                      ) : (
                        <>
                          <Tk_icon size={18} className={isFree ? 'text-green-600' : isSelected ? 'text-blue-700 dark:text-blue-200' : 'text-foreground'} />
                          {method.displayPrice}
                        </>
                      )}
                    </div>
                    
                    {/* Show base price if different (tiered pricing) */}
                    {isPriceTiered && !isFree && method.base_price !== method.calculated_price && (
                      <div className="text-xs text-[var(--color-text-secondary)] line-through flex items-center justify-end gap-1">
                        <Tk_icon size={12} />
                        {parseFloat(method.base_price).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-opacity-50 pointer-events-none"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Shipping Analysis Summary */}
      {shippingAnalysis && (
        <motion.div 
          className="mt-6 p-4 bg-[var(--color-surface)]/30 rounded-lg border border-[var(--color-border)]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm text-[var(--color-text-secondary)] space-y-1">
            <div className="flex justify-between">
              <span>Available methods:</span>
              <span className="font-medium">{shippingAnalysis.available_methods_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping categories:</span>
              <span className="font-medium">{shippingAnalysis.shipping_categories_count || 0}</span>
            </div>
            {shippingAnalysis.free_shipping_eligible && (
              <div className="flex items-center gap-2 text-green-600 mt-2">
                <FiCheck className="w-4 h-4" />
                <span className="font-medium">Qualified for free shipping!</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

// Add display name for better debugging
ShippingSelector.displayName = 'ShippingSelector';

export default ShippingSelector;
