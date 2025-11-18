// app/lib/checkout-api.js
import { fetchWithRetry } from './safeFetch';

// Client-side API utilities for checkout and shipping

const DEBUG_CHECKOUT = true;

/**
 * Analyzes cart items for shipping options and requirements
 * @param {Array} cartItems - Array of cart items with product_id and quantity
 * @returns {Promise<Object>} - Shipping analysis result
 */
export const analyzeCartShipping = async (cartItems) => {
  if (DEBUG_CHECKOUT) {
    console.log('🚚 Analyzing cart shipping for items:', cartItems);
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart items are required and must be a non-empty array');
  }

  try {
    const response = await fetch('/api/checkout/shipping-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: parseInt(item.quantity),
          ...(item.color && { color: item.color }),
          ...(item.size && { size: item.size })
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (DEBUG_CHECKOUT) {
      console.log('✅ Shipping analysis result:', data);
    }

    return {
      success: true,
      ...data
    };

  } catch (error) {
    console.error('❌ Cart shipping analysis failed:', error);
    throw error;
  }
};

/**
 * Calculates checkout totals with shipping and coupons
 * @param {Object} params - Checkout calculation parameters
 * @returns {Promise<Object>} - Checkout calculation result
 */
export const calculateCheckout = async ({
  cartItems,
  couponCode = null,
  selectedShippingMethodId = null,
  userId = null,
  userInfo = null
}) => {
  if (DEBUG_CHECKOUT) {
    console.log('🧮 Calculating checkout:', { 
      cartItems: cartItems.length, 
      couponCode, 
      selectedShippingMethodId, 
      userId 
    });
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart items are required and must be a non-empty array');
  }

  try {
    const response = await fetch('/api/checkout/calculation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: parseInt(item.quantity),
          ...(item.color && { color: item.color }),
          ...(item.size && { size: item.size }),
          ...(item.price && { price: item.price })
        })),
        ...(couponCode && { coupon_code: couponCode }),
        ...(selectedShippingMethodId && { selected_shipping_method_id: selectedShippingMethodId }),
        ...(userId && { user_id: userId }),
        ...(userInfo && { user_info: userInfo })
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error codes
      if (errorData.code === 'INVALID_SHIPPING_METHOD') {
        throw new CheckoutError(errorData.error, 'INVALID_SHIPPING_METHOD', {
          availableMethods: errorData.available_methods
        });
      }
      
      if (errorData.code === 'SPLIT_SHIPPING_REQUIRED') {
        throw new CheckoutError(errorData.error, 'SPLIT_SHIPPING_REQUIRED', {
          requiresSplitShipping: true,
          availableMethods: errorData.available_methods
        });
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (DEBUG_CHECKOUT) {
      console.log('✅ Checkout calculation result:', data);
    }

    return {
      success: true,
      ...data
    };

  } catch (error) {
    console.error('❌ Checkout calculation failed:', error);
    throw error;
  }
};

/**
 * Completes the checkout process and creates an order
 * @param {Object} params - Checkout completion parameters
 * @returns {Promise<Object>} - Order creation result
 */
export const completeCheckout = async ({
  cartItems,
  userInfo,
  shippingMethodId,
  couponCode = null,
  paymentMethod = 'pending',
  userId = null
}) => {
  if (DEBUG_CHECKOUT) {
    console.log('🎯 Completing checkout:', { 
      cartItems: cartItems.length, 
      userInfo: userInfo?.email, 
      shippingMethodId, 
      couponCode,
      paymentMethod,
      userId 
    });
  }

  // Validate required parameters
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart items are required and must be a non-empty array');
  }

  if (!userInfo) {
    throw new Error('User information is required');
  }

  if (!shippingMethodId) {
    throw new Error('Shipping method selection is required');
  }

  const requiredUserFields = ['first_name', 'last_name', 'email', 'phone', 'address'];
  for (const field of requiredUserFields) {
    if (!userInfo[field]) {
      throw new Error(`User ${field.replace('_', ' ')} is required`);
    }
  }

  try {
    const response = await fetch('/api/checkout/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: parseInt(item.quantity),
          ...(item.color && { color: item.color }),
          ...(item.size && { size: item.size }),
          ...(item.price && { price: item.price })
        })),
        user_info: userInfo,
        shipping_method_id: shippingMethodId,
        ...(couponCode && { coupon_code: couponCode }),
        payment_method: paymentMethod,
        ...(userId && { user_id: userId })
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error codes
      if (errorData.code === 'SPLIT_SHIPPING_REQUIRED') {
        throw new CheckoutError(errorData.error, 'SPLIT_SHIPPING_REQUIRED', {
          requiresSplitShipping: true
        });
      }
      
      if (errorData.code === 'VALIDATION_FAILED') {
        throw new CheckoutError('Checkout validation failed', 'VALIDATION_FAILED', {
          details: errorData.details
        });
      }

      if (errorData.code === 'ORDER_CREATION_FAILED') {
        throw new CheckoutError('Failed to create order', 'ORDER_CREATION_FAILED', {
          details: errorData.details
        });
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (DEBUG_CHECKOUT) {
      console.log('✅ Checkout completed successfully:', data);
    }

    return {
      success: true,
      ...data
    };

  } catch (error) {
    console.error('❌ Checkout completion failed:', error);
    throw error;
  }
};

