// app/Components/Cart/CartCoupon.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const CartCoupon = ({ onApplyCoupon, appliedCoupon }) => {
  const [couponCode, setCouponCode] = useState("");

  const handleApply = () => {
    if (couponCode.trim()) {
      onApplyCoupon(couponCode);
    }
  };

  return (
    <div>
      <label
        htmlFor="coupon-code"
        className="block text-lg font-medium text-[var(--color-text-primary)] mb-2"
      >
        Have a Coupon?
      </label>
      {/* FIX: The flex container now ensures elements don't overflow */}
      <div className="flex items-stretch gap-2">
        <input
          id="coupon-code"
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          // FIX: Added min-w-0 to allow the input to shrink correctly in a flex container
          className="flex-1 min-w-0 p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-button-primary)] transition-shadow"
          disabled={!!appliedCoupon}
        />
        <motion.button
          onClick={handleApply}
          // FIX: Used a different background for distinction and ensured consistent padding
          className="px-5 py-2 bg-[var(--color-second-bg)] text-[var(--color-text-primary)] font-bold rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.98 }}
          disabled={!!appliedCoupon}
        >
          Apply
        </motion.button>
      </div>
      {appliedCoupon && (
        <p className="text-[var(--color-accent-green)] text-sm mt-2 font-medium">
          Coupon "{appliedCoupon.code}" applied successfully!
        </p>
      )}
    </div>
  );
};

export default CartCoupon;
