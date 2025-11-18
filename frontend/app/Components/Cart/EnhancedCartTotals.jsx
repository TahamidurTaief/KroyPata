'use client';

import { motion } from 'framer-motion';
import { FiTruck, FiTag, FiPercent, FiMinus } from 'react-icons/fi';
import Tk_icon from "../Common/Tk_icon";
import { FaTag } from 'react-icons/fa';
import { useAuth } from "@/app/contexts/AuthContext";
import { 
  formatBDTWithIcon, 
  CartTotal, 
  formatDiscountWithIcon, 
  formatShippingWithIcon 
} from '@/app/utils/currencyWithIcon';

const EnhancedCartTotals = ({
  subtotal,
  shipping,
  appliedCoupon,
  total,
  shippingMethodName,
  showShipping = true,
  selectedShippingMethod = null,
  cartItems = [], // Add cartItems prop to check for wholesale pricing
}) => {
  const { user } = useAuth();
  const isShippingFree = shipping === 0;
  const hasShippingSelected = selectedShippingMethod !== null;
  
  // Check if user is wholesaler and cart has wholesale items
  const isWholesaler = user?.user_type === 'WHOLESALER';
  const hasWholesaleItems = cartItems.some(item => item.is_wholesale);
  
  // Calculate individual discount components
  const productDiscount = appliedCoupon?.product_discount || 0;
  const shippingDiscount = appliedCoupon?.shipping_discount || 0;
  const totalDiscount = appliedCoupon?.total_discount || productDiscount + shippingDiscount;
  
  const finalShipping = Math.max(0, shipping - shippingDiscount);

  return (
    <div className="space-y-4">
      {/* Subtotal */}
      <div className="flex justify-between items-center text-lg">
        <div className="flex items-center gap-2">
          <Tk_icon className="w-4 h-4" color="var(--color-text-secondary)" />
          <span style={{color:'var(--color-text-secondary)'}}>
            {isWholesaler && hasWholesaleItems ? 'Wholesale Subtotal' : 'Cart Subtotal'}
          </span>
        </div>
        <span className="font-semibold" style={{color:'var(--color-text-primary)'}}>
          {formatBDTWithIcon(subtotal, true, { iconSize: 16, className: 'font-semibold' })}
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

      {/* Product Discount */}
      {productDiscount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-between items-center text-lg"
        >
          <div className="flex items-center gap-2">
            <FaTag className="w-4 h-4" style={{color:'var(--color-accent-green)'}} />
            <span style={{color:'var(--color-text-secondary)'}}>
              Product Discount ({appliedCoupon?.code})
            </span>
          </div>
          <span className="font-semibold" style={{color:'var(--color-accent-green)'}}>
            {formatDiscount(productDiscount, true)}
          </span>
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
              <FiTruck className="w-4 h-4" style={{color: hasShippingSelected ? 'var(--color-button-primary)' : 'var(--color-text-secondary)'}} />
              <span style={{color:'var(--color-text-secondary)'}}>
                {shippingMethodName || 'Shipping'}
              </span>
            </div>
            <div className="text-right">
              {hasShippingSelected ? (
                <div className="flex flex-col items-end">
                  {shippingDiscount > 0 && (
                    <div className="text-sm line-through" style={{color:'var(--color-text-secondary)'}}>
                      {formatBDTWithIcon(shipping, true, { iconSize: 12, className: 'text-sm' })}
                    </div>
                  )}
                  <span className="font-semibold" style={{color: finalShipping === 0 ? 'var(--color-accent-green)' : 'var(--color-text-primary)'}}>
                    {formatShippingWithIcon(finalShipping, finalShipping === 0, { iconSize: 14, className: 'font-semibold' })}
                  </span>
                </div>
              ) : (
                <span className="text-sm italic" style={{color:'var(--color-text-secondary)'}}>
                  Select method
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Shipping Discount */}
      {shippingDiscount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-between items-center text-lg"
        >
          <div className="flex items-center gap-2">
            <FiTruck className="w-4 h-4" style={{color:'var(--color-accent-green)'}} />
            <span style={{color:'var(--color-text-secondary)'}}>
              Shipping Discount ({appliedCoupon?.code})
            </span>
          </div>
          <span className="font-semibold" style={{color:'var(--color-accent-green)'}}>
            {formatDiscount(shippingDiscount, true)}
          </span>
        </motion.div>
      )}

      {/* Total Discount Summary (if there are multiple discounts) */}
      {appliedCoupon && totalDiscount > 0 && (productDiscount > 0 || shippingDiscount > 0) && (
        <div className="pt-3" style={{borderTop:'1px solid var(--color-border)'}}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-between items-center text-sm rounded-lg p-3"
            style={{
              background: 'color-mix(in srgb, var(--color-accent-green) 12%, transparent)'
            }}
          >
            <div className="flex items-center gap-2">
              <FaTag className="w-3 h-3" style={{color:'var(--color-accent-green)'}} />
              <span className="font-medium" style={{color:'var(--color-accent-green)'}}>
                Total Savings with {appliedCoupon.code}
              </span>
            </div>
            <span className="font-bold" style={{color:'var(--color-accent-green)'}}>
              {formatDiscount(totalDiscount, true)}
            </span>
          </motion.div>
        </div>
      )}

      {/* Order Total */}
      <div className="pt-4" style={{borderTop:'1px solid var(--color-border)'}}>
        <motion.div 
          className="flex justify-between items-center text-xl"
          animate={{ scale: appliedCoupon ? 1.02 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-bold" style={{color:'var(--color-text-primary)'}}>Order Total</span>
          <div className="text-right">
            <CartTotal amount={total} className="text-primary" />
            {totalDiscount > 0 && (
              <div className="text-sm font-medium" style={{color:'var(--color-accent-green)'}}>
                You saved {formatBDTWithIcon(totalDiscount, true, { 
                  iconSize: 14, 
                  className: 'text-green-600 font-medium' 
                })}!
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tax Notice */}
      <div className="text-center text-sm pt-2" style={{color:'var(--color-text-secondary)'}}>
        <p>Taxes calculated at checkout</p>
        {appliedCoupon && (
          <p className="font-medium" style={{color:'var(--color-accent-green)'}}>
            🎉 Coupon {appliedCoupon.code} applied!
          </p>
        )}
      </div>
    </div>
  );
};

export default EnhancedCartTotals;
