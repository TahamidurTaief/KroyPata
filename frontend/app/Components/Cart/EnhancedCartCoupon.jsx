'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import { validateCoupon, getActiveCoupons } from '../../lib/api';
import Tk_icon from '../Common/Tk_icon';

const EnhancedCartCoupon = ({ 
  cartItems = [], 
  cartTotal = 0, 
  onCouponApplied, 
  appliedCoupon,
  onCouponRemoved 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'warning'
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch available coupons on component mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const coupons = await getActiveCoupons();
        setAvailableCoupons(Array.isArray(coupons) ? coupons : []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };
    
    fetchCoupons();
  }, []);

  // Filter applicable coupons based on current cart
  const applicableCoupons = useMemo(() => {
    return availableCoupons.filter(coupon => {
      // Basic filtering - backend will do detailed validation
      if (coupon.minimum_amount && cartTotal < coupon.minimum_amount) {
        return false;
      }
      if (coupon.min_quantity_required) {
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity < coupon.min_quantity_required) {
          return false;
        }
      }
      return true;
    });
  }, [availableCoupons, cartTotal, cartItems]);

  const handleApplyCoupon = async (code = couponCode) => {
    if (!code.trim()) {
      setValidationMessage('Please enter a coupon code');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setValidationMessage('');

    try {
      const result = await validateCoupon(
        code.toUpperCase().trim(), 
        cartItems, 
        cartTotal
      );

      if (result?.valid) {
        const couponData = {
          code: code.toUpperCase().trim(),
          discount_type: result.discount_type,
          discount_value: result.discount_value,
          product_discount: result.product_discount || 0,
          shipping_discount: result.shipping_discount || 0,
          total_discount: result.discount_amount || 0,
          message: result.message || 'Coupon applied successfully!'
        };

        onCouponApplied(couponData);
        setValidationMessage(result.message || 'Coupon applied successfully!');
        setMessageType('success');
        setCouponCode('');
        setShowSuggestions(false);
      } else {
        // Handle specific validation errors
        let errorMessage = result?.message || 'Invalid coupon code';
        
        if (result?.min_cart_total) {
          errorMessage = `Minimum cart total of BDT${result.min_cart_total} required`;
        } else if (result?.min_quantity_required) {
          errorMessage = `Minimum ${result.min_quantity_required} items required`;
        } else if (result?.user_specific && !result?.user_eligible) {
          errorMessage = 'This coupon is not available for your account';
        } else if (result?.first_time_user_only && !result?.is_first_time_user) {
          errorMessage = 'This coupon is for first-time customers only';
        }

        setValidationMessage(errorMessage);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setValidationMessage('Unable to validate coupon. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setValidationMessage('');
    setMessageType('');
  };

  const handleInputFocus = () => {
    if (applicableCoupons.length > 0 && !appliedCoupon) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (coupon) => {
    setCouponCode(coupon.code);
    setShowSuggestions(false);
    handleApplyCoupon(coupon.code);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !appliedCoupon) {
      handleApplyCoupon();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label
          htmlFor="coupon-code"
          className="flex items-center text-lg font-medium text-[var(--color-text-primary)] mb-3"
        >
          <FaTag className="mr-2 text-blue-600" />
          Have a Coupon?
        </label>

        {!appliedCoupon ? (
          <div className="relative">
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  id="coupon-code"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter coupon code"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />

                {/* Coupon Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && applicableCoupons.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                    >
                      <div className="p-2">
                        <div className="text-xs text-gray-500 mb-2 font-medium">Available Coupons:</div>
                        {applicableCoupons.map((coupon) => (
                          <button
                            key={coupon.code}
                            onClick={() => handleSuggestionClick(coupon)}
                            className="w-full text-left p-2 hover:bg-blue-50 rounded text-sm transition-colors"
                          >
                            <div className="font-medium text-blue-600">{coupon.code}</div>
                            <div className="text-gray-600 text-xs">
                              {coupon.discount_type === 'percentage' 
                                ? `${coupon.discount_value}% off` 
                                : `$${coupon.discount_value} off`}
                              {coupon.minimum_amount > 0 && ` (min $${coupon.minimum_amount})`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={() => handleApplyCoupon()}
                disabled={isLoading || !couponCode.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  'Apply'
                )}
              </motion.button>
            </div>
          </div>
        ) : (
          /* Applied Coupon Display */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-green-800">
                    Coupon Applied: <span className="font-bold">{appliedCoupon.code}</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {appliedCoupon.message}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  {appliedCoupon.product_discount > 0 && (
                    <div className="text-sm font-medium text-green-700">
                      Product: -${appliedCoupon.product_discount.toFixed(2)}
                    </div>
                  )}
                  {appliedCoupon.shipping_discount > 0 && (
                    <div className="text-sm font-medium text-green-700">
                      Shipping: -${appliedCoupon.shipping_discount.toFixed(2)}
                    </div>
                  )}
                  <div className="text-sm font-bold text-green-800">
                    Total: -${appliedCoupon.total_discount.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Remove coupon"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Validation Messages */}
        <AnimatePresence>
          {validationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-2 p-2 rounded-md text-sm ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : messageType === 'warning'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {validationMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available Coupons Preview */}
        {!appliedCoupon && applicableCoupons.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            {applicableCoupons.length} coupon{applicableCoupons.length !== 1 ? 's' : ''} available for your cart
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCartCoupon;
