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
      className={`bg-[var(--card)] rounded-xl p-4 md:p-6 border border-[var(--border)] ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
          <FiTruck className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Shipping Information
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Available delivery options for this product
          </p>
        </div>
      </div>

      {/* Shipping Category */}
      <div className="mb-4 p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-[var(--foreground)]">
              Shipping Category:
            </span>
            <div className="flex items-center gap-2 mt-1">
              <FiPackage className="w-4 h-4 text-[var(--muted-foreground)]" />
              <span className="font-semibold text-[var(--foreground)]">
                {shippingCategory.name}
              </span>
            </div>
          </div>
        </div>
        {shippingCategory.description && (
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            {shippingCategory.description}
          </p>
        )}
      </div>

      {/* Available Shipping Methods */}
      {allowedMethods.length > 0 && (
        <div>
          <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            Available Shipping Methods ({allowedMethods.length})
          </h4>
          <div className="space-y-3">
            {allowedMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-[var(--card)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-[var(--foreground)]">
                      {method.name}
                    </h5>
                    {method.delivery_estimated_time && (
                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                        {method.delivery_estimated_time}
                      </span>
                    )}
                  </div>
                  {method.description && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {method.description}
                    </p>
                  )}
                  {(method.max_weight || method.max_quantity) && (
                    <div className="flex gap-4 mt-2">
                      {method.max_weight && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          Max weight: {method.max_weight}kg
                        </span>
                      )}
                      {method.max_quantity && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          Max quantity: {method.max_quantity}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[var(--primary)] flex items-center">
                    <Tk_icon size={16} className="mr-1" />{parseFloat(method.price).toFixed(2)}
                  </div>
                  {method.pricing_examples && method.pricing_examples.length > 1 && (
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
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
          <div className="text-[var(--muted-foreground)] text-4xl mb-2">📦</div>
          <p className="text-[var(--muted-foreground)]">
            No shipping methods configured for this category
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ShippingInfo;
