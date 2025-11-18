// Enhanced coupon utilities for better cart integration        errorMessage = `Minimum cart total of ${formatBDT(result.min_cart_total, true, true)} required (current: ${formatBDT(subtotal, true, true)})`;  // Version: 2.1 - Added server-side validation and error handling

import { formatBDT } from '@/app/utils/currency';
import { getActiveCoupons, validateCoupon } from '../app/lib/api';

/**
 * Enhanced coupon application with detailed validation
 * @param {string} couponCode - The coupon code to apply  
 * @param {Array} cartItems - Array of cart items
 * @param {number} subtotal - Order subtotal
 * @param {Object} user - User object (optional)
 * @returns {Promise<Object>} Result object with success, discount details, and validation info
 */
export const applyCouponEnhanced = async (couponCode, cartItems = [], subtotal = 0, user = null) => {
  if (!couponCode.trim()) {
    return {
      success: false,
      error: 'Please enter a coupon code'
    };
  }

  try {
    const result = await validateCoupon(
      couponCode.toUpperCase(), 
      cartItems, 
      subtotal, 
      user?.id
    );
    
    if (result && result.valid) {
      return {
        success: true,
        coupon: {
          code: couponCode.toUpperCase(),
          discount_type: result.discount_type,
          discount_value: result.discount_value,
          product_discount: result.product_discount || 0,
          shipping_discount: result.shipping_discount || 0,
          total_discount: result.discount_amount || 0,
          message: result.message || `${couponCode} applied successfully!`
        },
        validation: {
          min_cart_total: result.min_cart_total,
          min_quantity_required: result.min_quantity_required,
          user_specific: result.user_specific,
          first_time_user_only: result.first_time_user_only,
          is_first_time_user: result.is_first_time_user,
          user_eligible: result.user_eligible
        }
      };
    } else {
      // Enhanced error handling
      let errorMessage = result?.message || 'Invalid coupon code';
      let errorType = 'invalid';
      
      if (result?.min_cart_total && subtotal < result.min_cart_total) {
        errorMessage = `Minimum cart total of $${result.min_cart_total} required (current: $${subtotal.toFixed(2)})`;
        errorType = 'min_cart_total';
      } else if (result?.min_quantity_required) {
        const currentQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        errorMessage = `Minimum ${result.min_quantity_required} items required (current: ${currentQuantity})`;
        errorType = 'min_quantity';
      } else if (result?.user_specific && !result?.user_eligible) {
        errorMessage = 'This coupon is not available for your account';
        errorType = 'user_specific';
      } else if (result?.first_time_user_only && !result?.is_first_time_user) {
        errorMessage = 'This coupon is for first-time customers only';
        errorType = 'first_time_only';
      }

      return {
        success: false,
        error: errorMessage,
        errorType,
        validation: result
      };
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    return {
      success: false,
      error: 'Unable to validate coupon. Please try again.',
      errorType: 'network_error'
    };
  }
};

/**
 * Get available coupons with user-specific filtering
 * @param {Object} user - User object (optional)
 * @param {Array} cartItems - Current cart items for applicability check
 * @param {number} cartTotal - Current cart total
 * @returns {Promise<Array>} Array of applicable coupons
 */
export const getApplicableCoupons = async (user = null, cartItems = [], cartTotal = 0) => {
  try {
    const allCoupons = await getActiveCoupons();
    
    if (!Array.isArray(allCoupons)) {
      return [];
    }

    // Filter coupons based on current cart state
    const applicableCoupons = allCoupons.filter(coupon => {
      // Check minimum cart total
      if (coupon.minimum_amount && cartTotal < coupon.minimum_amount) {
        return false;
      }

      // Check minimum quantity
      if (coupon.min_quantity_required) {
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity < coupon.min_quantity_required) {
          return false;
        }
      }

      // Check user-specific restrictions (basic client-side filtering)
      if (coupon.user_specific && !user) {
        return false; // User-specific coupon but no user logged in
      }

      if (coupon.first_time_user_only && user && !user.is_first_time_user) {
        return false;
      }

      return true;
    });

    return applicableCoupons;
  } catch (error) {
    console.error('Error fetching applicable coupons:', error);
    return [];
  }
};

/**
 * Calculate total cart value with coupon applied
 * @param {number} subtotal - Original subtotal
 * @param {number} shipping - Shipping cost
 * @param {Object} appliedCoupon - Applied coupon object
 * @returns {Object} Calculated totals
 */
export const calculateTotalsWithCoupon = (subtotal, shipping, appliedCoupon) => {
  if (!appliedCoupon) {
    return {
      subtotal,
      shipping,
      productDiscount: 0,
      shippingDiscount: 0,
      totalDiscount: 0,
      finalTotal: subtotal + shipping
    };
  }

  const productDiscount = appliedCoupon.product_discount || 0;
  const shippingDiscount = appliedCoupon.shipping_discount || 0;
  const totalDiscount = appliedCoupon.total_discount || (productDiscount + shippingDiscount);

  const discountedSubtotal = Math.max(0, subtotal - productDiscount);
  const discountedShipping = Math.max(0, shipping - shippingDiscount);
  const finalTotal = discountedSubtotal + discountedShipping;

  return {
    subtotal: discountedSubtotal,
    shipping: discountedShipping,
    originalSubtotal: subtotal,
    originalShipping: shipping,
    productDiscount,
    shippingDiscount,
    totalDiscount,
    finalTotal
  };
};

/**
 * Format coupon display message based on coupon type
 * @param {Object} coupon - Coupon object
 * @returns {string} Formatted display message
 */
export const formatCouponDisplay = (coupon) => {
  if (!coupon) return '';

  let message = `${coupon.code}: `;
  
  if (coupon.discount_type === 'percentage') {
    message += `${coupon.discount_value}% off`;
  } else if (coupon.discount_type === 'fixed') {
    message += `${formatBDT(coupon.discount_value, true, true)} off`;
  }

  if (coupon.minimum_amount > 0) {
    message += ` (min ${formatBDT(coupon.minimum_amount, true, true)})`;
  }

  if (coupon.min_quantity_required > 0) {
    message += ` (min ${coupon.min_quantity_required} items)`;
  }

  return message;
};

/**
 * Legacy support - maintain backward compatibility
 */
export const applyCouponUnified = applyCouponEnhanced;
export const getAvailableCoupons = getApplicableCoupons;
