"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  getCartItems as getCartItemsUtil, 
  addToCart as addToCartUtil, 
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  clearCart as clearCartUtil,
  getCartSummary as getCartSummaryUtil,
  isItemInCart as isItemInCartUtil
} from '@/app/lib/cartUtils';

// Create Cart Context
const CartContext = createContext();

// Custom hook to use the Cart Context
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

/**
 * CartProvider component - Global state management for shopping cart
 * Eliminates cart state duplication and prop drilling across the application
 */
export const CartProvider = ({ children }) => {
  // Core cart state
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  /**
   * Load cart items from localStorage
   * Centralized function to ensure consistency across the app
   */
  const loadCartItems = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const items = getCartItemsUtil();
      setCartItems(items);
      console.log('🛒 Cart loaded:', items.length, 'items');
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      setCartItems([]);
    }
  }, []);

  /**
   * Add item to cart
   * @param {Object} product - Product to add
   * @param {Object} options - Additional options (quantity, color, size, user)
   */
  const addToCart = useCallback((product, options = {}) => {
    const result = addToCartUtil(product, options);
    
    if (result.success) {
      setCartItems(result.cartItems);
      setAnimationTrigger(prev => prev + 1);
      console.log('✅ Item added to cart:', product.name);
      return { success: true, item: result.addedItem };
    } else {
      console.error('❌ Failed to add item to cart:', result.error);
      return { success: false, error: result.error };
    }
  }, []);

  /**
   * Remove item from cart
   * @param {string} variantId - Unique variant identifier
   */
  const removeFromCart = useCallback((variantId) => {
    const result = removeFromCartUtil(variantId);
    
    if (result.success) {
      setCartItems(result.cartItems);
      console.log('✅ Item removed from cart:', variantId);
      return { success: true };
    } else {
      console.error('❌ Failed to remove item from cart:', result.error);
      return { success: false, error: result.error };
    }
  }, []);

  /**
   * Update cart item quantity
   * @param {string} variantId - Unique variant identifier
   * @param {number} newQuantity - New quantity
   */
  const updateCartItemQuantity = useCallback((variantId, newQuantity) => {
    const result = updateCartItemQuantityUtil(variantId, newQuantity);
    
    if (result.success) {
      setCartItems(result.cartItems);
      console.log('✅ Cart item quantity updated:', variantId, '→', newQuantity);
      return { success: true };
    } else {
      console.error('❌ Failed to update cart item:', result.error);
      return { success: false, error: result.error };
    }
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    const result = clearCartUtil();
    
    if (result.success) {
      setCartItems([]);
      console.log('✅ Cart cleared');
      return { success: true };
    } else {
      console.error('❌ Failed to clear cart:', result.error);
      return { success: false, error: result.error };
    }
  }, []);

  /**
   * Check if item is in cart
   * @param {string} variantId - Unique variant identifier
   */
  const isItemInCart = useCallback((variantId) => {
    return isItemInCartUtil(variantId);
  }, []);

  /**
   * Get cart summary (totals, counts, etc.)
   */
  const getCartSummary = useCallback(() => {
    return getCartSummaryUtil();
  }, []);

  // Initialize cart on mount
  useEffect(() => {
    setMounted(true);
    loadCartItems();
  }, [loadCartItems]);

  // Listen for cart update events from external sources
  useEffect(() => {
    if (!mounted) return;

    const handleCartUpdated = (event) => {
      const { action, cartItems: updatedCart } = event.detail || {};
      console.log('🔄 Cart update event:', action);
      loadCartItems(); // Reload from localStorage to ensure consistency
    };

    const handleCartCleared = () => {
      console.log('🔄 Cart cleared event');
      setCartItems([]);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'cartItems') {
        console.log('🔄 Cart storage changed (cross-tab sync)');
        loadCartItems();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdated);
    window.addEventListener('cartCleared', handleCartCleared);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
      window.removeEventListener('cartCleared', handleCartCleared);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted, loadCartItems]);

  // Calculate derived state (memoized for performance)
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const uniqueItemCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price || 0);
    const quantity = parseInt(item.quantity || 0);
    return sum + (price * quantity);
  }, 0);
  const isEmpty = cartItems.length === 0;

  // Context value
  const value = {
    // State
    cartItems,
    mounted,
    animationTrigger,
    
    // Derived state
    cartCount,
    uniqueItemCount,
    cartTotal,
    isEmpty,
    
    // Actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadCartItems,
    isItemInCart,
    getCartSummary,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
