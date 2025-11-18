'use client';

import { useState, useCallback, useEffect } from 'react';

export function useShippingAnalysis(cartItems, cartTotal) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeShipping = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) {
      setAnalysisData(null);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkout/shipping-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_items: cartItems.map(item => ({
            product_id: item.product_id || item.id,
            quantity: item.quantity || 1,
            price: item.price,
            name: item.name,
            weight: item.weight || 0  // Include weight data
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalysisData(data);
        return data;
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Shipping analysis error:', err);
      setError(err.message);
      setAnalysisData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  // Auto-analyze when cart changes
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      analyzeShipping();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [analyzeShipping]);

  // Computed values
  const freeShippingRule = analysisData?.free_shipping_rule;
  const isFreeShippingEligible = freeShippingRule && 
    cartTotal >= (freeShippingRule.threshold_amount || 0);
  
  const hasShippingConflicts = analysisData?.has_shipping_conflicts || false;
  const commonShippingMethods = analysisData?.common_shipping_methods || [];
  const hasEmptyIntersection = commonShippingMethods.length === 0;

  return {
    // Data
    analysisData,
    loading,
    error,
    
    // Methods
    analyzeShipping,
    
    // Computed values
    freeShippingRule,
    isFreeShippingEligible,
    hasShippingConflicts,
    commonShippingMethods,
    hasEmptyIntersection,
    showSplitShippingWarning: hasShippingConflicts && hasEmptyIntersection,
  };
}
