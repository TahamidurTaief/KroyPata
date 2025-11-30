"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useCartContext } from './CartContext';

// Create the Checkout Context
const CheckoutContext = createContext();

// Custom hook to use the checkout context
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

// Checkout Provider Component
export const CheckoutProvider = ({ children }) => {
  // Use global cart context instead of managing cart state locally
  const { 
    cartItems, 
    mounted,
    clearCart: clearCartContext,
    addToCart: addToCartContext,
    removeFromCart: removeFromCartContext,
    updateCartItemQuantity: updateCartItemQuantityContext
  } = useCartContext();

  // Buy Now state - check if user is in "Buy Now" mode
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);

  // Effect to check for Buy Now item from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const buyNowData = sessionStorage.getItem('buyNowItem');
      if (buyNowData) {
        try {
          const item = JSON.parse(buyNowData);
          setBuyNowItem(item);
          setIsBuyNowMode(true);
          console.log('🛒 Buy Now mode activated:', item);
        } catch (error) {
          console.error('Error parsing buyNowItem:', error);
        }
      }
    }
  }, []);

  // Determine which items to use (Buy Now item or cart items)
  const effectiveCartItems = isBuyNowMode && buyNowItem ? [buyNowItem] : cartItems;

  // Shipping state
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  // User details state
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Listen for cart cleared events to reset checkout state
  useEffect(() => {
    const handleCartCleared = (event) => {
      console.log('🔄 Cart cleared event received in CheckoutContext:', event.detail);
      // Reset related checkout state if this was due to checkout success
      if (event.detail?.reason === 'checkout_success') {
        setSelectedShippingMethod(null);
        setSelectedPaymentMethod(null);
        setAppliedCoupon(null);
      }
    };

    window.addEventListener('cartCleared', handleCartCleared);
    
    return () => {
      window.removeEventListener('cartCleared', handleCartCleared);
    };
  }, []);

  // Calculate order totals
  const orderTotals = {
    // Cart subtotal calculation - use effectiveCartItems instead of cartItems
    get subtotal() {
      return effectiveCartItems.reduce((sum, item) => {
        const price = item.price || item.unit_price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
      }, 0);
    },

    // Shipping cost calculation
    get shippingCost() {
      if (!selectedShippingMethod || !selectedShippingMethod.price) {
        return 0;
      }
      return parseFloat(selectedShippingMethod.price);
    },

    // Discount calculation
    get discountAmount() {
      if (!appliedCoupon) return 0;
      
      const subtotal = this.subtotal;
      const minPurchase = appliedCoupon.conditions?.minPurchase || 0;
      
      if (subtotal >= minPurchase) {
        if (appliedCoupon.type === 'percentage') {
          return subtotal * (appliedCoupon.discountValue / 100);
        } else if (appliedCoupon.type === 'fixed') {
          return Math.min(appliedCoupon.discountValue, subtotal);
        }
      }
      return 0;
    },

    // Total calculation
    get total() {
      return Math.max(0, this.subtotal + this.shippingCost - this.discountAmount);
    }
  };

  // Shipping methods actions
  const handleShippingMethodChange = (method) => {
    setSelectedShippingMethod(method);
    console.log('🚚 Shipping method updated in context:', {
      id: method?.id,
      name: method?.name || method?.title,
      price: method?.price,
      newTotal: orderTotals.subtotal + parseFloat(method?.price || 0)
    });
  };

  // Cart actions - delegate to CartContext
  const addToCart = (product, options = {}) => {
    return addToCartContext(product, options);
  };

  const removeFromCart = (variantId) => {
    return removeFromCartContext(variantId);
  };

  const updateCartItemQuantity = (variantId, quantity) => {
    return updateCartItemQuantityContext(variantId, quantity);
  };

  const clearCart = () => {
    return clearCartContext();
  };

  // Clear cart after successful checkout
  const clearCartAfterCheckout = () => {
    console.log('🛒 Clearing cart after successful checkout');
    
    // If in Buy Now mode, clear the sessionStorage item
    if (isBuyNowMode) {
      sessionStorage.removeItem('buyNowItem');
      setBuyNowItem(null);
      setIsBuyNowMode(false);
    } else {
      // Normal cart checkout
      clearCart();
    }
    
    // Reset checkout state
    setSelectedShippingMethod(null);
    setSelectedPaymentMethod(null);
    setAppliedCoupon(null);
  };

  // Coupon actions
  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // User details actions
  const updateUserDetails = (details) => {
    setUserDetails(prev => ({ ...prev, ...details }));
  };

  // Reset checkout state
  const resetCheckout = () => {
    setSelectedShippingMethod(null);
    setSelectedPaymentMethod(null);
    setAppliedCoupon(null);
    clearCart();
  };

  // Validation helpers
  const isShippingSelected = selectedShippingMethod !== null;
  const isCartEmpty = effectiveCartItems.length === 0;
  const isUserDetailsComplete = Object.values(userDetails).every(value => value.trim() !== '');

  const contextValue = {
    // State
    cartItems: effectiveCartItems, // Use effectiveCartItems to include Buy Now items
    selectedShippingMethod,
    userDetails,
    appliedCoupon,
    selectedPaymentMethod,
    mounted,
    isBuyNowMode, // Expose Buy Now mode state

    // Calculated values
    orderTotals,

    // Actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    clearCartAfterCheckout,
    handleShippingMethodChange,
    setSelectedPaymentMethod,
    applyCoupon,
    removeCoupon,
    updateUserDetails,
    resetCheckout,

    // Validation
    isShippingSelected,
    isCartEmpty,
    isUserDetailsComplete,

    // Legacy support (for backward compatibility)
    subtotal: orderTotals.subtotal,
    shippingCost: orderTotals.shippingCost,
    discountAmount: orderTotals.discountAmount,
    total: orderTotals.total,
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutContext;
