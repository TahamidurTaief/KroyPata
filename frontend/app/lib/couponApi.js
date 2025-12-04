/**
 * Coupon API Functions for Frontend
 * 
 * Example usage of the Coupon API endpoints
 */

import { API_BASE_URL } from './api';

/**
 * Fetch all available coupons
 */
export const getCoupons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/coupons/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

/**
 * Validate a coupon against cart items
 * @param {string} couponCode - The coupon code to validate
 * @param {Array} cartItems - Array of cart items with quantity and product info
 */
export const validateCoupon = async (couponCode, cartItems) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/coupons/validate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coupon_code: couponCode,
        cart_items: cartItems
      })
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          message: 'Coupon not found or inactive.'
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

/**
 * Enhanced coupon validation with cart total and user support
 * @param {string} couponCode - The coupon code to validate
 * @param {Array} cartItems - Array of cart items with quantity and product info
 * @param {number} cartTotal - Total cart value (optional, required for CART_TOTAL_DISCOUNT)
 * @param {number} userId - User ID (optional, required for FIRST_TIME_USER and USER_SPECIFIC)
 */
export const validateCouponEnhanced = async (couponCode, cartItems, cartTotal = null, userId = null) => {
  try {
    const requestBody = {
      coupon_code: couponCode,
      cart_items: cartItems
    };

    // Add optional parameters if provided
    if (cartTotal !== null) {
      requestBody.cart_total = cartTotal;
    }
    if (userId !== null) {
      requestBody.user_id = userId;
    }

    const response = await fetch(`${API_BASE_URL}/api/orders/coupons/validate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          message: 'Coupon not found or inactive.'
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

/**
 * Calculate discount for a specific coupon
 * @param {number} couponId - The coupon ID
 * @param {number} cartTotal - Total cart value
 * @param {number} shippingCost - Shipping cost
 * @param {Array} cartItems - Array of cart items
 */
export const calculateDiscount = async (couponId, cartTotal, shippingCost, cartItems) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/coupons/${couponId}/calculate-discount/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_total: cartTotal,
        shipping_cost: shippingCost,
        cart_items: cartItems
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calculating discount:', error);
    throw error;
  }
};

/**
 * Example usage in a React component
 */
export const useCouponExample = () => {
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState(null);
  const [cartItems] = useState([]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const result = await validateCoupon(couponCode, cartItems);
      setCouponValidation(result);
      
      if (result.valid && result.coupon) {
        // Calculate discount if coupon is valid
        const discount = await calculateDiscount(
          result.coupon.id,
          100.00, // cart total
          10.00,  // shipping cost
          cartItems
        );
        console.log('Discount calculation:', discount);
      }
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      setCouponValidation({
        valid: false,
        message: 'Failed to validate coupon. Please try again.'
      });
    }
  };

  return {
    couponCode,
    setCouponCode,
    couponValidation,
    handleValidateCoupon
  };
};

/**
 * Example cart discount calculation
 */
export const calculateCartTotal = (cartItems, shippingCost, appliedCoupon) => {
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  let productDiscount = 0;
  let shippingDiscount = 0;

  if (appliedCoupon && appliedCoupon.discount) {
    productDiscount = appliedCoupon.discount.product_discount || 0;
    shippingDiscount = appliedCoupon.discount.shipping_discount || 0;
  }

  const finalShippingCost = Math.max(0, shippingCost - shippingDiscount);
  const finalTotal = subtotal - productDiscount + finalShippingCost;

  return {
    subtotal,
    productDiscount,
    shippingCost,
    shippingDiscount,
    finalShippingCost,
    total: finalTotal,
    savings: productDiscount + shippingDiscount
  };
};
