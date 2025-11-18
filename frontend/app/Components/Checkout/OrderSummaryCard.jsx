"use client";

import { motion } from "framer-motion";
import { FiTruck, FiTag, FiShoppingCart, FiAlertCircle } from "react-icons/fi";
import Tk_icon from "../Common/Tk_icon";
import { useCheckout } from "@/app/contexts/CheckoutContext";
import { useAuth } from "@/app/contexts/AuthContext";

const OrderSummaryCard = ({ 
  showShipping = true, 
  showActions = false,
  onProceedToPayment,
  className = ""
}) => {
  const { user } = useAuth();
  const { 
    orderTotals, 
    selectedShippingMethod, 
    appliedCoupon,
    cartItems,
    isShippingSelected,
    isCartEmpty 
  } = useCheckout();

  const { subtotal, shippingCost, discountAmount, total } = orderTotals;
  const isShippingFree = shippingCost === 0;
  const hasDiscount = discountAmount > 0;
  
  // Check if user is wholesaler and cart has wholesale items
  const isWholesaler = user?.user_type === 'WHOLESALER';
  const hasWholesaleItems = cartItems.some(item => item.is_wholesale);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FiShoppingCart />
          Order Summary
        </h3>

        {/* Cart Items Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          {/* Show total weight if available */}
          {(() => {
            const totalWeight = cartItems.reduce((sum, item) => {
              const weight = parseFloat(item.weight || 0);
              const quantity = item.quantity || 0;
              return sum + (weight * quantity);
            }, 0);
            
            return totalWeight > 0 && (
              <span className="ml-2 text-xs">
                • Total Weight: {totalWeight.toFixed(2)}kg
              </span>
            );
          })()}
        </div>

        <div className="space-y-4">
          {/* Cart Subtotal */}
          <div className="flex justify-between items-center text-lg">
            <div className="flex items-center gap-2">
              <Tk_icon className="text-gray-500 dark:text-gray-400" size={16} />
              <span className="text-gray-600 dark:text-gray-400">
                {isWholesaler && hasWholesaleItems ? 'Wholesale Subtotal' : 'Cart Subtotal'}
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Tk_icon size={16} className="mr-1" />{subtotal.toFixed(2)}
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
                opacity: isShippingSelected ? 1 : 0.6,
                scale: isShippingSelected ? 1 : 0.98 
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <FiTruck 
                  className={`w-4 h-4 ${
                    isShippingSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`} 
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedShippingMethod?.name || selectedShippingMethod?.title || "Shipping"}
                </span>
              </div>
              <div className="text-right">
                {isShippingSelected ? (
                  <motion.span 
                    className={`font-semibold ${
                      isShippingFree 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isShippingFree ? "Free" : <><Tk_icon size={14} className="inline mr-1" />{shippingCost.toFixed(2)}</>}
                  </motion.span>
                ) : (
                  <span className="text-gray-400 text-sm italic">
                    Select method
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Discount */}
          {hasDiscount && (
            <motion.div 
              className="flex justify-between items-center text-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <FiTag className="text-green-600 dark:text-green-400 w-4 h-4" />
                <span className="text-gray-600 dark:text-gray-400">
                  Discount ({appliedCoupon?.code})
                </span>
              </div>
              <span className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                -<Tk_icon size={14} className="mx-1" />{discountAmount.toFixed(2)}
              </span>
            </motion.div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Grand Total */}
          <motion.div 
            className="flex justify-between items-center text-xl font-bold bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            key={total} // Force re-render on total change
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-900 dark:text-white">Grand Total</span>
            <motion.span 
              className="text-blue-600 dark:text-blue-400"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Tk_icon size={24} className="inline mr-2" />{total.toFixed(2)}
            </motion.span>
          </motion.div>

          {/* Shipping Method Info */}
          {isShippingSelected && selectedShippingMethod?.description && (
            <motion.div 
              className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-2">
                <FiTruck className="text-blue-600 dark:text-blue-400 w-4 h-4 mt-0.5 flex-shrink-0" />
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

          {/* Action Buttons */}
          {showActions && (
            <div className="space-y-3 pt-4">
              {isCartEmpty ? (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiAlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <button
                  onClick={onProceedToPayment}
                  disabled={!isShippingSelected}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isShippingSelected
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isShippingSelected ? (
                    <>
                      Proceed to Payment
                      <span className="text-sm opacity-90 flex items-center"><Tk_icon size={12} className="mr-1" />{total.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle className="w-4 h-4" />
                      Select Shipping Method
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price Update Indicator */}
      <motion.div 
        className="px-6 pb-4"
        key={`${selectedShippingMethod?.id}-${total}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {isShippingSelected ? (
            <span className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Prices updated with {selectedShippingMethod.name || selectedShippingMethod.title}
            </span>
          ) : (
            <span>Select shipping method to see final total</span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSummaryCard;