/**
 * Custom error class for checkout-specific errors
 */
export class CheckoutError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'CheckoutError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Validates cart items before checkout operations
 * @param {Array} cartItems - Cart items to validate
 * @returns {Object} - Validation result
 */
export const validateCartItems = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) {
    return { valid: false, error: 'Cart items must be an array' };
  }

  if (cartItems.length === 0) {
    return { valid: false, error: 'Cart cannot be empty' };
  }

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    
    if (!item.product_id && !item.id) {
      return { valid: false, error: `Item ${i + 1}: Product ID is required` };
    }
    
    if (!item.quantity || item.quantity < 1) {
      return { valid: false, error: `Item ${i + 1}: Valid quantity is required` };
    }
    
    if (item.quantity > 999) {
      return { valid: false, error: `Item ${i + 1}: Quantity cannot exceed 999` };
    }
  }

  return { valid: true };
};

/**
 * Validates user information for checkout
 * @param {Object} userInfo - User information to validate
 * @returns {Object} - Validation result
 */
export const validateUserInfo = (userInfo) => {
  if (!userInfo || typeof userInfo !== 'object') {
    return { valid: false, error: 'User information is required' };
  }

  const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'address'];
  
  for (const field of requiredFields) {
    if (!userInfo[field] || (typeof userInfo[field] === 'string' && userInfo[field].trim() === '')) {
      return { 
        valid: false, 
        error: `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required` 
      };
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userInfo.email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  // Validate phone format (basic)
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(userInfo.phone)) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }

  return { valid: true };
};

/**
 * Formats checkout data for display
 * @param {Object} checkoutData - Raw checkout data from API
 * @returns {Object} - Formatted data for UI
 */
export const formatCheckoutData = (checkoutData) => {
  if (!checkoutData || !checkoutData.success) {
    return null;
  }

  return {
    subtotal: parseFloat(checkoutData.calculation_summary?.cart_subtotal || 0),
    shippingCost: parseFloat(checkoutData.calculation_summary?.shipping_cost || 0),
    discount: parseFloat(checkoutData.calculation_summary?.discount_amount || 0),
    total: parseFloat(checkoutData.calculation_summary?.final_total || 0),
    currency: checkoutData.calculation_summary?.currency || 'BDT',
    
    shipping: {
      methods: checkoutData.shipping_details?.available_methods || [],
      selected: checkoutData.shipping_details?.selected_method,
      requiresSplit: checkoutData.shipping_details?.requires_split_shipping || false,
      freeShippingEligible: checkoutData.shipping_details?.free_shipping_eligible || false,
      freeShippingRule: checkoutData.shipping_details?.qualifying_free_rule
    },
    
    coupon: checkoutData.coupon_details && checkoutData.coupon_details.code ? {
      code: checkoutData.coupon_details.code,
      valid: checkoutData.coupon_details.valid !== false,
      discount: parseFloat(checkoutData.coupon_details.total_discount || 0),
      message: checkoutData.coupon_details.message || checkoutData.coupon_details.error
    } : null,
    
    recommendations: checkoutData.recommendations || {},
    
    timestamp: checkoutData.client_info?.timestamp || checkoutData.timestamp
  };
};
