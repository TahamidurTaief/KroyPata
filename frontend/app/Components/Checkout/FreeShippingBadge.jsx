'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTruck } from 'react-icons/fa';
import Tk_icon from '../Common/Tk_icon';

export default function FreeShippingBadge({ cartTotal, thresholdAmount, isEligible }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const remainingAmount = thresholdAmount - cartTotal;
  const progressPercentage = Math.min((cartTotal / thresholdAmount) * 100, 100);

  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaTruck className="h-5 w-5 text-[var(--primary)]" />
          <span className="font-medium text-[var(--foreground)]">Free Shipping</span>
        </div>
        
        {isEligible ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
            <FaCheckCircle className="h-3 w-3 mr-1" />
            Eligible
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fefce8] text-[#854d0e] border border-[#fef08a]">
            <Tk_icon size={12} className="mr-1" />{remainingAmount.toFixed(2)} away
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--muted)] rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
            isEligible ? 'bg-[#22c55e]' : 'bg-[var(--primary)]'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Status Text */}
      <p className="text-sm text-[var(--muted-foreground)]">
        {isEligible ? (
          <span className="text-[#15803d] font-medium">
            🎉 You qualify for free shipping!
          </span>
        ) : (
          <>
            Add <span className="font-medium text-[var(--foreground)] inline-flex items-center"><Tk_icon size={14} className="mr-1" />{remainingAmount.toFixed(2)}</span> more to qualify for free shipping
          </>
        )}
      </p>
    </div>
  );
}
