'use client';

import { useState, useEffect, useCallback } from 'react';
import FreeShippingBadge from './FreeShippingBadge';
import SplitShippingAlert from './SplitShippingAlert';
import Tk_icon from "../Common/Tk_icon";

export default function ShippingAnalysis({ cartItems, cartTotal, onAnalysisUpdate }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const analyzeShipping = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) {
      setAnalysisData(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🚚 Starting shipping analysis for cart items:', cartItems);
      
      // Add timeout and improved error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/checkout/shipping-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_items: cartItems.map(item => ({
            product_id: item.productId || item.product_id || item.id,
            quantity: item.quantity || 1,
            price: item.price,
            name: item.name,
            weight: item.weight || 0 // Include weight for calculations
          }))
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('🚚 Shipping analysis response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('🚚 Shipping analysis result:', data);
      
      if (data.success) {
        setAnalysisData(data);
        setAlertDismissed(false);
        onAnalysisUpdate?.(data);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('❌ Shipping analysis error:', err);
      
      // Enhanced error handling with fallback shipping methods
      let errorMessage = 'Connection error';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out';
      } else if (err.message && err.message.includes('Product not found')) {
        errorMessage = 'Cart contains invalid items';
      } else if (err.code === 'ECONNABORTED' || err.message.includes('ECONNABORTED')) {
        errorMessage = 'Server connection failed';
      }
      
      setError(errorMessage);
      
      // Provide comprehensive fallback analysis data
      const fallbackData = {
        success: true,
        free_shipping_rule: {
          threshold_amount: 50,
          description: 'Free shipping on orders over $50'
        },
        requires_split_shipping: false,
        available_shipping_methods: [
          {
            id: 'standard',
            name: 'Standard Delivery (3-5 days)',
            calculated_price: 5.99,
            base_price: 5.99,
            delivery_estimated_time: '3-5 business days'
          },
          {
            id: 'express',
            name: 'Express Delivery (1-2 days)',
            calculated_price: 12.99,
            base_price: 12.99,
            delivery_estimated_time: '1-2 business days'
          },
          {
            id: 'free',
            name: 'Free Standard Shipping',
            calculated_price: 0,
            base_price: 0,
            delivery_estimated_time: '5-7 business days',
            is_free_shipping_rule: true
          }
        ],
        cart_analysis: {
          total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          total_weight: cartItems.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0),
          pricing_method_used: 'retail'
        },
        missing_products: [],
        fallback: true,
        error: errorMessage
      };
      
      setAnalysisData(fallbackData);
      onAnalysisUpdate?.(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [cartItems, onAnalysisUpdate]);

  // Trigger analysis when cart items change
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      analyzeShipping();
    }, 500); // Debounce to avoid too many API calls

    return () => clearTimeout(debounceTimeout);
  }, [analyzeShipping]); // Only depend on the analyzeShipping function

  // Reset alert dismissal when cart changes significantly
  useEffect(() => {
    setAlertDismissed(false);
  }, [cartItems.length]);

  // Normalized fields (after API normalization layer)
  const freeShippingRule = analysisData?.free_shipping_rule;
  const hasShippingConflict = analysisData?.requires_split_shipping; // backend flag
  const shippingMethods = analysisData?.available_shipping_methods || [];
  const missingProducts = analysisData?.missing_products || [];

  const isFreeShippingEligible = freeShippingRule && 
    cartTotal >= (freeShippingRule.threshold_amount || 0);

  // Calculate shipping method intersection for conflict detection
  const shippingMethodIntersection = hasShippingConflict 
    ? (analysisData?.shipping_groups?.length > 1 
        ? analysisData.shipping_groups.reduce((intersection, group) => {
            if (!intersection) return group.available_methods || [];
            return intersection.filter(method => 
              (group.available_methods || []).some(m => m.id === method.id)
            );
          }, null) || []
        : [])
    : [];

  const showSplitShippingAlert = hasShippingConflict && 
    (!shippingMethodIntersection || shippingMethodIntersection.length === 0) &&
    !alertDismissed;

  if (loading) {
    return (
      <div className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Calculating shipping options...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs sm:text-sm text-red-500">
        Unable to analyze shipping: {error}
      </div>
    );
  }

  if (!analysisData || !cartItems.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Cart Weight and Quantity Summary */}
      {analysisData.cart_analysis && (
        <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <span style={{ color: 'var(--muted-foreground)' }}>
                Items: <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{analysisData.cart_analysis.total_quantity}</span>
              </span>
              {analysisData.cart_analysis.total_weight && (
                <span style={{ color: 'var(--muted-foreground)' }}>
                  Weight: <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{parseFloat(analysisData.cart_analysis.total_weight).toFixed(2)} kg</span>
                </span>
              )}
            </div>
            {analysisData.cart_analysis.pricing_method_used && (
              <span className="px-2 py-1 text-[10px] rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                {analysisData.cart_analysis.pricing_method_used} pricing
              </span>
            )}
          </div>
        </div>
      )}

      {/* Split Shipping Alert */}
      {showSplitShippingAlert && (
        <SplitShippingAlert 
          hasShippingConflict={hasShippingConflict}
          conflictDetails={analysisData.shipping_groups}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* Free Shipping Badge */}
      {freeShippingRule && (
        <FreeShippingBadge 
          cartTotal={cartTotal}
          thresholdAmount={freeShippingRule.threshold_amount}
          isEligible={isFreeShippingEligible}
        />
      )}

      {/* Additional shipping info */}
      {missingProducts.length > 0 && (
        <div className="rounded-lg p-3 text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-600">
          Some items were removed or unavailable (IDs: {missingProducts.slice(0,3).join(', ')}{missingProducts.length>3?'…':''}). Please refresh cart.
        </div>
      )}

      {shippingMethods.length > 0 && (
        <div className="rounded-lg p-3 sm:p-4 space-y-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-semibold tracking-wide" style={{ color: 'var(--foreground)' }}>
              Available Shipping Methods
            </h4>
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              {shippingMethods.length}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {shippingMethods.map((m, idx) => {
              const price = parseFloat(m.calculated_price || m.base_price || 0);
              const isFree = price === 0 || m.id === 'free';
              return (
                <li
                  key={m.id}
                  className="group relative overflow-hidden rounded-md px-2 sm:px-3 py-2 flex items-center justify-between text-xs transition-colors"
                  style={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                >
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <span className="font-medium truncate" style={{ color: 'var(--foreground)' }}>{m.name}</span>
                    {m.tier_applied && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-500">
                        Tier
                      </span>
                    )}
                    {m.is_free_shipping_rule && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-500">
                        Free Rule
                      </span>
                    )}
                  </div>
                  <div className="font-semibold tabular-nums" style={{ color: isFree ? '#16a34a' : 'var(--foreground)' }}>
                    {isFree ? 'FREE' : <><Tk_icon className="mr-1" size={14} />{price.toFixed(2)}</>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
