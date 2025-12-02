// app/Components/Cart/EnhancedCartTotals.jsx
"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Tk_icon from "../Common/Tk_icon";

const EnhancedCartTotals = ({
  subtotal,
  shipping,
  appliedCoupon,
  total,
  cartItems = [],
  shippingAnalysis
}) => {
  const discount = appliedCoupon ? (appliedCoupon.product_discount || 0) : 0;
  const isShippingFree = shippingAnalysis?.free_shipping_rule && 
    subtotal >= (shippingAnalysis.free_shipping_rule.threshold_amount || 0);
  
  return (
    <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 lg:p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--foreground)' }}>Cart Total</h3>
      
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between items-center text-xs sm:text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          <span>Cart Subtotal</span>
          <span className="flex items-center"><Tk_icon size={14} className="mr-1"/>{subtotal.toFixed(2)}</span>
        </div>


        {discount > 0 && (
          <div className="flex justify-between items-center text-xs sm:text-sm font-medium" style={{ color: '#16a34a' }}>
            <span>Discount</span>
            <span className="flex items-center">-<Tk_icon size={14} className="mr-1"/>{discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center text-base sm:text-lg font-bold pt-3 sm:pt-4 mt-3 sm:mt-4" style={{ color: 'var(--foreground)', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <span>Cart Total</span>
          <span className="flex items-center">
            <Tk_icon size={18} className="mr-1"/>
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      <Link href="/checkout" className="block w-full">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full font-bold py-2.5 sm:py-3 rounded-full transition-colors shadow-sm text-xs sm:text-sm"
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Proceed to checkout
        </motion.button>
      </Link>
    </div>
  );
};

export default EnhancedCartTotals;