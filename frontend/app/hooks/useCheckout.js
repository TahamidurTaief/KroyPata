// app/hooks/useCheckout.js
import { useState, useCallback, useMemo } from 'react';
import { 
  analyzeCartShipping, 
  calculateCheckout, 
  completeCheckout,
  validateCartItems,
  validateUserInfo,
  formatCheckoutData,
  CheckoutError
} from '../lib/checkout-api';

/**
 * Custom hook for managing checkout state and operations
 * @param {Object} options - Hook options
 * @returns {Object} - Checkout state and methods
 */
export const useCheckout = (options = {}) => {
  const {
    onError = (error) => console.error('Checkout error:', error),
    onSuccess = () => {},
    userId = null,
    debug = false
  } = options;

  // State management
  const [loading, setLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shippingAnalysis, setShippingAnalysis] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  // Clear error when starting new operations
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Analyze cart for shipping options
   */
  const analyzeShipping = useCallback(async (cartItems) => {
    if (debug) {
      console.log('🚚 useCheckout: Analyzing shipping for cart:', cartItems);
    }

    // Validate cart items first
    const cartValidation = validateCartItems(cartItems);
    if (!cartValidation.valid) {
      const error = new Error(cartValidation.error);
      setError(error);
      onError(error);
      return { success: false, error: cartValidation.error };
    }

    setShippingLoading(true);
    clearError();

    try {
      const result = await analyzeCartShipping(cartItems);
      
      setShippingAnalysis(result);
      
      // Auto-select optimal shipping method if available
      if (result.shipping_analysis?.available_methods?.length > 0) {
        const optimalMethod = result.recommendations?.optimal_method || result.shipping_analysis.available_methods[0];
        setSelectedShippingMethod(optimalMethod);
      }

      if (debug) {
        console.log('✅ useCheckout: Shipping analysis completed:', result);
      }

      return { success: true, data: result };

    } catch (error) {
      if (debug) {
        console.error('❌ useCheckout: Shipping analysis failed:', error);
      }
      
      setError(error);
      onError(error);
      return { success: false, error: error.message };

    } finally {
      setShippingLoading(false);
    }
  }, [debug, onError, clearError]);

  /**
   * Calculate checkout totals
   */
  const calculate = useCallback(async (params = {}) => {
    const {
      cartItems,
      couponCode = null,
      shippingMethodId = selectedShippingMethod?.id,
      userInfo = null
    } = params;

    if (debug) {
      console.log('🧮 useCheckout: Calculating checkout:', { 
        cartItems: cartItems?.length, 
        couponCode, 
        shippingMethodId, 
        userInfo: !!userInfo 
      });
    }

    // Validate cart items
    const cartValidation = validateCartItems(cartItems);
    if (!cartValidation.valid) {
      const error = new Error(cartValidation.error);
      setError(error);
      onError(error);
      return { success: false, error: cartValidation.error };
    }

    setLoading(true);
    clearError();

    try {
      const result = await calculateCheckout({
        cartItems,
        couponCode,
        selectedShippingMethodId: shippingMethodId,
        userId,
        userInfo
      });

      const formattedData = formatCheckoutData(result);
      setCheckoutData(formattedData);

      if (debug) {
        console.log('✅ useCheckout: Calculation completed:', formattedData);
      }

      return { success: true, data: formattedData, raw: result };

    } catch (error) {
      if (debug) {
        console.error('❌ useCheckout: Calculation failed:', error);
      }

      if (error instanceof CheckoutError) {
        // Handle specific checkout errors
        if (error.code === 'INVALID_SHIPPING_METHOD') {
          // Reset selected shipping method and provide alternatives
          setSelectedShippingMethod(null);
          if (error.details?.availableMethods?.length > 0) {
            setSelectedShippingMethod(error.details.availableMethods[0]);
          }
        }
      }

      setError(error);
      onError(error);
      return { success: false, error: error.message, code: error.code };

    } finally {
      setLoading(false);
    }
  }, [selectedShippingMethod, userId, debug, onError, clearError]);

  /**
   * Complete the checkout process
   */
  const complete = useCallback(async (params = {}) => {
    const {
      cartItems,
      userInfo,
      shippingMethodId = selectedShippingMethod?.id,
      couponCode = null,
      paymentMethod = 'pending'
    } = params;

    if (debug) {
      console.log('🎯 useCheckout: Completing checkout:', { 
        cartItems: cartItems?.length, 
        userInfo: !!userInfo, 
        shippingMethodId, 
        couponCode,
        paymentMethod
      });
    }

    // Validate required parameters
    const cartValidation = validateCartItems(cartItems);
    if (!cartValidation.valid) {
      const error = new Error(cartValidation.error);
      setError(error);
      onError(error);
      return { success: false, error: cartValidation.error };
    }

    const userValidation = validateUserInfo(userInfo);
    if (!userValidation.valid) {
      const error = new Error(userValidation.error);
      setError(error);
      onError(error);
      return { success: false, error: userValidation.error };
    }

    if (!shippingMethodId) {
      const error = new Error('Please select a shipping method');
      setError(error);
      onError(error);
      return { success: false, error: 'Please select a shipping method' };
    }

    setLoading(true);
    clearError();

    try {
      const result = await completeCheckout({
        cartItems,
        userInfo,
        shippingMethodId,
        couponCode,
        paymentMethod,
        userId
      });

      if (debug) {
        console.log('✅ useCheckout: Checkout completed:', result);
      }

      onSuccess(result);
      return { success: true, data: result };

    } catch (error) {
      if (debug) {
        console.error('❌ useCheckout: Checkout completion failed:', error);
      }

      setError(error);
      onError(error);
      return { success: false, error: error.message, code: error.code };

    } finally {
      setLoading(false);
    }
  }, [selectedShippingMethod, userId, debug, onError, onSuccess, clearError]);

  /**
   * Select a shipping method
   */
  const selectShippingMethod = useCallback((method) => {
    if (debug) {
      console.log('📦 useCheckout: Selecting shipping method:', method);
    }
    
    setSelectedShippingMethod(method);
  }, [debug]);

  // Computed values
  const hasShippingOptions = useMemo(() => {
    return shippingAnalysis?.shipping_analysis?.available_methods?.length > 0;
  }, [shippingAnalysis]);

  const requiresSplitShipping = useMemo(() => {
    return shippingAnalysis?.shipping_analysis?.requires_split_shipping || false;
  }, [shippingAnalysis]);

  const freeShippingEligible = useMemo(() => {
    return shippingAnalysis?.shipping_analysis?.free_shipping_eligible || false;
  }, [shippingAnalysis]);

  const availableShippingMethods = useMemo(() => {
    return shippingAnalysis?.shipping_analysis?.available_methods || [];
  }, [shippingAnalysis]);

  const isLoading = loading || shippingLoading;

  return {
    // State
    loading,
    shippingLoading,
    error,
    shippingAnalysis,
    checkoutData,
    selectedShippingMethod,
    
    // Computed values
    hasShippingOptions,
    requiresSplitShipping,
    freeShippingEligible,
    availableShippingMethods,
    isLoading,
    
    // Methods
    analyzeShipping,
    calculate,
    complete,
    selectShippingMethod,
    clearError
  };
};
