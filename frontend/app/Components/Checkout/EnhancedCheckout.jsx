// app/Components/Checkout/EnhancedCheckout.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useCheckout } from '../../hooks/useCheckout';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../../context/MessageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Tk_icon from '../Common/Tk_icon';

const EnhancedCheckout = ({ cartItems, onOrderComplete, onCancel }) => {
  const { user, isAuthenticated } = useAuth();
  const { showMessage, showError } = useMessage();

  // User information state
  const [userInfo, setUserInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: ''
    }
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Review, 3: Complete

  // Initialize checkout hook
  const {
    loading,
    shippingLoading,
    error,
    shippingAnalysis,
    checkoutData,
    selectedShippingMethod,
    hasShippingOptions,
    requiresSplitShipping,
    freeShippingEligible,
    availableShippingMethods,
    analyzeShipping,
    calculate,
    complete,
    selectShippingMethod,
    clearError
  } = useCheckout({
    userId: user?.id,
    debug: true,
    onError: (error) => {
      showError(error.message);
    },
    onSuccess: (result) => {
      showMessage('Order placed successfully!');
      if (onOrderComplete) {
        onOrderComplete(result);
      }
    }
  });

  // Analyze shipping on mount
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      analyzeShipping(cartItems);
    }
  }, [cartItems, analyzeShipping]);

  // Calculate totals when shipping method or coupon changes
  useEffect(() => {
    if (cartItems && selectedShippingMethod) {
      calculate({
        cartItems,
        couponCode: appliedCoupon?.code,
        shippingMethodId: selectedShippingMethod.id,
        userInfo
      });
    }
  }, [cartItems, selectedShippingMethod, appliedCoupon, userInfo, calculate]);

  const handleUserInfoChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUserInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUserInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code');
      return;
    }

    const result = await calculate({
      cartItems,
      couponCode: couponCode.trim(),
      shippingMethodId: selectedShippingMethod?.id,
      userInfo
    });

    if (result.success && result.data?.coupon?.valid) {
      setAppliedCoupon(result.data.coupon);
      showMessage(`Coupon "${couponCode}" applied successfully!`);
    } else if (result.data?.coupon?.valid === false) {
      showError(result.data.coupon.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    calculate({
      cartItems,
      couponCode: null,
      shippingMethodId: selectedShippingMethod?.id,
      userInfo
    });
  };

  const handleShippingMethodSelect = (method) => {
    selectShippingMethod(method);
  };

  const handleCompleteOrder = async () => {
    const result = await complete({
      cartItems,
      userInfo,
      shippingMethodId: selectedShippingMethod?.id,
      couponCode: appliedCoupon?.code,
      paymentMethod: 'pending'
    });

    if (result.success) {
      setStep(3);
    }
  };

  // Loading state
  if (shippingLoading && !shippingAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing shipping options...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !shippingAnalysis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Checkout Error</h3>
        <p className="text-red-700 mb-4">{error.message}</p>
        <button
          onClick={() => {
            clearError();
            if (cartItems) analyzeShipping(cartItems);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {stepNum}
              </div>
              <span className={`ml-2 text-sm ${step >= stepNum ? 'text-blue-600' : 'text-gray-500'}`}>
                {stepNum === 1 && 'Shipping'}
                {stepNum === 2 && 'Review'}
                {stepNum === 3 && 'Complete'}
              </span>
              {stepNum < 3 && <div className="w-12 h-px bg-gray-300 ml-4" />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Split Shipping Warning */}
            {requiresSplitShipping && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Split Shipping Required</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Items in your cart require different shipping methods. You may need to contact support for assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Free Shipping Banner */}
            {freeShippingEligible && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    🎉 You qualify for free shipping!
                  </span>
                </div>
              </div>
            )}

            {/* Shipping Methods */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Select Shipping Method</h3>
              </div>
              <div className="p-4 space-y-3">
                {hasShippingOptions ? (
                  availableShippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-all
                        ${selectedShippingMethod?.id === method.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => handleShippingMethodSelect(method)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShippingMethod?.id === method.id}
                            onChange={() => handleShippingMethodSelect(method)}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{method.name}</h4>
                            {method.description && (
                              <p className="text-sm text-gray-600">{method.description}</p>
                            )}
                            {method.delivery_estimated_time && (
                              <p className="text-xs text-gray-500 mt-1">
                                Estimated delivery: {method.delivery_estimated_time}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-medium ${
                            parseFloat(method.calculated_price) === 0 
                              ? 'text-green-600' 
                              : 'text-gray-900'
                          } flex items-center`}>
                            {parseFloat(method.calculated_price) === 0 
                              ? 'FREE' 
                              : <><Tk_icon size={16} className="mr-1" />{parseFloat(method.calculated_price).toFixed(2)}</>
                            }
                          </span>
                          {method.is_free_shipping_rule && (
                            <div className="text-xs text-green-600 mt-1">Free Shipping Applied</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No shipping methods available for your cart items.
                  </div>
                )}
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={userInfo.first_name}
                    onChange={(e) => handleUserInfoChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={userInfo.last_name}
                    onChange={(e) => handleUserInfoChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleUserInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={userInfo.address.street}
                    onChange={(e) => handleUserInfoChange('address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={userInfo.address.city}
                    onChange={(e) => handleUserInfoChange('address.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={userInfo.address.state}
                    onChange={(e) => handleUserInfoChange('address.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={userInfo.address.zip_code}
                    onChange={(e) => handleUserInfoChange('address.zip_code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedShippingMethod || !userInfo.first_name || !userInfo.email}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue to Review
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Review</h3>
              </div>
              <div className="p-4">
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cartItems?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name || `Product ${item.product_id}`}</h4>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                          {item.color && <span className="ml-2">Color: {item.color}</span>}
                          {item.size && <span className="ml-2">Size: {item.size}</span>}
                        </div>
                      </div>
                      <div className="text-lg font-medium text-gray-900 flex items-center">
                        <Tk_icon size={16} className="mr-1" />{((item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-green-800">
                          Coupon "{appliedCoupon.code}" applied
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-800 font-medium flex items-center">
                          -<Tk_icon size={16} className="mr-1" />{appliedCoupon.discount.toFixed(2)}
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={loading || !couponCode.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                {checkoutData && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    {/* Wholesale Pricing Notice */}
                    {user?.user_type === 'WHOLESALER' && cartItems.some(item => item.is_wholesale) && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Wholesale pricing applied to eligible items
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {user?.user_type === 'WHOLESALER' && cartItems.some(item => item.is_wholesale) 
                          ? 'Wholesale Subtotal' 
                          : 'Subtotal'
                        }
                      </span>
                      <span className="font-medium flex items-center"><Tk_icon size={16} className="mr-1" />{checkoutData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium flex items-center">
                        {checkoutData.shippingCost === 0 
                          ? 'FREE' 
                          : <><Tk_icon size={16} className="mr-1" />{checkoutData.shippingCost.toFixed(2)}</>
                        }
                      </span>
                    </div>
                    {checkoutData.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="flex items-center">-<Tk_icon size={16} className="mr-1" />{checkoutData.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="flex items-center"><Tk_icon size={18} className="mr-1" />{checkoutData.total.toFixed(2)} {checkoutData.currency}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Shipping
              </button>
              <button
                onClick={handleCompleteOrder}
                disabled={loading || !checkoutData}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>Place Order</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your order. You'll receive a confirmation email shortly.
            </p>
            <button
              onClick={() => window.location.href = '/orders'}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View My Orders
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedCheckout;
