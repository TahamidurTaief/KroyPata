import { getActiveCoupons, validateCoupon } from '../app/lib/api';

/**
 * Simple coupon application - Backend only
 * @param {string} couponCode - The coupon code to apply  
 * @param {Array} cartItems - Array of cart items
 * @param {number} subtotal - Order subtotal
 * @returns {Promise<Object>} Result object with success, discount, message
 */
export const applyCouponUnified = async (couponCode, cartItems = [], subtotal = 0) => {
  if (!couponCode.trim()) {
    return {
      success: false,
      error: 'Please enter a coupon code'
    };
  }

  try {
    // Validate coupon with backend
    const result = await validateCoupon(couponCode.toUpperCase(), cartItems, subtotal);
    
    if (result && result.valid) {
      return {
        success: true,
        discount: result.discount_amount || 0,
        message: result.message || `${couponCode} applied successfully!`,
        couponCode: couponCode.toUpperCase(),
        type: result.discount_type || 'unknown'
      };
    } else {
      return {
        success: false,
        error: result.message || 'Invalid coupon code'
      };
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    return {
      success: false,
      error: 'Unable to validate coupon. Please try again.'
    };
  }
};

/**
 * Get available coupons from backend
 * @returns {Promise<Array>} Array of available coupons
 */
export const getAvailableCoupons = async () => {
  try {
    const coupons = await getActiveCoupons();
    return Array.isArray(coupons) ? coupons : [];
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};
