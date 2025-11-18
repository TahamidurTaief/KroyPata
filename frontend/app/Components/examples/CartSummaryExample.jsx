'use client';

import { useState, useMemo } from 'react';
import ShippingAnalysis from '../Checkout/ShippingAnalysis';
import { useShippingAnalysis } from '../../hooks/useShippingAnalysis';

// Example component demonstrating how to use the FreeShippingRule components
export default function CartSummaryWithShipping({ cartItems, onCheckout }) {
  const [analysisData, setAnalysisData] = useState(null);

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }, [cartItems]);

  const handleAnalysisUpdate = (data) => {
    setAnalysisData(data);
  };

  const canCheckout = cartItems.length > 0 && !analysisData?.has_critical_shipping_issues;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Cart Items Summary */}
      <div className="space-y-3 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <span className="text-gray-900">{item.name}</span>
              <span className="text-gray-500 ml-2">×{item.quantity}</span>
            </div>
            <span className="text-gray-900 font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Shipping Analysis - Free Shipping Badge and Split Shipping Alert */}
      <ShippingAnalysis 
        cartItems={cartItems}
        cartTotal={cartTotal}
        onAnalysisUpdate={handleAnalysisUpdate}
      />

      {/* Total */}
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Shipping and taxes calculated at checkout.
        </p>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={!canCheckout}
        className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors ${
          canCheckout
            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {cartItems.length === 0 
          ? 'Add items to checkout'
          : 'Proceed to Checkout'
        }
      </button>

      {/* Additional shipping info */}
      {analysisData?.estimated_shipping_cost && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <strong>Estimated Shipping:</strong> ${analysisData.estimated_shipping_cost.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

// Alternative hook-based usage example
export function HookBasedExample({ cartItems }) {
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const {
    analysisData,
    loading,
    error,
    freeShippingRule,
    isFreeShippingEligible,
    hasShippingConflicts,
    showSplitShippingWarning,
  } = useShippingAnalysis(cartItems, cartTotal);

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-medium mb-2">Shipping Status</h3>
      
      {loading && <p className="text-gray-500">Analyzing shipping...</p>}
      
      {error && (
        <p className="text-red-600 text-sm">Error: {error}</p>
      )}
      
      {freeShippingRule && (
        <div className="mb-2">
          <p className="text-sm">
            Free shipping threshold: ${freeShippingRule.threshold_amount}
          </p>
          <p className="text-sm">
            Status: {isFreeShippingEligible ? '✅ Eligible' : '❌ Not eligible'}
          </p>
        </div>
      )}
      
      {showSplitShippingWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
          ⚠️ Items require split shipping
        </div>
      )}
    </div>
  );
}
