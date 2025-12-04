"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useModal } from "../contexts/ModalContext";
import { useMessage } from "@/context/MessageContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../Components/Auth/ProtectedRoute';

// Fixed API helper function with proper abort controller
const makeAPIRequest = async (endpoint, options = {}) => {
  const baseUrl = (() => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!envUrl && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://127.0.0.1:8000';
    }
    return envUrl || 'https://api.chinakroy.com';
  })();
  
  const url = `${baseUrl}${endpoint}`.replace(/\/+/g, '/').replace(/:\//,'://');
  
  console.log('🌐 Making API request to:', url);
  
  try {
    // Fixed: Add proper timeout with abort reason
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error('Request timeout: API call took longer than 10 seconds'));
    }, 10000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get('content-type');
    const hasContent = response.headers.get('content-length') !== '0';
    
    let result = null;
    if (contentType && contentType.includes('application/json') && hasContent) {
      result = await response.json();
    } else {
      const textResponse = await response.text();
      if (!response.ok) {
        throw new Error(`Server Error (${response.status}): ${textResponse || response.statusText}`);
      }
    }
    
    return { response, result };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout: ${endpoint} took too long to respond`);
    }
    throw error;
  }
};

const CheckoutPage = () => {
  const { showModal } = useModal();
  const { showError, showSuccess } = useMessage();
  const { isAuthenticated, user } = useAuth();
  
  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  
  // Shipping state
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  
  // Address state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // Fixed: Memoized calculations to ensure proper updates
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
      return sum + (price * quantity);
    }, 0);
  }, [cartItems]);

  const shipping = useMemo(() => {
    if (selectedShippingMethod) {
      if (selectedShippingMethod.id === 'free') return 0;
      const price = typeof selectedShippingMethod.price === 'number' 
        ? selectedShippingMethod.price 
        : parseFloat(selectedShippingMethod.price || 0);
      return isNaN(price) ? 0 : price;
    }
    return 0;
  }, [selectedShippingMethod]);

  const total = useMemo(() => {
    return subtotal + shipping - discount;
  }, [subtotal, shipping, discount]);

  // Load cart items from localStorage
  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem("cartItems");
        setCartItems([]);
      }
    }
  }, []);

  // Load shipping methods
  useEffect(() => {
    const loadShippingMethods = async () => {
      try {
        const { response, result } = await makeAPIRequest('/api/orders/shipping-methods/');
        if (response.ok && result) {
          setShippingMethods(result);
          if (result.length > 0 && !selectedShippingMethod) {
            setSelectedShippingMethod(result[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load shipping methods:', error);
        // Fallback shipping methods
        const fallbackMethods = [{
          id: 1,
          name: 'Standard Shipping',
          price: 9.99,
          description: '5-7 business days'
        }];
        setShippingMethods(fallbackMethods);
        setSelectedShippingMethod(fallbackMethods[0]);
      }
    };

    if (mounted) {
      loadShippingMethods();
    }
  }, [mounted, selectedShippingMethod]);

  // Fixed: Enhanced quantity update with proper recalculation
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item => 
      (item.id === itemId || item.variantId === itemId) 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
  };

  const incrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const decrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      handleRemoveItem(itemId);
    }
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId && item.variantId !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    showSuccess('Item removed from cart');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      // Simple coupon validation (you can enhance this)
      if (couponCode.toLowerCase() === 'discount10') {
        setDiscount(subtotal * 0.1); // 10% discount
        setCouponApplied(true);
        showSuccess('Coupon applied successfully!');
      } else {
        showError('Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      showError('Error applying coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(0);
    showSuccess('Coupon removed');
  };

  const handleSubmitOrder = async () => {
    // Validate required fields
    const requiredFields = [
      { value: firstName.trim(), name: 'First Name' },
      { value: lastName.trim(), name: 'Last Name' },
      { value: streetAddress.trim(), name: 'Street Address' },
      { value: phoneNumber.trim(), name: 'Phone Number' },
      { value: emailAddress.trim(), name: 'Email Address' },
      { value: city.trim(), name: 'City' },
      { value: state.trim(), name: 'State' },
      { value: zipCode.trim(), name: 'ZIP Code' }
    ];

    const emptyFields = requiredFields.filter(field => !field.value);
    
    if (emptyFields.length > 0) {
      const missingFieldNames = emptyFields.map(field => field.name).join(', ');
      showError(`Please fill in the following required fields: ${missingFieldNames}`);
      return;
    }

    if (!selectedShippingMethod) {
      showError('Please select a shipping method');
      return;
    }

    if (cartItems.length === 0) {
      showError('Your cart is empty');
      return;
    }

    try {
      const orderData = {
        customer_name: `${firstName} ${lastName}`,
        customer_email: emailAddress,
        customer_phone: phoneNumber,
        shipping_address: {
          street_address: streetAddress,
          city: city,
          state: state,
          zip_code: zipCode,
          country: 'Bangladesh'
        },
        shipping_method: selectedShippingMethod.id,
        items: cartItems.map(item => ({
          product_id: item.productId || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        shipping_cost: shipping,
        discount: discount,
        total: total,
        ...(couponApplied && { coupon_code: couponCode })
      };

      const { response, result } = await makeAPIRequest('/api/orders/create/', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (response.ok && result) {
        // Clear cart
        setCartItems([]);
        localStorage.removeItem("cartItems");
        
        showSuccess('Order placed successfully!');
        
        // Redirect to order confirmation or success page
        window.location.href = '/order-success';
      } else {
        showError('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      showError('Error placing order. Please try again.');
    }
  };

  if (!mounted) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Checkout
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete your order
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Order Details and Form */}
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Order Items ({cartItems.length})
                  </h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id || item.variantId} className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => decrementQuantity(item.id || item.variantId)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => incrementQuantity(item.id || item.variantId)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id || item.variantId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                {/* Shipping Methods */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Shipping Method
                  </h2>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedShippingMethod?.id === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selectedShippingMethod?.id === method.id}
                          onChange={() => setSelectedShippingMethod(method)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {method.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {method.description}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${typeof method.price === 'number' ? method.price.toFixed(2) : parseFloat(method.price || 0).toFixed(2)}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Coupon Code
                  </h2>
                  {!couponApplied ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-400">
                          Coupon Applied: {couponCode}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-500">
                          Discount: ${discount.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Order Summary
                  </h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="text-gray-900 dark:text-white">${shipping.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSubmitOrder}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CheckoutPage;
