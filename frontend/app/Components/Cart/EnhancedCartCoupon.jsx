// app/Components/Cart/EnhancedCartCoupon.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const EnhancedCartCoupon = ({ onApplyCoupon, appliedCoupon, onCouponRemoved }) => {
  const [code, setCode] = useState("");

  const handleApply = () => {
    if (code.trim()) onApplyCoupon(code);
  };

  return (
    <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm" style={{ backgroundColor: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Coupon Code</h3>
      <p className="text-xs mb-3 sm:mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        Apply a valid coupon code to get instant discounts on your order. Enter your code below and click apply to see the savings reflected in your cart total.
      </p>

      {!appliedCoupon ? (
        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon Code"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full focus:outline-none text-xs sm:text-sm transition-colors"
            style={{ 
              backgroundColor: 'var(--muted)', 
              color: 'var(--foreground)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'transparent'}
          />
          <button
            onClick={handleApply}
            disabled={!code.trim()}
            className="w-full font-bold py-2.5 sm:py-3 rounded-full transition-colors disabled:opacity-50 text-xs sm:text-sm"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: '#ffffff'
            }}
            onMouseEnter={(e) => !e.target.disabled && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => !e.target.disabled && (e.target.style.opacity = '1')}
          >
            Apply
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-3 sm:p-4" style={{ backgroundColor: '#f0fdf4' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-xs sm:text-sm" style={{ color: '#16a34a' }}>Coupon Applied</p>
              <p className="text-xs" style={{ color: '#16a34a' }}>{appliedCoupon.code}</p>
            </div>
            <button 
              onClick={onCouponRemoved}
              className="text-xs font-bold underline transition-colors"
              style={{ color: '#ef4444' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCartCoupon;