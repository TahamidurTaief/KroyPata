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
      });

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
      
      // Check if it's a "Product not found" error
      if (err.message && err.message.includes('Product not found')) {
        console.log('🚚 Product not found error - cart may have invalid/test items');
        setError('Unable to analyze shipping: Cart contains invalid items');
      } else {
        setError(err.message);
      }
      
      setAnalysisData(null);
      // Provide fallback analysis data
      onAnalysisUpdate?.({
        success: true,
        free_shipping_rule: null,
        requires_split_shipping: false,
        available_shipping_methods: [],
        missing_products: [],
        fallback: true,
        error: err.message
      });
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
      <div className="rounded-lg border mb-4 p-4" style={{background:'var(--color-second-bg)',borderColor:'var(--color-border)'}}>
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full" style={{background:'var(--color-muted-bg)'}}></div>
            <div className="h-4 w-32 rounded" style={{background:'var(--color-muted-bg)'}}></div>
          </div>
          <div className="h-2 w-2/3 rounded" style={{background:'var(--color-muted-bg)'}}></div>
          <div className="h-3 w-1/3 rounded" style={{background:'var(--color-muted-bg)'}}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg p-4 mb-4" style={{background:'color-mix(in srgb, var(--color-accent-orange) 12%, transparent)',border:'1px solid var(--color-border)'}}>
        <div className="flex items-center gap-2 text-sm" style={{color:'var(--color-text-primary)'}}>
          <span role="img" aria-label="warning">⚠️</span>
          <span>Unable to analyze shipping: {error}</span>
        </div>
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
        <div className="rounded-lg p-3 text-xs" style={{background:'var(--color-second-bg)',border:'1px solid var(--color-border)'}}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span style={{color:'var(--color-text-secondary)'}}>
                Items: <span className="font-semibold" style={{color:'var(--color-text-primary)'}}>{analysisData.cart_analysis.total_quantity}</span>
              </span>
              {analysisData.cart_analysis.total_weight && (
                <span style={{color:'var(--color-text-secondary)'}}>
                  Weight: <span className="font-semibold" style={{color:'var(--color-text-primary)'}}>{parseFloat(analysisData.cart_analysis.total_weight).toFixed(2)} kg</span>
                </span>
              )}
            </div>
            {analysisData.cart_analysis.pricing_method_used && (
              <span className="px-2 py-1 text-[10px] rounded" style={{background:'var(--color-muted-bg)',color:'var(--color-text-secondary)'}}>
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
        <div className="rounded-lg p-3 text-xs" style={{background:'color-mix(in srgb, var(--color-accent-orange) 10%, transparent)',border:'1px solid var(--color-border)',color:'var(--color-text-primary)'}}>
          Some items were removed or unavailable (IDs: {missingProducts.slice(0,3).join(', ')}{missingProducts.length>3?'…':''}). Please refresh cart.
        </div>
      )}

      {shippingMethods.length > 0 && (
        <div className="rounded-lg p-4 space-y-3" style={{background:'var(--color-second-bg)',border:'1px solid var(--color-border)'}}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold tracking-wide" style={{color:'var(--color-text-primary)'}}>
              Available Shipping Methods
            </h4>
            <span className="text-[10px] px-2 py-1 rounded-full" style={{background:'var(--color-muted-bg)',color:'var(--color-text-secondary)'}}>
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
                  className="group relative overflow-hidden rounded-md border px-3 py-2 flex items-center justify-between text-xs"
                  style={{
                    background:'linear-gradient(135deg, var(--color-surface) 0%, var(--color-second-bg) 100%)',
                    borderColor:'var(--color-border)'
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate" style={{color:'var(--color-text-primary)'}}>{m.name}</span>
                    {m.tier_applied && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded" style={{background:'color-mix(in srgb, var(--color-accent-green) 18%, transparent)',color:'var(--color-accent-green)'}}>
                        Tier
                      </span>
                    )}
                    {m.is_free_shipping_rule && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded" style={{background:'color-mix(in srgb, var(--color-accent-green) 18%, transparent)',color:'var(--color-accent-green)'}}>
                        Free Rule
                      </span>
                    )}
                  </div>
                  <div className="font-semibold tabular-nums" style={{color: isFree ? 'var(--color-accent-green)' : 'var(--color-text-primary)'}}>
                    {isFree ? 'FREE' : <><Tk_icon className="mr-1" size={16} />{price.toFixed(2)}</>}
                  </div>
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0))'}} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
