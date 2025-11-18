"use client";

import React, { useState, useEffect } from 'react';
import { useCheckout } from '../../contexts/CheckoutContext';
import { getShippingMethods, getShippingPriceForQuantity, validateCoupon } from '../../lib/api';
import OrderPaymentModal from '../Payment/OrderPaymentModal';
import { useRouter } from 'next/navigation';
import Tk_icon from "../Common/Tk_icon";

const CheckoutProcess = () => {
  const router = useRouter();
  
  // State management
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [currentShippingPrice, setCurrentShippingPrice] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discounts, setDiscounts] = useState({ product_discount: 0, shipping_discount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Get cart context
  const { cartItems } = useCheckout();

  // Calculate cart totals
  const cartSubtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const finalShippingCost = Math.max(0, currentShippingPrice - discounts.shipping_discount);
  const finalProductTotal = Math.max(0, cartSubtotal - discounts.product_discount);
  const grandTotal = finalProductTotal + finalShippingCost;

  // Fetch shipping methods on component mount
  useEffect(() => {
    fetchShippingMethods();
  }, []);

  // Update shipping price when selection or quantity changes
  useEffect(() => {
    if (selectedShipping && totalQuantity > 0) {
      updateShippingPrice(selectedShipping.id, totalQuantity);
    }
  }, [selectedShipping, totalQuantity]);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const response = await getShippingMethods();
      
      if (response?.error) {
        setError('Failed to load shipping methods');
        return;
      }
      
      const methods = response?.results || response || [];
      setShippingMethods(methods);
      
      // Auto-select first method if available
      if (methods.length > 0) {
        setSelectedShipping(methods[0]);
      }
    } catch (err) {
      setError('Failed to load shipping methods');
      console.error('Error fetching shipping methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateShippingPrice = async (methodId, quantity) => {
    try {
      const response = await getShippingPriceForQuantity(methodId, quantity);
      
      if (response?.error) {
        console.error('Error updating shipping price:', response.error);
        setCurrentShippingPrice(selectedShipping?.price || 0);
        return;
      }
      
      setCurrentShippingPrice(response.price || selectedShipping?.price || 0);
    } catch (err) {
      console.error('Error updating shipping price:', err);
      setCurrentShippingPrice(selectedShipping?.price || 0);
    }
  };

  const handleShippingMethodChange = (method) => {
    setSelectedShipping(method);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      setCouponStatus('error');
      return;
    }

    setCouponStatus('loading');
    setCouponMessage('Validating coupon...');

    try {
      // Prepare cart items for API
      const cartItemsForApi = cartItems.map(item => ({
        quantity: item.quantity,
        product: item.name || item.product_name || 'Product'
      }));

      // Call validation API with cart total and user info
      const result = await validateCoupon(
        couponCode,
        cartItemsForApi,
        cartSubtotal,
        null // user_id - you might want to get this from auth context
      );

      if (result?.error) {
        setCouponStatus('error');
        setCouponMessage(result.error);
        setAppliedCoupon(null);
        setDiscounts({ product_discount: 0, shipping_discount: 0 });
        return;
      }

      if (result?.valid) {
        setAppliedCoupon(result.coupon);
        setCouponStatus('success');
        setCouponMessage(result.message);
        
        // Calculate discounts
        const couponDiscounts = calculateCouponDiscounts(result.coupon, cartSubtotal, currentShippingPrice);
        setDiscounts(couponDiscounts);
      } else {
        setCouponStatus('error');
        setCouponMessage(result?.message || 'Invalid coupon code');
        setAppliedCoupon(null);
        setDiscounts({ product_discount: 0, shipping_discount: 0 });
      }
    } catch (err) {
      setCouponStatus('error');
      setCouponMessage('Failed to validate coupon. Please try again.');
      console.error('Coupon validation error:', err);
    }
  };

  const calculateCouponDiscounts = (coupon, subtotal, shippingCost) => {
    const discountPercent = parseFloat(coupon.discount_percent) / 100;
    
    switch (coupon.type) {
      case 'PRODUCT_DISCOUNT':
      case 'MIN_PRODUCT_QUANTITY':
      case 'CART_TOTAL_DISCOUNT':
      case 'FIRST_TIME_USER':
      case 'USER_SPECIFIC':
        return {
          product_discount: subtotal * discountPercent,
          shipping_discount: 0
        };
      case 'SHIPPING_DISCOUNT':
        return {
          product_discount: 0,
          shipping_discount: shippingCost * discountPercent
        };
      default:
        return { product_discount: 0, shipping_discount: 0 };
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponStatus(null);
    setCouponMessage('');
    setDiscounts({ product_discount: 0, shipping_discount: 0 });
  };

  const handleProceedToPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (response) => {
    console.log('Payment successful:', response);
    
    // Clear cart from localStorage
    localStorage.removeItem('cartItems');
    
    // Store order confirmation data
    if (response && response.id) {
      sessionStorage.setItem('orderConfirmation', JSON.stringify({
        orderId: response.id,
        orderNumber: response.order_number,
        totalAmount: response.total_amount,
        status: response.status,
        paymentStatus: response.payment_status
      }));
    }
    
    // Close payment modal
    setIsPaymentModalOpen(false);
    
    // Redirect to confirmation page
    router.push('/confirmation');
  };

  const handlePaymentClose = () => {
    setIsPaymentModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-12 rounded-2xl mb-8" style={{ backgroundColor: 'var(--color-muted-bg)' }}></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="h-40 rounded-2xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}></div>
                <div className="h-48 rounded-2xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}></div>
                <div className="h-32 rounded-2xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}></div>
              </div>
              <div className="h-80 rounded-2xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-md mx-auto text-center">
          <div className="shadow-2xl rounded-3xl p-8" style={{ 
            backgroundColor: 'var(--color-surface)', 
            border: '1px solid var(--color-border)' 
          }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--color-muted-bg)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--color-accent-orange)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 lato" style={{ color: 'var(--color-text-primary)' }}>Oops! Something went wrong</h3>
            <p className="mb-6 lato" style={{ color: 'var(--color-accent-orange)' }}>{error}</p>
            <button 
              onClick={fetchShippingMethods}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-white lato"
              style={{ backgroundColor: 'var(--color-button-primary)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lato" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto p-6 lato">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 lato" style={{ color: 'var(--color-text-primary)' }}>
            Checkout
          </h1>
          <p className="text-lg lato" style={{ color: 'var(--color-text-secondary)' }}>Complete your order with style</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Cart Summary */}
            <div className="rounded-3xl p-8 shadow-xl" style={{ 
              backgroundColor: 'var(--color-surface)', 
              border: '1px solid var(--color-border)' 
            }}>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--color-accent-green)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5 5m0 0H19.5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold lato" style={{ color: 'var(--color-text-primary)' }}>Cart Summary</h2>
              </div>
              
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--color-button-primary)' }}>
                        {item.quantity}
                      </div>
                      <span className="font-medium lato" style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                    </div>
                    <span className="font-bold text-lg lato" style={{ color: 'var(--color-text-primary)' }}><Tk_icon className="mr-1" size={16} />{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-4" style={{ borderTop: '2px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-second-bg)' }}>
                    <span className="font-bold text-lg lato" style={{ color: 'var(--color-text-primary)' }}>Subtotal ({totalQuantity} items)</span>
                    <span className="font-bold text-2xl lato" style={{ color: 'var(--color-accent-orange)' }}>
                      <Tk_icon className="mr-1" size={16} />{cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="rounded-3xl p-8 shadow-xl" style={{ 
              backgroundColor: 'var(--color-surface)', 
              border: '1px solid var(--color-border)' 
            }}>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--color-accent-orange)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold lato" style={{ color: 'var(--color-text-primary)' }}>Shipping Methods</h2>
              </div>
              
              {shippingMethods.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-muted-bg)' }}>
                    <svg className="w-8 h-8" style={{ color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>No shipping methods available</p>
                  <p style={{ color: 'var(--color-text-secondary)' }}>Please contact support for assistance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 rounded-2xl p-6 ${
                        selectedShipping?.id === method.id
                          ? 'shadow-lg border-2'
                          : 'border-2 hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: selectedShipping?.id === method.id ? 'var(--color-second-bg)' : 'var(--color-surface)',
                        borderColor: selectedShipping?.id === method.id ? 'var(--color-button-primary)' : 'var(--color-border)'
                      }}
                      onClick={() => handleShippingMethodChange(method)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            checked={selectedShipping?.id === method.id}
                            onChange={() => handleShippingMethodChange(method)}
                            className="w-5 h-5 focus:ring-2"
                            style={{ 
                              color: 'var(--color-button-primary)',
                              accentColor: 'var(--color-button-primary)'
                            }}
                          />
                          <div>
                            <h3 className="font-bold text-lg lato" style={{ color: 'var(--color-text-primary)' }}>{method.title || method.name}</h3>
                            {method.description && (
                              <p className="lato" style={{ color: 'var(--color-text-secondary)' }}>{method.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl lato" style={{ color: 'var(--color-text-primary)' }}>
                            <Tk_icon className="mr-1" size={16} />{selectedShipping?.id === method.id ? currentShippingPrice.toFixed(2) : method.price}
                          </p>
                          <p className="text-sm lato" style={{ color: 'var(--color-text-secondary)' }}>for {totalQuantity} items</p>
                        </div>
                      </div>
                      
                      {/* Show pricing tiers if available */}
                      {method.shipping_tiers && method.shipping_tiers.length > 0 && (
                        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}>
                          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>📊 Quantity-based pricing:</p>
                          <div className="grid grid-cols-2 gap-3">
                            {method.shipping_tiers.map((tier) => (
                              <div key={tier.id} className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{tier.min_quantity}+ items:</span>
                                <span className="font-bold" style={{ color: 'var(--color-button-primary)' }}><Tk_icon className="mr-1" size={16} />{tier.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedShipping?.id === method.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-green)' }}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon Section */}
            <div className="rounded-3xl p-8 shadow-xl" style={{ 
              backgroundColor: 'var(--color-surface)', 
              border: '1px solid var(--color-border)' 
            }}>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--color-accent-orange)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold lato" style={{ color: 'var(--color-text-primary)' }}>Coupon Code</h2>
              </div>
              
              {!appliedCoupon ? (
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code (e.g., SAVE10)"
                        className="w-full px-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-opacity-30 transition-all duration-200 text-lg"
                        style={{ 
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-primary)',
                          focusBorderColor: 'var(--color-button-primary)',
                          focusRingColor: 'var(--color-button-primary)'
                        }}
                        disabled={couponStatus === 'loading'}
                      />
                      {couponStatus === 'loading' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--color-button-primary)' }}></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponStatus === 'loading' || !couponCode.trim()}
                      className="px-8 py-4 rounded-2xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-white disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: couponStatus === 'loading' || !couponCode.trim() ? 'var(--color-muted-bg)' : 'var(--color-button-primary)'
                      }}
                    >
                      {couponStatus === 'loading' ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Applying...
                        </span>
                      ) : 'Apply'}
                    </button>
                  </div>
                  
                  {couponMessage && (
                    <div className="p-4 rounded-2xl transition-all duration-300 border-2" style={{
                      backgroundColor: couponStatus === 'error' ? 'var(--color-muted-bg)' :
                                      couponStatus === 'success' ? 'var(--color-muted-bg)' :
                                      'var(--color-muted-bg)',
                      color: couponStatus === 'error' ? 'var(--color-accent-orange)' :
                             couponStatus === 'success' ? 'var(--color-accent-green)' :
                             'var(--color-text-primary)',
                      borderColor: couponStatus === 'error' ? 'var(--color-accent-orange)' :
                                   couponStatus === 'success' ? 'var(--color-accent-green)' :
                                   'var(--color-border)'
                    }}>
                      <div className="flex items-center">
                        {couponStatus === 'error' && (
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        {couponStatus === 'success' && (
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="font-medium">{couponMessage}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 rounded-2xl p-6" style={{ 
                  backgroundColor: 'var(--color-muted-bg)', 
                  borderColor: 'var(--color-accent-green)' 
                }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--color-accent-green)' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                          🎉 Coupon Applied: {appliedCoupon.code}
                        </p>
                        <p style={{ color: 'var(--color-accent-green)' }}>
                          {appliedCoupon.type_display} - {appliedCoupon.discount_percent}% off
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="font-bold px-4 py-2 rounded-xl transition-all duration-200 text-white"
                      style={{ backgroundColor: 'var(--color-accent-orange)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="rounded-3xl p-8 shadow-2xl" style={{ 
                backgroundColor: 'var(--color-surface)', 
                border: '1px solid var(--color-border)' 
              }}>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'var(--color-accent-green)' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold lato" style={{ color: 'var(--color-text-primary)' }}>Order Summary</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}>
                    <span className="lato" style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                    <span className="font-bold lato" style={{ color: 'var(--color-text-primary)' }}><Tk_icon className="mr-1" size={16} />{cartSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {discounts.product_discount > 0 && (
                    <div className="flex justify-between items-center p-3 rounded-xl border" style={{ 
                      backgroundColor: 'var(--color-muted-bg)', 
                      borderColor: 'var(--color-accent-green)' 
                    }}>
                      <span className="font-medium lato" style={{ color: 'var(--color-accent-green)' }}>
                        💰 Product Discount ({appliedCoupon?.code})
                      </span>
                      <span className="font-bold lato flex items-center" style={{ color: 'var(--color-accent-green)' }}>
                        -<Tk_icon size={16} className="mr-1" />{discounts.product_discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 rounded-xl" style={{ backgroundColor: 'var(--color-muted-bg)' }}>
                    <span className="lato" style={{ color: 'var(--color-text-secondary)' }}>
                      Shipping ({selectedShipping?.name || 'None selected'})
                    </span>
                    <span className="font-bold lato flex items-center" style={{ color: 'var(--color-text-primary)' }}>
                      <Tk_icon size={16} className="mr-1" />{currentShippingPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  {discounts.shipping_discount > 0 && (
                    <div className="flex justify-between items-center p-3 rounded-xl border" style={{ 
                      backgroundColor: 'var(--color-muted-bg)', 
                      borderColor: 'var(--color-accent-green)' 
                    }}>
                      <span className="font-medium lato" style={{ color: 'var(--color-accent-green)' }}>
                        🚚 Shipping Discount ({appliedCoupon?.code})
                      </span>
                      <span className="font-bold lato flex items-center" style={{ color: 'var(--color-accent-green)' }}>
                        -<Tk_icon size={16} className="mr-1" />{discounts.shipping_discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4" style={{ borderTop: '2px solid var(--color-border)' }}>
                    <div className="flex justify-between items-center p-4 rounded-xl" style={{ backgroundColor: 'var(--color-second-bg)' }}>
                      <span className="font-bold text-xl lato" style={{ color: 'var(--color-text-primary)' }}>Total</span>
                      <span className="font-bold text-2xl lato flex items-center" style={{ color: 'var(--color-accent-orange)' }}>
                        <Tk_icon size={24} className="mr-2" />{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {(discounts.product_discount > 0 || discounts.shipping_discount > 0) && (
                    <div className="text-center p-3 rounded-xl border" style={{ 
                      backgroundColor: 'var(--color-muted-bg)', 
                      borderColor: 'var(--color-accent-green)' 
                    }}>
                      <span className="font-bold lato flex items-center justify-center" style={{ color: 'var(--color-accent-green)' }}>
                        🎉 You saved <Tk_icon size={16} className="mx-1" />{(discounts.product_discount + discounts.shipping_discount).toFixed(2)}!
                      </span>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={!selectedShipping || cartItems.length === 0}
                  className="w-full mt-8 px-6 py-3 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:cursor-not-allowed lato"
                  style={{ 
                    backgroundColor: !selectedShipping || cartItems.length === 0 ? 'var(--color-muted-bg)' : 'var(--color-button-primary)'
                  }}
                >
                  <span className="flex items-center justify-center lato">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Proceed to Checkout - <Tk_icon size={18} className="mx-1" />{grandTotal.toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Modal */}
        <OrderPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
          cartItems={cartItems}
          totalAmount={grandTotal}
          cartSubtotal={finalProductTotal}
          shippingMethod={selectedShipping}
          userDetails={{
            name: 'Guest User',
            email: 'guest@example.com',
            phone: '',
            address: '',
            city: '',
            zip: ''
          }}
          redirectToConfirmation={false}
        />
      </div>
    </div>
  );
};

export default CheckoutProcess;
