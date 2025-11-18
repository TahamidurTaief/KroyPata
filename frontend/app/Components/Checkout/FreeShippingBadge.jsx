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
    <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaTruck className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">Free Shipping</span>
        </div>
        
        {isEligible ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <FaCheckCircle className="h-3 w-3 mr-1" />
            Eligible
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Tk_icon size={12} className="mr-1" />{remainingAmount.toFixed(2)} away
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
            isEligible ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Status Text */}
      <p className="text-sm text-gray-600">
        {isEligible ? (
          <span className="text-green-700 font-medium">
            🎉 You qualify for free shipping!
          </span>
        ) : (
          <>
            Add <span className="font-medium text-gray-900 inline-flex items-center"><Tk_icon size={14} className="mr-1" />{remainingAmount.toFixed(2)}</span> more to qualify for free shipping
          </>
        )}
      </p>
    </div>
  );
}
