"use client";

import { motion } from "framer-motion";
import { FiTruck, FiTag } from "react-icons/fi";
import Tk_icon from "../Common/Tk_icon";
import { useAuth } from "@/app/contexts/AuthContext";

const CartTotals = ({
  subtotal,
  shipping,
  discount,
  total,
  shippingMethodName,
  showShipping = true,
  selectedShippingMethod = null, // Add shipping method object for better display
  cartItems = [], // Add cartItems prop to check for wholesale pricing
}) => {
  const { user } = useAuth();
  const isShippingFree = shipping === 0;
  const hasShippingSelected = selectedShippingMethod !== null;
  
  // Check if user is wholesaler and cart has wholesale items
  const isWholesaler = user?.user_type === 'WHOLESALER';
  const hasWholesaleItems = cartItems.some(item => item.is_wholesale);

  return (
    <div className="space-y-4">
      {/* Subtotal */}
      <div className="flex justify-between items-center text-lg">
        <div className="flex items-center gap-2">
          <Tk_icon className="text-[var(--color-text-secondary)]" size={16} />
          <span className="text-[var(--color-text-secondary)]">
            {isWholesaler && hasWholesaleItems ? 'Wholesale Subtotal' : 'Cart Subtotal'}
          </span>
        </div>
        <span className="font-semibold text-[var(--color-text-primary)]">
          <Tk_icon className="mr-1" size={16} />{subtotal.toFixed(2)}
        </span>
      </div>

      {/* Wholesale Pricing Notice */}
      {isWholesaler && hasWholesaleItems && (
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Wholesale pricing applied to eligible items
            </span>
          </div>
        </motion.div>
      )}

      {/* Shipping Cost */}
      {showShipping && (
        <motion.div 
          className="flex justify-between items-center text-lg"
          initial={{ opacity: 0.6 }}
          animate={{ 
            opacity: hasShippingSelected ? 1 : 0.6,
            scale: hasShippingSelected ? 1 : 0.98 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FiTruck className={`w-4 h-4 ${hasShippingSelected ? 'text-blue-600' : 'text-[var(--color-text-secondary)]'}`} />
              <span className="text-[var(--color-text-secondary)]">
                {shippingMethodName || "Shipping"}
              </span>
            </div>
            <div className="text-right">
              {hasShippingSelected ? (
                <motion.span 
                  className={`font-semibold ${isShippingFree ? 'text-green-600' : 'text-[var(--color-text-primary)]'}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isShippingFree ? "Free" : <><Tk_icon className="mr-1" size={16} />{shipping.toFixed(2)}</>}
                </motion.span>
              ) : (
                <span className="text-[var(--color-text-secondary)] text-sm italic">
                  Select method
                </span>
              )}
            </div>
          </div>
          
          {/* Delivery Time Alert Card */}
          {hasShippingSelected && selectedShippingMethod?.delivery_estimated_time && (
            <motion.div 
              className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Expected delivery: {selectedShippingMethod.delivery_estimated_time}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Discount */}
      {discount > 0 && (
        <motion.div 
          className="flex justify-between items-center text-lg"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <FiTag className="text-green-600 w-4 h-4" />
            <span className="text-[var(--color-text-secondary)]">Discount</span>
          </div>
          <span className="font-semibold text-green-600">
            -<Tk_icon className="mr-1" size={16} />{discount.toFixed(2)}
          </span>
        </motion.div>
      )}

      {/* Divider */}
      <div className="border-t border-[var(--color-border)] my-4"></div>

      {/* Grand Total */}
      <motion.div 
        className="flex justify-between items-center text-2xl font-bold bg-[var(--color-second-bg)] p-4 rounded-lg border border-[var(--color-border)]"
        key={total} // Force re-render on total change
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-[var(--color-text-primary)]">Grand Total</span>
        <motion.span 
          className="text-[var(--color-button-primary)]"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <Tk_icon className="mr-1" size={16} />{total.toFixed(2)}
        </motion.span>
      </motion.div>

      {/* Shipping Method Info */}
      {hasShippingSelected && selectedShippingMethod?.description && (
        <motion.div 
          className="text-sm text-[var(--color-text-secondary)] bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-2">
            <FiTruck className="text-blue-600 w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                {selectedShippingMethod.name || selectedShippingMethod.title}
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                {selectedShippingMethod.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CartTotals;
