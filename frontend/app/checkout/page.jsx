"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckoutProvider } from "../contexts/CheckoutContext";
import { useModal } from "../contexts/ModalContext";
import { useMessage } from "@/context/MessageContext";
import { useAuth } from "../contexts/AuthContext"; // Add auth context
import { useCartContext } from "../contexts/CartContext";
import { getCheckoutData, createOrderWithPayment, validateCoupon, applyCoupon, confirmPayment } from '../lib/api';
import { applyCouponUnified } from '../../lib/couponUtils';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../Components/Auth/ProtectedRoute';
import ShippingSelector from '../Components/Cart/ShippingSelector';
import ShippingInfoModal from '../Components/Modals/ShippingInfoModal';
import Tk_icon from '../Components/Common/Tk_icon';
import ClientManifestErrorBoundary from '../Components/ErrorBoundaries/ClientManifestErrorBoundary';
import EnhancedSectionRenderer from '../Components/Common/EnhancedSectionRenderer';

// API helper function
const makeAPIRequest = async (endpoint, options = {}) => {
  // Use local development server if running locally, otherwise use production API
  const baseUrl = (() => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // If no env var is set and we're in development, use local server
    if (!envUrl && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://127.0.0.1:8000';
    }
    
    // Otherwise use env var or production default
    return envUrl || 'https://api.icommerce.passmcq.com';
  })();
  
  const url = `${baseUrl}${endpoint}`.replace(/\/+/g, '/').replace(/:\//,'://');
  
  console.log('🌐 Making API request to:', url);
  console.log('🌐 Request options:', options);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    console.log('📦 Response status:', response.status, response.statusText);
    console.log('📦 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response has content and is JSON
    const contentType = response.headers.get('content-type');
    const hasContent = response.headers.get('content-length') !== '0';
    
    let result = null;
    if (contentType && contentType.includes('application/json') && hasContent) {
      try {
        result = await response.json();
        console.log('📦 JSON response:', result);
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        const textResponse = await response.text();
        console.error('❌ Raw response:', textResponse);
        throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
      }
    } else {
      // Handle non-JSON responses
      const textResponse = await response.text();
      console.log('📦 Non-JSON response:', textResponse);
      
      if (!response.ok) {
        // If it's an error response, try to extract meaningful error
        if (textResponse.includes('<title>') && textResponse.includes('</title>')) {
          // HTML error page
          const titleMatch = textResponse.match(/<title>(.*?)<\/title>/i);
          const errorTitle = titleMatch ? titleMatch[1] : 'Server Error';
          throw new Error(`Server Error (${response.status}): ${errorTitle}`);
        } else {
          throw new Error(`Server Error (${response.status}): ${textResponse || response.statusText}`);
        }
      }
    }
    
    return { response, result };
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
};


// Simple inline CheckoutProcess component for testing
const CheckoutProcess = ({ 
  initialCartItems = [], 
  initialShippingMethods = [], 
  initialActiveCoupons = [], 
  serverError = null,
  timestamp = null 
}) => {
  const { showModal } = useModal();
  const { showError } = useMessage();
  const { isAuthenticated, user, getAccessToken } = useAuth(); // Add auth context
  
  // Shipping address state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [comment, setComment] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [adminAccountNumber, setAdminAccountNumber] = useState('01970080484');
  
  // Payment accounts API state
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  // Enhanced shipping state with DRF backend integration
  const [shippingMethods, setShippingMethods] = useState(initialShippingMethods);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [shippingAnalysis, setShippingAnalysis] = useState(null);
  const [showShippingInfoModal, setShowShippingInfoModal] = useState(false);
  const [selectedShippingInfo, setSelectedShippingInfo] = useState(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [freeShippingEligible, setFreeShippingEligible] = useState(false);
  const [freeShippingRule, setFreeShippingRule] = useState(null);
  const [shippingCategories, setShippingCategories] = useState(new Set());
  const [requiresSplitShipping, setRequiresSplitShipping] = useState(false);
  
  // Enhanced checkout calculation state
  const [checkoutCalculation, setCheckoutCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Cart state - use global context instead of local state
  const { 
    cartItems, 
    mounted, 
    updateCartItemQuantity: updateQuantityContext,
    removeFromCart: removeFromCartContext,
    clearCart: clearCartContext
  } = useCartContext();
  
  // Available coupons from server
  const [availableCoupons] = useState(initialActiveCoupons);
  
  // Debounce timeout for shipping calculations
  const [calculateEnhancedCheckoutDebounced, setCalculateEnhancedCheckoutDebounced] = useState(null);
  
  // Utility function to properly round currency values to 2 decimal places
  const roundCurrency = (value) => {
    return Math.round((Number(value) || 0) * 100) / 100;
  };
  
  // Real-time subtotal calculation: quantity × price for each item
  const subtotal = (() => {
    const total = cartItems.reduce((sum, item) => {
      // Parse price safely
      const price = (() => {
        const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
        return isNaN(parsed) ? 0 : parsed;
      })();
      
      // Parse quantity safely  
      const quantity = (() => {
        const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
        return isNaN(parsed) ? 0 : parsed;
      })();
      
      // Item total = quantity × price
      const itemTotal = quantity * price;
      
      console.log(`📊 Item: ${item.name || 'Unknown'} | Qty: ${quantity} × Price: ${price.toFixed(2)} = ${roundCurrency(itemTotal).toFixed(2)}`);
      
      return sum + itemTotal;
    }, 0);
    
    // Round to 2 decimal places to avoid floating point precision errors
    return roundCurrency(total);
  })();

  // Dynamic shipping cost calculation based on selected method and backend analysis
  const shipping = (() => {
    console.log('🚚 Shipping Calculation Debug:');
    console.log(`   Checkout Calculation Shipping:`, checkoutCalculation?.calculation_summary?.shipping_cost);
    console.log(`   Selected Shipping Method:`, selectedShippingMethod);
    
    let shippingCost = 0;
    
    // First priority: backend calculated shipping cost
    if (checkoutCalculation?.calculation_summary?.shipping_cost) {
      const parsed = parseFloat(checkoutCalculation.calculation_summary.shipping_cost);
      if (!isNaN(parsed)) {
        console.log(`   Using backend shipping cost: ${parsed}`);
        shippingCost = parsed;
      }
    }
    // Second priority: selected shipping method
    else if (selectedShippingMethod) {
      if (selectedShippingMethod.id === 'free') {
        console.log(`   Using free shipping: 0`);
        shippingCost = 0;
      } else {
        // Try different price fields
        let shippingPrice = 0;
        if (typeof selectedShippingMethod.calculated_price === 'string') {
          shippingPrice = parseFloat(selectedShippingMethod.calculated_price);
        } else if (typeof selectedShippingMethod.calculated_price === 'number') {
          shippingPrice = selectedShippingMethod.calculated_price;
        } else if (typeof selectedShippingMethod.price === 'number') {
          shippingPrice = selectedShippingMethod.price;
        } else if (typeof selectedShippingMethod.price === 'string') {
          shippingPrice = parseFloat(selectedShippingMethod.price);
        }
        
        shippingCost = isNaN(shippingPrice) ? 0 : shippingPrice;
        console.log(`   Using selected method shipping: ${shippingCost}`);
      }
    } else {
      console.log(`   No shipping method selected, using 0`);
      shippingCost = 0;
    }
    
    // Round to 2 decimal places to avoid floating point precision errors
    return roundCurrency(shippingCost);
  })();

  // Real-time total calculation: total = subtotal + shipping - discount
  const total = (() => {
    // Debug current values
    console.log('🔍 Total Calculation Debug:');
    console.log(`   Subtotal: ${subtotal} (type: ${typeof subtotal})`);
    console.log(`   Shipping: ${shipping} (type: ${typeof shipping})`);
    console.log(`   Discount: ${discount} (type: ${typeof discount})`);
    console.log(`   Selected Shipping Method:`, selectedShippingMethod);
    console.log(`   Checkout Calculation:`, checkoutCalculation?.calculation_summary);
    
    // Ensure all values are numbers
    const numSubtotal = Number(subtotal) || 0;
    const numShipping = Number(shipping) || 0;
    const numDiscount = Number(discount) || 0;
    
    // Calculate base total
    const baseTotal = numSubtotal + numShipping;
    
    // Apply discount (coupon)
    const finalTotal = baseTotal - numDiscount;
    
    console.log(`💰 Order Summary: Subtotal: ${numSubtotal.toFixed(2)} + Shipping: ${numShipping.toFixed(2)} - Discount: ${numDiscount.toFixed(2)} = Total: ${finalTotal.toFixed(2)}`);
    
    // Ensure total is never negative and round to 2 decimal places to avoid floating point precision errors
    const calculatedTotal = Math.max(0, roundCurrency(finalTotal));
    
    console.log(`✅ Final calculated total: ${calculatedTotal.toFixed(2)}`);
    
    return calculatedTotal;
  })();

  // Cart is now managed by CartContext - no need for manual localStorage sync

  // Real-time calculation effect - triggers when cart items, shipping, or discount changes
  useEffect(() => {
    if (mounted && cartItems.length > 0) {
      console.log('🧮 Real-time calculation update triggered:');
      console.log(`   📊 Subtotal: ${subtotal.toFixed(2)} (${cartItems.length} items)`);
      console.log(`   🚚 Shipping: ${shipping.toFixed(2)}`);
      console.log(`   🎫 Discount: ${discount.toFixed(2)}`);
      console.log(`   💰 Total: ${total.toFixed(2)}`);
      console.log(`   🔄 Calculation: ${subtotal.toFixed(2)} + ${shipping.toFixed(2)} - ${discount.toFixed(2)} = ${total.toFixed(2)}`);
      
      // Log individual item calculations
      cartItems.forEach((item, index) => {
        const itemTotal = (item.quantity || 0) * (item.price || 0);
        const roundedItemTotal = roundCurrency(itemTotal);
        console.log(`   ${index + 1}. ${item.name || 'Unknown'}: ${item.quantity} × ${(item.price || 0).toFixed(2)} = ${roundedItemTotal.toFixed(2)}`);
      });
      
      // Check if total calculation seems wrong
      const expectedTotal = subtotal + shipping - discount;
      if (Math.abs(total - expectedTotal) > 0.01) {
        console.warn(`⚠️ Total calculation mismatch! Expected: ${expectedTotal.toFixed(2)}, Got: ${total.toFixed(2)}`);
      }
    }
  }, [cartItems, shipping, discount, subtotal, total, mounted]);

  // Load shipping methods if not provided initially or if initial methods are empty
  useEffect(() => {
    const loadShippingMethods = async () => {
      console.log('🚚 Checking shipping methods state:', {
        shippingMethods: shippingMethods?.length || 0,
        initialShippingMethods: initialShippingMethods?.length || 0,
        mounted,
        selectedShippingMethod: selectedShippingMethod?.name || null
      });
      
      // Prevent multiple loading attempts
      if (isLoadingShipping) {
        console.log('🚚 Already loading shipping methods, skipping...');
        return;
      }
      
      if (!shippingMethods || shippingMethods.length === 0) {
        console.log('🚚 Loading shipping methods...');
        setIsLoadingShipping(true);
        try {
          const { getShippingMethods } = await import('../lib/api');
          const methods = await getShippingMethods();
          console.log('🚚 Loaded shipping methods:', methods);
          
          if (methods && methods.length > 0) {
            setShippingMethods(methods);
            // Auto-select first method only if none selected and no previous selection
            if (!selectedShippingMethod) {
              setSelectedShippingMethod(methods[0]);
              console.log('🎯 Auto-selected first shipping method:', methods[0]);
            }
          } else {
            console.warn('🚚 No shipping methods available from API');
          }
        } catch (error) {
          console.error('❌ Failed to load shipping methods:', error);
          // Set fallback methods
          const fallbackMethods = [{
            id: 1,
            name: 'Standard Shipping',
            price: 9.99,
            description: '5-7 business days',
            details: 'Standard delivery service with tracking included.',
            estimated_delivery: '5-7 business days',
            tracking_available: true,
            fallback: true
          }];
          setShippingMethods(fallbackMethods);
          if (!selectedShippingMethod) {
            setSelectedShippingMethod(fallbackMethods[0]);
          }
        } finally {
          setIsLoadingShipping(false);
        }
      } else {
        console.log('🚚 Shipping methods already loaded:', shippingMethods.length);
      }
    };

    if (mounted && !isLoadingShipping) {
      loadShippingMethods();
    }
  }, [mounted]); // Removed dependencies that cause loops

  // Enhanced cart analysis and shipping calculation with DRF backend integration
  const analyzeCartShipping = async (cartData = cartItems) => {
    if (!cartData || cartData.length === 0) {
      console.log('🛒 No cart items to analyze');
      return null;
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingShipping) {
      console.log('🛒 Cart shipping analysis already in progress, skipping...');
      return null;
    }
    
    setIsLoadingShipping(true);
    try {
      // Transform cart items to API format with robust productId extraction
      const apiCartItems = cartData.map(item => {
        const productId = item.productId || item.product_id || item.id || item.uuid;
        
        // Validate productId
        if (!productId) {
          console.error('❌ Cart item missing productId:', item);
          throw new Error(`Cart item missing productId: ${JSON.stringify(item)}`);
        }
        
        return {
          product_id: productId,
          quantity: item.quantity || 1
        };
      });

      console.log('🚚 Analyzing cart shipping for:', apiCartItems);

      const { response, result } = await makeAPIRequest('/api/orders/analyze-cart-shipping/', {
        method: 'POST',
        body: JSON.stringify({
          cart_items: apiCartItems
        })
      });

      if (response.ok && result?.success) {
        const analysis = result;
        console.log('✅ Cart shipping analysis successful:', analysis);
        
        // Update shipping analysis state
        setShippingAnalysis(analysis);
        setShippingMethods(analysis.shipping_analysis.available_methods);
        setFreeShippingEligible(analysis.shipping_analysis.free_shipping_eligible);
        setFreeShippingRule(analysis.shipping_analysis.qualifying_free_rule);
        setRequiresSplitShipping(analysis.shipping_analysis.requires_split_shipping);
        
        // Extract shipping categories
        const categoryIds = new Set(analysis.cart_analysis.shipping_category_ids);
        setShippingCategories(categoryIds);
        
        // Auto-select optimal shipping method only if none is currently selected
        if (!selectedShippingMethod && analysis.shipping_analysis.available_methods.length > 0) {
          const optimalMethod = analysis.shipping_analysis.available_methods[0];
          console.log('🎯 Auto-selecting optimal shipping method:', optimalMethod);
          setSelectedShippingMethod(optimalMethod);
        }
        
        return analysis;
      } else {
        console.error('❌ Cart shipping analysis failed:', result?.error || response.statusText);
        console.log('🚚 Falling back to direct shipping methods loading...');
        
        // If cart analysis fails, try loading shipping methods directly
        try {
          const { getShippingMethods } = await import('../lib/api');
          const methods = await getShippingMethods();
          console.log('🚚 Loaded direct shipping methods as fallback:', methods);
          
          if (methods && methods.length > 0) {
            setShippingMethods(methods);
            // Only auto-select if no method is currently selected
            if (!selectedShippingMethod) {
              setSelectedShippingMethod(methods[0]);
              console.log('🎯 Auto-selected fallback shipping method:', methods[0]);
            }
          }
        } catch (directError) {
          console.error('❌ Direct shipping methods loading also failed:', directError);
          // Use hard fallback methods only if no methods exist
          if (!shippingMethods || shippingMethods.length === 0) {
            const fallbackMethods = [{
              id: 1,
              name: 'Standard Shipping',
              description: '5-7 business days',
              calculated_price: '9.99',
              base_price: '9.99',
              delivery_estimated_time: '5-7 business days',
              price: 9.99,
              fallback: true
            }];
            setShippingMethods(fallbackMethods);
            if (!selectedShippingMethod) {
              setSelectedShippingMethod(fallbackMethods[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error analyzing cart shipping:', error);
      console.log('🚚 Attempting to load shipping methods directly due to cart analysis error...');
      
      // Try loading shipping methods directly when cart analysis fails
      try {
        const { getShippingMethods } = await import('../lib/api');
        const methods = await getShippingMethods();
        console.log('🚚 Loaded direct shipping methods after error:', methods);
        
        if (methods && methods.length > 0) {
          setShippingMethods(methods);
          if (!selectedShippingMethod) {
            setSelectedShippingMethod(methods[0]);
            console.log('🎯 Auto-selected shipping method after error recovery:', methods[0]);
          }
        }
      } catch (directError) {
        console.error('❌ Direct shipping methods loading failed:', directError);
        // Set hard fallback shipping methods only if no methods exist
        if (!shippingMethods || shippingMethods.length === 0) {
          const fallbackMethods = [{
            id: 1,
            name: 'Standard Shipping',
            description: '5-7 business days',
            calculated_price: '9.99',
            base_price: '9.99',
            delivery_estimated_time: '5-7 business days',
            price: 9.99,
            fallback: true
          }];
          setShippingMethods(fallbackMethods);
          if (!selectedShippingMethod) {
            setSelectedShippingMethod(fallbackMethods[0]);
          }
        }
      }
    } finally {
      setIsLoadingShipping(false);
    }
  };

  // Load cart shipping analysis - wrapper function for retry functionality
  const loadCartShippingAnalysis = async () => {
    try {
      console.log('🔄 Reloading cart shipping analysis...');
      await analyzeCartShipping(cartItems);
    } catch (error) {
      console.error('❌ Failed to reload cart shipping analysis:', error);
      showError('Failed to reload shipping information. Please try again.');
    }
  };

  // Enhanced checkout calculation with backend integration
  const calculateEnhancedCheckout = async (shippingMethodId = null, couponCode = null) => {
    if (!cartItems || cartItems.length === 0) return;
    
    setIsCalculating(true);
    try {
      // Transform cart items to API format
      const apiCartItems = cartItems.map(item => ({
        product_id: item.productId || item.id,
        quantity: item.quantity || 1
      }));

      const requestBody = {
        cart_items: apiCartItems,
        ...(shippingMethodId && { selected_shipping_method_id: shippingMethodId }),
        ...(couponCode && { coupon_code: couponCode }),
        ...(user?.id && { user_id: user.id })
      };

      const { response, result } = await makeAPIRequest('/api/orders/enhanced-checkout-calculation/', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (response.ok && result?.success) {
        setCheckoutCalculation(result);
        
        // Update discount if coupon is applied
        if (result.coupon_details?.product_discount) {
          setDiscount(parseFloat(result.coupon_details.product_discount));
          setCouponApplied(true);
        }
        
        // Update shipping methods from enhanced calculation
        if (result.shipping_details?.available_methods) {
          setShippingMethods(result.shipping_details.available_methods);
          setFreeShippingEligible(result.shipping_details.free_shipping_eligible);
        }
        
        console.log('✅ Enhanced checkout calculation completed:', result);
        return result;
      } else {
        console.error('❌ Enhanced checkout calculation failed:', result?.error || response.statusText);
      }
    } catch (error) {
      console.error('❌ Error calculating enhanced checkout:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Enhanced cart and shipping analysis when cart changes - with better debouncing
  useEffect(() => {
    if (!mounted || !cartItems.length) {
      if (mounted && cartItems.length === 0) {
        // Clear shipping analysis when cart is empty
        setShippingAnalysis(null);
        setCheckoutCalculation(null);
      }
      return;
    }

    // Check if cart has test/invalid items
    const hasTestItems = cartItems.some(item => 
      item.id && item.id.toString().startsWith('test-') || 
      item.productId && item.productId.toString().startsWith('test-')
    );
    
    if (hasTestItems) {
      console.log('🚚 Test cart items detected, skipping cart analysis and using direct shipping methods');
      return;
    }
    
    // Prevent multiple simultaneous analysis calls
    if (isLoadingShipping) {
      console.log('🚚 Already loading shipping, skipping cart analysis...');
      return;
    }
    
    // Debounce cart analysis to avoid excessive API calls
    console.log('🚚 Setting up cart analysis debounce...');
    const timeoutId = setTimeout(() => {
      console.log('🚚 Executing debounced cart analysis...');
      analyzeCartShipping(cartItems);
    }, 1000); // Increased debounce time
    
    return () => {
      console.log('🚚 Clearing cart analysis timeout...');
      clearTimeout(timeoutId);
    };
  }, [cartItems, mounted]); // Removed isLoadingShipping dependency to prevent loops

  // Enhanced checkout calculation when shipping method or discount changes - with better control
  useEffect(() => {
    if (!mounted || !cartItems.length || !selectedShippingMethod) {
      return;
    }
    
    // Prevent calculation during loading
    if (isLoadingShipping || isCalculating) {
      console.log('🚚 Skipping checkout calculation - already loading/calculating');
      return;
    }
    
    console.log('🚚 Setting up enhanced checkout calculation...');
    // Debounce checkout calculation
    const timeoutId = setTimeout(() => {
      console.log('🚚 Executing enhanced checkout calculation...');
      calculateEnhancedCheckout(
        selectedShippingMethod.id, 
        couponApplied ? couponCode : null
      );
    }, 500); // Increased debounce time
    
    return () => {
      console.log('🚚 Clearing checkout calculation timeout...');
      clearTimeout(timeoutId);
    };
  }, [selectedShippingMethod?.id, couponApplied, couponCode, mounted, cartItems.length]); // More specific dependencies

  // Initialize component with server data - improved to prevent blinking
  useEffect(() => {
    if (serverError) {
      console.error('Server error on checkout data fetch:', serverError);
      setCouponMessage('Some data may not be current due to server issues');
      setTimeout(() => setCouponMessage(''), 5000);
    }
    
    if (timestamp) {
      console.log('Checkout data fetched at:', timestamp);
    }
    
    // Set default shipping method only once if not already set and methods are available
    if (!selectedShippingMethod && initialShippingMethods.length > 0 && !isLoadingShipping) {
      console.log('🎯 Setting initial shipping method from server data:', initialShippingMethods[0]);
      setSelectedShippingMethod(initialShippingMethods[0]);
    }
  }, [serverError, timestamp]); // Removed selectedShippingMethod dependency to prevent loops

  // Cleanup debounced timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (calculateEnhancedCheckoutDebounced) {
        clearTimeout(calculateEnhancedCheckoutDebounced);
      }
    };
  }, [calculateEnhancedCheckoutDebounced]);

  // Debug function for testing calculations (can be called from browser console)
  const debugCalculations = () => {
    console.log('🔧 Manual Debug Calculations:');
    console.log('   Cart Items:', cartItems);
    console.log('   Subtotal:', subtotal);
    console.log('   Shipping:', shipping);
    console.log('   Discount:', discount);
    console.log('   Total:', total);
    console.log('   Expected Total:', subtotal + shipping - discount);
    console.log('   Selected Shipping Method:', selectedShippingMethod);
    return {
      cartItems,
      subtotal,
      shipping,
      discount,
      total,
      expectedTotal: subtotal + shipping - discount,
      selectedShippingMethod
    };
  };

  // Make debug function available globally for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugCheckoutCalculations = debugCalculations;
    }
  }, [subtotal, shipping, discount, total, cartItems, selectedShippingMethod]);

  // Enhanced quantity control functions with real-time calculation updates
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    // Use CartContext to update quantity
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item) {
      const variantId = item.variantId || itemId;
      const result = updateQuantityContext(variantId, newQuantity);
      
      if (result.success) {
        const itemTotal = newQuantity * (item.price || 0);
        const roundedItemTotal = roundCurrency(itemTotal);
        console.log(`🔄 Quantity Updated: ${item.name || 'Unknown'} | New Qty: ${newQuantity} | Item Total: ${roundedItemTotal.toFixed(2)}`);
      }
    }
  };

  const incrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item) {
      const newQuantity = item.quantity + 1;
      console.log(`➕ Incrementing quantity for ${item.name || 'Unknown'}: ${item.quantity} → ${newQuantity}`);
      updateQuantity(itemId, newQuantity);
    }
  };

  const decrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      console.log(`➖ Decrementing quantity for ${item.name || 'Unknown'}: ${item.quantity} → ${newQuantity}`);
      updateQuantity(itemId, newQuantity);
    } else if (item && item.quantity === 1) {
      console.log(`🗑️ Removing item ${item.name || 'Unknown'} (quantity was 1)`);
      handleRemoveItem(itemId);
    }
  };

  const handleRemoveItem = (itemId) => {
    const item = cartItems.find(item => item.id === itemId || item.variantId === itemId);
    if (item) {
      const variantId = item.variantId || itemId;
      removeFromCartContext(variantId);
    }
    showModal({
      status: 'success',
      title: 'Item Removed',
      message: 'Item has been removed from your cart.',
      primaryActionText: 'OK'
    });
  };

  // Enhanced coupon application with backend validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponMessage('');
    
    try {
      // Use enhanced checkout calculation with coupon
      const result = await calculateEnhancedCheckout(
        selectedShippingMethod?.id, 
        couponCode.trim()
      );
      
      if (result?.coupon_details?.code && !result.coupon_details.error) {
        // Coupon applied successfully
        const couponDiscount = parseFloat(result.coupon_details.product_discount || 0);
        setDiscount(couponDiscount);
        setCouponApplied(true);
        setCouponMessage(result.coupon_details.message || 'Coupon applied successfully!');
        
        showModal({
          status: 'success',
          title: 'Coupon Applied!',
          message: `You saved ${couponDiscount.toFixed(2)} Tk with coupon "${couponCode}"`,
          primaryActionText: 'continue '
        });
      } else if (result?.coupon_details?.error) {
        // Coupon validation failed
        showModal({
          status: 'error',
          title: 'Invalid Coupon',
          message: result.coupon_details.error,
          primaryActionText: 'Try Again'
        });
      } else {
        // Fallback to original coupon logic if backend fails
        const fallbackResult = await applyCouponUnified(couponCode, cartItems, subtotal);
        
        if (fallbackResult.success) {
          setDiscount(fallbackResult.discount);
          setCouponApplied(true);
          setCouponMessage(fallbackResult.message);
          showModal({
            status: 'success',
            title: 'Coupon Applied!',
            message: fallbackResult.message,
            primaryActionText: 'continue '
          });
        } else {
          showModal({
            status: 'error',
            title: fallbackResult.minPurchase ? 'Minimum Purchase Required' : 'Invalid Coupon',
            message: fallbackResult.error,
            primaryActionText: 'Try Again'
          });
        }
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      showModal({
        status: 'error',
        title: 'Coupon Error',
        message: 'There was an error applying your coupon. Please try again.',
        primaryActionText: 'Try Again'
      });
    }
    
    setIsApplyingCoupon(false);
  };

  // Enhanced coupon removal with recalculation
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(0);
    setCouponMessage('');
    setIsApplyingCoupon(false);
    
    // Recalculate checkout without coupon
    if (cartItems.length > 0 && selectedShippingMethod) {
      calculateEnhancedCheckout(selectedShippingMethod.id, null);
    }
    
    showModal({
      status: 'success',
      title: 'Coupon Removed',
      message: 'The coupon has been successfully removed from your order.',
      primaryActionText: 'continue '
    });
  };

  const handleProceedToPayment = () => {
    // Validate shipping address fields
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
      showModal({
        status: 'error',
        title: 'Required Fields Missing',
        message: `Please fill in the following required fields: ${missingFieldNames}`,
        primaryActionText: 'OK'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress.trim())) {
      showModal({
        status: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        primaryActionText: 'OK'
      });
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      showModal({
        status: 'error',
        title: 'Invalid Phone Number',
        message: 'Please enter a valid phone number with at least 10 digits.',
        primaryActionText: 'OK'
      });
      return;
    }

    // Check if shipping method is selected
    if (!selectedShippingMethod) {
      showModal({
        status: 'error',
        title: 'Shipping Method Required',
        message: 'Please select a shipping method to continue.',
        primaryActionText: 'OK'
      });
      return;
    }

    // Check if cart has items
    if (!cartItems || cartItems.length === 0) {
      showModal({
        status: 'error',
        title: 'Empty Cart',
        message: 'Your cart is empty. Please add items to continue.',
        primaryActionText: 'OK'
      });
      return;
    }

    // If all validation passes, open payment modal
    setShowPaymentModal(true);
    
    // Fetch payment accounts when modal opens
    fetchPaymentAccounts();
  };

  const fetchPaymentAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const { response, result } = await makeAPIRequest('/api/orders/payment/accounts/');
      if (response.ok && result) {
        setPaymentAccounts(result);
        
        // Set the first active account as default if available
        if (result.length > 0) {
          const defaultAccount = result.find(acc => acc.is_active) || result[0];
          if (defaultAccount.account_number) {
            setAdminAccountNumber(defaultAccount.account_number);
            setPaymentMethod(defaultAccount.payment_method || 'bkash');
          }
        }
      } else {
        console.error('Failed to fetch payment accounts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching payment accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setTransactionNumber('');
    setTransactionId('');
    setComment('');
    setIsProcessingPayment(false);
    setPaymentAccounts([]);
    setLoadingAccounts(false);
  };

  // Enhanced shipping method selection with backend validation - OPTIMIZED
  // NOTE: Child component passes only the method id, so we resolve the full object here
  const handleShippingMethodSelect = (methodId) => {
    // Resolve method object from current shippingMethods
    const methodObj = shippingMethods.find(m => m.id?.toString() === methodId?.toString());
    if (!methodObj) {
      console.warn('⚠️ Shipping method id not found in available methods:', methodId);
      return;
    }

    console.log('🚚 Selecting shipping method:', methodObj);

    // Immediate UI update without reload
    setSelectedShippingMethod(methodObj);

    // Clear existing timeout if any
    if (calculateEnhancedCheckoutDebounced) {
      clearTimeout(calculateEnhancedCheckoutDebounced);
    }

    // Debounced backend calculation to prevent multiple requests
    const timeoutId = setTimeout(() => {
      if (cartItems.length > 0) {
        calculateEnhancedCheckout(methodObj.id, couponApplied ? couponCode : null);
      }
    }, 300); // 300ms debounce

    setCalculateEnhancedCheckoutDebounced(timeoutId);
  };

  // Keep selected shipping method in sync if shippingMethods list changes (e.g., after recalculation)
  useEffect(() => {
    if (selectedShippingMethod) {
      const stillExists = shippingMethods.some(m => m.id === selectedShippingMethod.id);
      if (!stillExists) {
        if (shippingMethods.length > 0) {
          console.log('🔄 Selected shipping method no longer exists. Auto-selecting first available.');
          setSelectedShippingMethod(shippingMethods[0]);
        } else {
          setSelectedShippingMethod(null);
        }
      }
    }
  }, [shippingMethods]);

  // Enhanced shipping info modal
  const handleShowShippingInfo = (method) => {
    setSelectedShippingInfo(method);
    setShowShippingInfoModal(true);
  };

  const handleCloseShippingInfoModal = () => {
    setShowShippingInfoModal(false);
    setSelectedShippingInfo(null);
  };

  const submitPayment = async () => {
    // Validate inputs
    if (!transactionNumber.trim()) {
      showModal({
        status: 'warning',
        title: 'Missing Information',
        message: 'Please enter a transaction number',
        primaryActionText: 'OK'
      });
      return;
    }
    
    if (!transactionId.trim()) {
      showModal({
        status: 'warning',
        title: 'Missing Information',
        message: 'Please enter a transaction ID',
        primaryActionText: 'OK'
      });
      return;
    }

    // Additional validation for minimum length
    if (transactionNumber.trim().length < 5) {
      showModal({
        status: 'warning',
        title: 'Invalid Information',
        message: 'Transaction number must be at least 5 characters long',
        primaryActionText: 'OK'
      });
      return;
    }

    if (transactionId.trim().length < 5) {
      showModal({
        status: 'warning',
        title: 'Invalid Information',
        message: 'Transaction ID must be at least 5 characters long',
        primaryActionText: 'OK'
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      console.log('🚀 Starting payment submission process...');
      console.log('🛒 Cart items:', cartItems);
      console.log('📦 Selected shipping method:', selectedShippingMethod);
      console.log('💰 Totals - Subtotal:', subtotal, 'Shipping:', shipping, 'Total:', total);
      
      // Validate subtotal consistency before sending
      const frontendSubtotal = subtotal; // Using the calculated subtotal from state
      const itemsSubtotal = cartItems.reduce((sum, item) => {
        const price = (() => {
          const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
          return isNaN(parsed) ? 0 : parsed;
        })();
        const quantity = (() => {
          const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
          return isNaN(parsed) ? 0 : parsed;
        })();
        return sum + (price * quantity);
      }, 0);

      const difference = Math.abs(frontendSubtotal - itemsSubtotal);
      const toleranceThreshold = 0.01; // Allow 1 cent difference for floating point precision

      if (difference > toleranceThreshold) {
        console.warn('⚠️ Subtotal mismatch detected:', {
          frontendSubtotal: frontendSubtotal.toFixed(2),
          itemsSubtotal: itemsSubtotal.toFixed(2),
          difference: difference.toFixed(2)
        });

        // Show warning modal but continue with submission
        const shouldContinue = await new Promise((resolve) => {
          showModal({
            status: 'warning',
            title: 'Calculation Discrepancy Detected',
            message: `There's a small difference in price calculations:\n\nDisplay Total: ${frontendSubtotal.toFixed(2)} Tk\nItems Total: ${itemsSubtotal.toFixed(2)} Tk\nDifference: ${difference.toFixed(2)} Tk\n\nThe server will calculate the final amount. Continue with order?`,
            primaryActionText: 'Continue Order',
            secondaryActionText: 'Cancel',
            onPrimaryAction: () => resolve(true),
            onSecondaryAction: () => resolve(false)
          });
        });

        if (!shouldContinue) {
          setIsProcessingPayment(false);
          return;
        }
      }

      // Create or get shipping address (for now, we'll create an inline object)
      // In a real implementation, this would be saved as an Address model first
      const shippingAddressData = {
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        zip_code: zipCode.trim(),
        country: 'Bangladesh' // Default country
      };

      // Format the payload according to OrderCreateSerializer
      const payload = {
        customer_name: `${firstName.trim()} ${lastName.trim()}`,
        customer_email: emailAddress.trim(),
        customer_phone: phoneNumber.trim(),
        shipping_address: shippingAddressData, // Will be handled by backend to create Address if needed
        shipping_method: selectedShippingMethod?.id,
        items: cartItems.map(item => {
          const price = (() => {
            const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
            return isNaN(parsed) ? 0 : parsed;
          })();
          const quantity = (() => {
            const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
            return isNaN(parsed) ? 0 : parsed;
          })();
          return {
            product: item.id || item.product_id,
            color: item.color_id || null,
            size: item.size_id || null,
            quantity: quantity,
            unit_price: price
          };
        }),
        coupon_code: couponApplied ? couponCode.trim() : undefined,
        payment: {
          sender_number: transactionNumber.trim(),
          transaction_id: transactionId.trim(),
          payment_method: paymentMethod,
          admin_account_number: adminAccountNumber
        },
        // Include frontend calculations for server-side validation
        frontend_subtotal: frontendSubtotal,
        frontend_total: total
      };

      console.log('🚀 Submitting order with payload:', payload);

      // Get JWT token if available (use accessToken as stored by AuthContext)
      const token = getAccessToken(); // Use the auth context helper
      console.log('🔐 Token found:', token ? 'Yes' : 'No');
      console.log('🔐 User authenticated:', isAuthenticated);
      console.log('🔐 User info:', user);
      
      // Set up fetch options
      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify(payload)
      };

      // Add Authorization header if JWT token exists
      if (token) {
        fetchOptions.headers = { Authorization: `Bearer ${token}` };
      }

      // Submit the order using the correct API endpoint
      const { response, result } = await makeAPIRequest('/api/orders/orders/submit/', fetchOptions);

      if (!response.ok) {
        // Handle validation errors with proper result checking
        if (response.status === 400 && result && result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation Error:\n${errorMessages}`);
        } else if (response.status === 500 && result && result.detail) {
          // Show more detailed 500 error information
          const errorMsg = result.detail;
          const errorType = result.error_type || 'Internal Server Error';
          throw new Error(`${errorType}: ${errorMsg}`);
        } else if (result && result.detail) {
          throw new Error(result.detail);
        } else if (result && result.message) {
          throw new Error(result.message);
        } else {
          throw new Error(`Server Error (${response.status}): ${response.statusText}`);
        }
      }
      
      // Check for server-side calculation warnings
      if (result && result.warnings && result.warnings.length > 0) {
        console.warn('⚠️ Server calculation warnings:', result.warnings);
        
        // Show warning but continue with success flow
        showModal({
          status: 'warning',
          title: 'Order Processed with Notes',
          message: `Your order was successfully placed, but the server noted:\n\n${result.warnings.join('\n')}\n\nThe final amount has been calculated by the server.`,
          primaryActionText: 'Continue',
          onPrimaryAction: () => {
            // Continue to success flow
            handleSuccessFlow(result);
          }
        });
        return;
      }
      
      // Normal success flow
      if (result) {
        handleSuccessFlow(result);
      } else {
        // Handle case where there's no result but response was OK
        showModal({
          status: 'success',
          title: 'Order Placed Successfully!',
          message: 'Your order has been placed successfully.',
          primaryActionText: 'Continue',
          onPrimaryAction: () => {
            handleCloseModal();
            localStorage.removeItem('cartItems');
            setCartItems([]);
            window.location.href = '/';
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Order submission error:', error);
      showModal({
        status: 'error',
        title: 'Order Failed',
        message: `Order submission failed: ${error.message}`,
        primaryActionText: 'Try Again',
        secondaryActionText: 'Cancel',
        onSecondaryAction: () => {
          setIsProcessingPayment(false);
        }
      });
      setIsProcessingPayment(false);
    }
  };

  // Extract success flow into separate function for reuse
  const handleSuccessFlow = (result) => {
    // On success: close modal and show success modal
    handleCloseModal();
    
    // Clear cart using CartContext (this will also update localStorage)
    clearCartContext();
    
    showModal({
      status: 'success',
      title: 'Order Placed Successfully!',
      message: `Your order #${result.order_number || 'N/A'} has been placed successfully. You will be redirected to the confirmation page.`,
      primaryActionText: 'View Order',
      onPrimaryAction: () => {
        // Store order data for confirmation page
        sessionStorage.setItem('orderConfirmation', JSON.stringify({
          orderId: result.id,
          orderNumber: result.order_number,
          totalAmount: result.total_amount,
          status: result.status,
          paymentStatus: result.payment_status,
          transactionNumber: transactionNumber.trim(),
          transactionId: transactionId.trim(),
          paymentMethod: paymentMethod,
          senderNumber: transactionNumber.trim(), // For backward compatibility
          cartItems: cartItems,
          cartSubtotal: subtotal,
          shippingMethod: selectedShippingMethod,
          userDetails: {
            name: `${firstName} ${lastName}`.trim(),
            address: streetAddress,
            city: city,
            zip: zipCode,
            phone: phoneNumber,
            email: emailAddress
          }
        }));
        window.location.href = '/confirmation';
      }
    });
  };

  // Keep the old function name for backward compatibility
  const handlePayment = submitPayment;

  // Don't render until mounted to avoid hydration issues with localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-4 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
          </div>

          {/* Main 2-Column Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            
            {/* LEFT COLUMN - Checkout Forms Skeleton */}
            <div className="space-y-6">
              
              {/* Shipping Address Skeleton */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-200 dark:bg-blue-700 mr-3 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
                
                {/* Form Fields */}
                <div className="space-y-4">
                  {/* First Row - Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: item * 0.1 }}
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Street Address */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </motion.div>
                  
                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 + item * 0.1 }}
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* City, State, ZIP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 + item * 0.1 }}
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Shipping Methods Skeleton */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-700 mr-3 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
                
                {/* Shipping Options */}
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <motion.div 
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + item * 0.1 }}
                      className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Button Skeleton */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Validation Status */}
                <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="bg-blue-400 dark:bg-blue-600 h-2 rounded-full relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Button */}
                <div className="h-16 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-700 dark:to-indigo-700 rounded-xl w-full mb-4 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                </div>
                
                {/* Total */}
                <div className="text-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Order Summary Skeleton */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:sticky lg:top-6 lg:self-start"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-200 dark:bg-green-700 mr-3 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {[1, 2, 3].map((item) => (
                    <motion.div 
                      key={item}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + item * 0.1 }}
                      className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 + item * 0.1 }}
                        className="flex justify-between items-center"
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Total */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="flex justify-between items-center"
                      >
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Global styles for shimmer animation */}
        <style jsx global>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-12deg);
            }
            100% {
              transform: translateX(200%) skewX(-12deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100 lato">
            Checkout
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 lato">
            Complete your order with style
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* LEFT COLUMN - Checkout Forms */}
          <div className="space-y-6">
            
            {/* Shipping Address Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 lato">
                  Shipping Address
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 lato">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent lato transition-all duration-200"
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Shipping Method Section */}
            <ShippingSelector
              availableMethods={shippingMethods}
              // Always pass string id for reliable comparison inside child component
              selectedMethod={selectedShippingMethod ? selectedShippingMethod.id?.toString() : null}
              onSelectMethod={handleShippingMethodSelect}
              loading={isLoadingShipping}
              error={null}
              shippingAnalysis={shippingAnalysis}
              onRetry={loadCartShippingAnalysis}
              onShowShippingInfo={() => setShowShippingInfoModal(true)}
            />

            {/* Payment Button - Enhanced with Validation Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Validation Status Indicator */}
              <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Information
                  </span>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const requiredFieldsCheck = [
                        firstName.trim(),
                        lastName.trim(),
                        streetAddress.trim(),
                        phoneNumber.trim(),
                        emailAddress.trim(),
                        city.trim(),
                        state.trim(),
                        zipCode.trim()
                      ];
                      const completedFields = requiredFieldsCheck.filter(field => field).length;
                      const totalFields = requiredFieldsCheck.length;
                      const isComplete = completedFields === totalFields && selectedShippingMethod && cartItems?.length > 0;
                      
                      return (
                        <>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isComplete 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {completedFields}/{totalFields} Fields
                          </span>
                          <div className={`w-3 h-3 rounded-full ${
                            isComplete 
                              ? 'bg-green-500 animate-pulse' 
                              : 'bg-amber-500'
                          }`} />
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(() => {
                        const requiredFieldsCheck = [
                          firstName.trim(),
                          lastName.trim(),
                          streetAddress.trim(),
                          phoneNumber.trim(),
                          emailAddress.trim(),
                          city.trim(),
                          state.trim(),
                          zipCode.trim()
                        ];
                        const completedFields = requiredFieldsCheck.filter(field => field).length;
                        const shippingSelected = selectedShippingMethod ? 1 : 0;
                        const cartHasItems = cartItems?.length > 0 ? 1 : 0;
                        const total = requiredFieldsCheck.length + 2; // +2 for shipping method and cart items
                        return ((completedFields + shippingSelected + cartHasItems) / total) * 100;
                      })()}%`
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  />
                </div>
              </div>

              {/* Enhanced Proceed Button */}
              <motion.button 
                onClick={handleProceedToPayment}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden group"
              >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                
                {/* Button Content */}
                <span className="relative flex items-center justify-center">
                  <motion.svg 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </motion.svg>
                  Proceed to Payment
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="ml-2"
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>

              {/* Total Amount Quick View */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-center"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Amount to Pay
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Tk_icon size={24} className="mr-2" />{total || '0.00'}
                </p>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 lato">
                  Order Summary
                </h2>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {!mounted ? (
                  <div className="space-y-4">
                    {/* Cart Item Skeleton Cards */}
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg relative overflow-hidden">
                        {/* Product Image Skeleton */}
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Product Name */}
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                          
                          {/* Quantity and Price */}
                          <div className="flex justify-between items-center">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center p-8">
                    <div className="mx-auto w-16 h-16 mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5h2.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 lato">Your cart is empty</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 lato">Add some products to get started</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div 
                      key={item.variantId || item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-blue-600 transition-all duration-200"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                        {item.image || item.product_image ? (
                          <Image 
                            src={item.image || item.product_image} 
                            alt={item.name || item.product_name || 'Product'}
                            fill
                            className="object-cover transition-all duration-300 hover:scale-105"
                            sizes="64px"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5h16.5-1.25a.75.75 0 0 0-.75-.75H5a.75.75 0 0 0-.75.75v.75Z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Details with Enhanced Shipping Category Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.name || item.product_name || 'Product'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                          <Tk_icon size={14} className="mr-1" />{item.price ? item.price.toFixed(2) : '0.00'} each
                        </p>
                        
                        {/* Shipping Category Badge */}
                        {shippingAnalysis?.cart_analysis?.items && (() => {
                          const itemAnalysis = shippingAnalysis.cart_analysis.items.find(
                            analysisItem => analysisItem.product_id === (item.productId || item.id)
                          );
                          return itemAnalysis?.shipping_category && (
                            <div className="mt-2">
                              <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center text-xs px-2.5 py-1 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-700 rounded-full font-medium text-indigo-700 dark:text-indigo-300"
                              >
                                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                {itemAnalysis.shipping_category}
                              </motion.span>
                            </div>
                          );
                        })()}

                        {/* Free Shipping Eligibility Indicator */}
                        {freeShippingEligible && freeShippingRule && (
                          <div className="mt-2">
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="inline-flex items-center text-xs px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-full font-medium text-green-700 dark:text-green-300"
                            >
                              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Qualifies for free shipping
                            </motion.div>
                          </div>
                        )}

                        {/* Product attributes if available */}
                        {(item.size || item.color) && (
                          <div className="flex space-x-2 mt-2">
                            {item.size && (
                              <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quantity Display (Read-only) */}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                            Qty: {item.quantity || 0}
                          </span>
                        </div>
                      </div>

                      {/* Real-time Item Total - quantity × price */}
                      <div className="text-right min-w-[4rem]">
                        <p className="font-bold text-lg text-gray-900 dark:text-white flex items-center justify-end">
                          <Tk_icon size={16} className="mr-1" />
                          {(() => {
                            const itemTotal = (item.price || 0) * (item.quantity || 0);
                            // Round to 2 decimal places to avoid floating point precision errors
                            const roundedTotal = roundCurrency(itemTotal);
                            return roundedTotal.toFixed(2);
                          })()}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.quantity || 0} × {(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Enhanced Order Totals with Backend Integration */}
              <div className="space-y-3 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                {/* Real-time Subtotal - Sum of all (quantity × price) */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-400 lato">
                      Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Sum of quantity × price for each item
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100 lato flex items-center">
                    <Tk_icon size={16} className="mr-1" />
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Shipping Analysis Information */}
                {shippingAnalysis && (
                  <div className="space-y-2">
                    {/* Split Shipping Warning */}
                    {requiresSplitShipping && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                            Split shipment may be required
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Free Shipping Progress */}
                    {!freeShippingEligible && checkoutCalculation?.recommendations?.savings_opportunities?.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Almost there! 🚚
                          </span>
                          <span className="text-xs text-blue-500 dark:text-blue-300 flex items-center">
                            Add <Tk_icon size={12} className="mx-1" />{checkoutCalculation.recommendations.savings_opportunities[0].amount_needed} more
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(100, (subtotal / parseFloat(checkoutCalculation.recommendations.savings_opportunities[0].threshold)) * 100)}%`
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {checkoutCalculation.recommendations.savings_opportunities[0].message}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Coupon Applied */}
                {discount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-500"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-600 dark:text-green-400">
                        Discount ({couponCode})
                        {checkoutCalculation?.coupon_details?.type && (
                          <span className="text-xs ml-1 opacity-75">
                            • {checkoutCalculation.coupon_details.type}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400 flex items-center">
                      -<Tk_icon size={16} className="mr-1" />{checkoutCalculation?.coupon_details?.product_discount 
                        ? parseFloat(checkoutCalculation.coupon_details.product_discount).toFixed(2)
                        : discount.toFixed(2)
                      }
                    </span>
                  </motion.div>
                )}
                
                {/* Shipping Cost */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    {selectedShippingMethod && (
                      <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                        via {selectedShippingMethod.name}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${shipping === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'} flex items-center`}>
                    {shipping === 0 ? 'FREE' : <><Tk_icon size={16} className="mr-1" />{shipping.toFixed(2)}</>}
                  </span>
                </div>
                
                {/* Real-time Final Total - subtotal + shipping - discount */}
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xl text-gray-900 dark:text-white">Total</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Subtotal + Shipping{discount > 0 ? ' - Discount' : ''}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {subtotal.toFixed(2)} + {shipping.toFixed(2)}{discount > 0 ? ` - ${discount.toFixed(2)}` : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-2xl text-orange-500 flex items-center justify-end">
                      <Tk_icon size={24} className="mr-2" />{total.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Updates automatically
                    </p>
                  </div>
                </motion.div>

                {/* Checkout Calculation Status */}
                {isCalculating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center p-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating calculations...
                  </motion.div>
                )}

                {/* Coupon Section */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 lato">
                      Have a coupon code?
                    </span>
                  </div>
                  
                  {!couponApplied ? (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 lato"
                          disabled={isApplyingCoupon}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || isApplyingCoupon}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 lato ${
                            !couponCode.trim() || isApplyingCoupon
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                          }`}
                        >
                          {isApplyingCoupon ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Applying...
                            </div>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      {couponMessage && !couponApplied && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400 bg-red-400 bg-opacity-10 border border-red-400 border-opacity-30 rounded px-2 py-1"
                        >
                          {couponMessage}
                        </motion.p>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-500"
                    >
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          ✓ {couponCode} Applied
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{couponMessage}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
                      >
                        Remove
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Sections for Checkout Page */}
      <EnhancedSectionRenderer page="checkout" />

      {/* Payment Modal - Full Implementation */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ 
                duration: 0.4, 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl shadow-2xl z-50 max-h-[95vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Content with Scroll */}
              <div className="flex flex-col max-h-[95vh]">
                
                {/* Modal Header - Fixed */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 20 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </motion.div>
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white lato">
                        Complete Payment
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Secure checkout process
                      </p>
                    </div>
                  </div>
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCloseModal}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white shadow-md"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

                  {/* Total Amount Display */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/30 dark:via-amber-900/20 dark:to-yellow-900/10 border-2 border-orange-200 dark:border-orange-700/50 p-4 sm:p-6"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-yellow-200/20 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Total Amount
                          </h3>
                          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">
                            ৳ {(() => {
                              const totalAmount = parseFloat(total) || 0;
                              return totalAmount.toFixed(2);
                            })()}
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          className="text-3xl sm:text-4xl"
                        >
                          💰
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment Method Selection */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <label className="block text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Select Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {['bkash', 'nagad', 'rocket'].map((method, index) => (
                        <motion.button
                          key={method}
                          type="button"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPaymentMethod(method)}
                          className={`relative overflow-hidden p-3 sm:p-4 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-300 ${
                            paymentMethod === method
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20'
                              : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          {paymentMethod === method && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg sm:text-xl">📱</span>
                            <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Admin Account Number Display */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-800/10 border-2 border-blue-200 dark:border-blue-700/50 p-4 sm:p-6"
                  >
                    <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full -ml-12 -mt-12"></div>
                    <div className="relative text-center">
                      <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Send Payment To
                      </label>
                      {loadingAccounts ? (
                        <div className="space-y-3">
                          {/* Account Number Skeleton */}
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto w-48 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                          
                          {/* Account Name Skeleton */}
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-32 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                          
                          {/* Copy Button Skeleton */}
                          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto w-24 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 tracking-wider">
                            {adminAccountNumber}
                          </div>
                          <div className="text-xs sm:text-sm text-blue-500 dark:text-blue-300 flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Official payment account
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Form Fields */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-white">
                          Transaction Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionNumber}
                          onChange={(e) => setTransactionNumber(e.target.value)}
                          required
                          placeholder="Enter transaction number"
                          className="w-full px-4 py-3 rounded-xl text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-white">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                          placeholder="Enter transaction ID"
                          className="w-full px-4 py-3 rounded-xl text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-white">
                        Optional Comment
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add any additional notes (optional)"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Modal Actions - Fixed Bottom */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCloseModal}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ 
                        scale: (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) ? 1 : 1.02,
                        boxShadow: (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) ? "none" : "0 10px 25px rgba(79, 70, 229, 0.3)"
                      }}
                      whileTap={{ scale: (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) ? 1 : 0.98 }}
                      onClick={handlePayment}
                      disabled={!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment}
                      className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white transition-all duration-300 ${
                        (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) 
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed border-2 border-gray-300 dark:border-gray-500' 
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-2 border-indigo-500 hover:border-indigo-600 shadow-lg'
                      }`}
                    >
                      {isProcessingPayment ? (
                        <span className="flex items-center justify-center">
                          <motion.svg 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </motion.svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Confirm Payment
                        </span>
                      )}
                    </motion.button>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Info Modal */}
      <AnimatePresence>
        {showShippingInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ 
                duration: 0.4, 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl shadow-2xl z-50 max-h-[95vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Content with Scroll */}
              <div className="flex flex-col max-h-[95vh]">
                
                {/* Modal Header - Fixed */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 20 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </motion.div>
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white lato">
                        Complete Payment
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Secure checkout process
                      </p>
                    </div>
                  </div>
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCloseModal}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white shadow-md"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

                  {/* Total Amount Display */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/30 dark:via-amber-900/20 dark:to-yellow-900/10 border-2 border-orange-200 dark:border-orange-700/50 p-4 sm:p-6"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-yellow-200/20 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Total Amount
                          </h3>
                          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">
                            ৳ {(() => {
                              const totalAmount = parseFloat(total) || 0;
                              return totalAmount.toFixed(2);
                            })()}
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          className="text-3xl sm:text-4xl"
                        >
                          💰
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment Method Selection */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <label className="block text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Select Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {['bkash', 'nagad', 'rocket'].map((method, index) => (
                        <motion.button
                          key={method}
                          type="button"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPaymentMethod(method)}
                          className={`relative overflow-hidden p-3 sm:p-4 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-300 ${
                            paymentMethod === method
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20'
                              : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          {paymentMethod === method && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg sm:text-xl">📱</span>
                            <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Admin Account Number Display */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-800/10 border-2 border-blue-200 dark:border-blue-700/50 p-4 sm:p-6"
                  >
                    <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full -ml-12 -mt-12"></div>
                    <div className="relative text-center">
                      <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Send Payment To
                      </label>
                      {loadingAccounts ? (
                        <div className="space-y-3">
                          {/* Account Number Skeleton */}
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto w-48 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                          
                          {/* Account Name Skeleton */}
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-32 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                          
                          {/* Copy Button Skeleton */}
                          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto w-24 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 tracking-wider">
                            {adminAccountNumber}
                          </div>
                          <div className="text-xs sm:text-sm text-blue-500 dark:text-blue-300 flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Official payment account
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Form Fields */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-white">
                          Transaction Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionNumber}
                          onChange={(e) => setTransactionNumber(e.target.value)}
                          required
                          placeholder="Enter transaction number"
                          className="w-full px-4 py-3 rounded-xl text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-white">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                          placeholder="Enter transaction ID"
                          className="w-full px-4 py-3 rounded-xl text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-900 dark:text-white">
                        Optional Comment
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add any additional notes (optional)"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Modal Actions - Fixed Bottom */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCloseModal}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ 
                        scale: (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) ? 1 : 1.02,
                        boxShadow: (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) ? "none" : "0 10px 25px rgba(79, 70, 229, 0.3)"
                      }}
                      whileTap={{ scale: (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) ? 1 : 0.98 }}
                      onClick={handlePayment}
                      disabled={!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment}
                      className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white transition-all duration-300 ${
                        (!transactionNumber.trim() || !transactionId.trim() || isProcessingPayment) 
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed border-2 border-gray-300 dark:border-gray-500' 
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-2 border-indigo-500 hover:border-indigo-600 shadow-lg'
                      }`}
                    >
                      {isProcessingPayment ? (
                        <span className="flex items-center justify-center">
                          <motion.svg 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </motion.svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Confirm Payment
                        </span>
                      )}
                    </motion.button>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Info Modal */}
      <AnimatePresence>
        {showShippingInfoModal && selectedShippingInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={handleCloseShippingInfoModal}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="bg-[var(--color-surface)] border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-lg w-full shadow-2xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white lato"
                >
                  Shipping Information
                </motion.h2>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleCloseShippingInfoModal}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-red-500 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Shipping Method Details */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-indigo-500"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white lato">
                      {selectedShippingInfo.name || selectedShippingInfo.title}
                    </h3>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-semibold"
                    >
                      {(() => {
                        const parsed = typeof selectedShippingInfo.price === 'number' ? selectedShippingInfo.price : parseFloat(selectedShippingInfo.price || 0);
                        const normalizedPrice = isNaN(parsed) ? 0 : parsed;
                        return normalizedPrice === 0 ? 'FREE' : <><Tk_icon size={16} className="inline mr-1" />{normalizedPrice.toFixed(2)}</>;
                      })()}
                    </motion.div>
                  </div>
                  <p className="text-sm mb-2 text-gray-600 dark:text-gray-400 lato">
                    {selectedShippingInfo.description}
                  </p>
                  
                  {/* Shipping features grid */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {selectedShippingInfo.delivery_estimated_time && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                      >
                        <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedShippingInfo.delivery_estimated_time}
                      </motion.div>
                    )}
                    
                    {selectedShippingInfo.tracking_available && (
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center text-sm text-green-600 dark:text-green-400"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tracking included
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {selectedShippingInfo.details && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white lato flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Additional Details:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 lato leading-relaxed">
                      {selectedShippingInfo.details}
                    </p>
                  </motion.div>
                )}

                {/* Additional shipping info sections */}
                {(selectedShippingInfo.weight_limit || selectedShippingInfo.size_limit) && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white lato flex items-center">
                      <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Shipping Restrictions:
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {selectedShippingInfo.weight_limit && (
                        <p>• Maximum weight: {selectedShippingInfo.weight_limit}</p>
                      )}
                      {selectedShippingInfo.size_limit && (
                        <p>• Size limit: {selectedShippingInfo.size_limit}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action buttons */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex space-x-3 mt-6"
              >
                <button
                  onClick={handleCloseShippingInfoModal}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 lato"
                >
                  Close
                </button>
                {selectedShippingMethod?.id !== selectedShippingInfo.id && (
                  <button
                    onClick={() => {
                      handleShippingMethodSelect(selectedShippingInfo);
                      handleCloseShippingInfoModal();
                    }}
                    className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 transition-all duration-200 hover:bg-indigo-700 transform hover:scale-105 lato"
                  >
                    Select This Method
                  </button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Shipping Info Modal */}
      <AnimatePresence>
        {showShippingInfoModal && selectedShippingInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShippingInfoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white poppins">
                    {selectedShippingInfo.name}
                  </h3>
                  <div className="flex items-center mt-2">
                    {selectedShippingInfo.id === 'free' || (selectedShippingInfo.calculated_price && parseFloat(selectedShippingInfo.calculated_price) === 0) ? (
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">FREE</span>
                    ) : (
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center">
                        <Tk_icon size={18} className="mr-1" />
                        {selectedShippingInfo.calculated_price 
                          ? parseFloat(selectedShippingInfo.calculated_price).toFixed(2)
                          : parseFloat(selectedShippingInfo.price || 0).toFixed(2)
                        }
                      </span>
                    )}
                    {selectedShippingInfo.tier_applied && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Bulk discount applied
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowShippingInfoModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Description */}
                {selectedShippingInfo.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {selectedShippingInfo.description}
                    </p>
                  </div>
                )}

                {/* Delivery Time */}
                {selectedShippingInfo.delivery_estimated_time && (
                  <div className="flex items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Estimated Delivery</p>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">{selectedShippingInfo.delivery_estimated_time}</p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-1 gap-2">
                  {selectedShippingInfo.tracking_available && (
                    <div className="flex items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-300">Tracking included</span>
                    </div>
                  )}

                  {selectedShippingInfo.is_free_shipping_rule && (
                    <div className="flex items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-sm text-emerald-700 dark:text-emerald-300">Free shipping eligible</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end mt-6 space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowShippingInfoModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Close
                  </motion.button>
                  {selectedShippingMethod?.id !== selectedShippingInfo.id && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleShippingMethodSelect(selectedShippingInfo);
                        setShowShippingInfoModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      Select This Method
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Shipping Info Modal */}
      <ShippingInfoModal
        isOpen={showShippingInfoModal}
        onClose={() => setShowShippingInfoModal(false)}
        selectedMethod={selectedShippingMethod?.id}
        shippingMethods={shippingMethods}
      />
    </div>
  );
};

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState({
    cartItems: [],
    shippingMethods: [],
    activeCoupons: [],
    error: null,
    timestamp: null,
    isLoading: true
  });

  // Fetch checkout data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setCheckoutData(prev => ({ ...prev, isLoading: true }));
      
      try {
        const data = await getCheckoutData();
        
        // If data contains an error, handle it gracefully
        if (data.error) {
          console.warn('Checkout data fetch warning:', data.error);
          setCheckoutData({
            cartItems: data.cartItems || [],
            shippingMethods: data.shippingMethods || [{
              id: 1,
              name: 'Standard Shipping',
              price: 9.99,
              description: 'Standard delivery service with tracking included.',
              delivery_estimated_time: '5-7 business days',
              tracking_available: true
            }],
            activeCoupons: data.activeCoupons || [],
            error: data.error,
            timestamp: data.timestamp,
            isLoading: false
          });
        } else {
          setCheckoutData({
            ...data,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        
        // Provide empty data instead of sample data
        setCheckoutData({
          cartItems: [],
          shippingMethods: [],
          activeCoupons: [],
          error: 'Failed to load checkout data. Please refresh the page.',
          timestamp: new Date().toISOString(),
          isLoading: false
        });
      }
    };

    fetchData();
  }, []);

  if (checkoutData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-4 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
          </div>

          {/* Main 2-Column Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            
            {/* LEFT COLUMN - Checkout Forms Skeleton */}
            <div className="space-y-6">
              
              {/* Shipping Address Skeleton */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-200 dark:bg-blue-700 mr-3 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
                
                {/* Form Fields */}
                <div className="space-y-4">
                  {/* First Row - Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: item * 0.1 }}
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Street Address */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </motion.div>
                  
                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 + item * 0.1 }}
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* City, State, ZIP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 + item * 0.1 }}
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg w-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Shipping Methods Skeleton */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-700 mr-3 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
                
                {/* Shipping Options */}
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <motion.div 
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + item * 0.1 }}
                      className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Button Skeleton */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Validation Status */}
                <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="bg-blue-400 dark:bg-blue-600 h-2 rounded-full relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Button */}
                <div className="h-16 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-700 dark:to-indigo-700 rounded-xl w-full mb-4 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                </div>
                
                {/* Total */}
                <div className="text-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Order Summary Skeleton */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:sticky lg:top-6 lg:self-start"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-200 dark:bg-green-700 mr-3 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {[1, 2, 3].map((item) => (
                    <motion.div 
                      key={item}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + item * 0.1 }}
                      className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                      <motion.div 
                        key={item}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 + item * 0.1 }}
                        className="flex justify-between items-center"
                      >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Total */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="flex justify-between items-center"
                      >
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Global styles for shimmer animation */}
        <style jsx global>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-12deg);
            }
            100% {
              transform: translateX(200%) skewX(-12deg);
            }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <ClientManifestErrorBoundary>
      <ProtectedRoute pageName="the checkout page">
        <CheckoutProvider>
          <div className="checkout-page pb-20 md:pb-5">
            <CheckoutProcess 
              initialCartItems={checkoutData.cartItems}
              initialShippingMethods={checkoutData.shippingMethods}
              initialActiveCoupons={checkoutData.activeCoupons}
              serverError={checkoutData.error}
              timestamp={checkoutData.timestamp}
            />
          </div>
        </CheckoutProvider>
        
        {/* Global shimmer animation styles */}
        <style jsx global>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-12deg);
            }
            100% {
              transform: translateX(200%) skewX(-12deg);
            }
          }
        `}</style>
      </ProtectedRoute>
    </ClientManifestErrorBoundary>
  );
}
