"use client";

import { motion } from "framer-motion";
import { FiTruck, FiClock, FiPackage } from "react-icons/fi";
import Tk_icon from "../Common/Tk_icon";

const ShippingInfo = ({ shippingCategory, className = "" }) => {
  if (!shippingCategory) return null;

  const allowedMethods = shippingCategory.allowed_shipping_methods || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 md:p-6 border border-blue-200 dark:border-blue-800 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <FiTruck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Information
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Available delivery options for this product
          </p>
        </div>
      </div>

      {/* Shipping Category */}
      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Shipping Category:
            </span>
            <div className="flex items-center gap-2 mt-1">
              <FiPackage className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {shippingCategory.name}
              </span>
            </div>
          </div>
        </div>
        {shippingCategory.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {shippingCategory.description}
          </p>
        )}
      </div>

      {/* Available Shipping Methods */}
      {allowedMethods.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            Available Shipping Methods ({allowedMethods.length})
          </h4>
          <div className="space-y-3">
            {allowedMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </h5>
                    {method.delivery_estimated_time && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                        {method.delivery_estimated_time}
                      </span>
                    )}
                  </div>
                  {method.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  )}
                  {(method.max_weight || method.max_quantity) && (
                    <div className="flex gap-4 mt-2">
                      {method.max_weight && (
                        <span className="text-xs text-gray-500">
                          Max weight: {method.max_weight}kg
                        </span>
                      )}
                      {method.max_quantity && (
                        <span className="text-xs text-gray-500">
                          Max quantity: {method.max_quantity}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center">
                    <Tk_icon size={16} className="mr-1" />{parseFloat(method.price).toFixed(2)}
                  </div>
                  {method.pricing_examples && method.pricing_examples.length > 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Bulk pricing available
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {allowedMethods.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-600 text-4xl mb-2">📦</div>
          <p className="text-gray-600 dark:text-gray-400">
            No shipping methods configured for this category
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ShippingInfo;
