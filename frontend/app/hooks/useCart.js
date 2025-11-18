"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage cart state and listen to cart events
 * Provides cart count, items, and animation triggers
 */
export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Load cart items from localStorage
  const loadCartItems = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        const parsedItems = JSON.parse(storedCart);
        setCartItems(parsedItems);
        
        // Calculate total count (sum of all quantities)
        const totalCount = parsedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalCount);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  // Trigger animation effect
  const triggerAnimation = useCallback(() => {
    setAnimationTrigger(prev => prev + 1);
  }, []);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    loadCartItems();
  }, [loadCartItems]);

  // Listen for cart updates
  useEffect(() => {
    if (!mounted) return;

    const handleCartUpdated = (event) => {
      const { action, cartItems: updatedCart } = event.detail;
      
      console.log('🛒 Cart updated:', { action, itemCount: updatedCart?.length });
      
      // Reload cart items from localStorage
      loadCartItems();
      
      // Trigger animation for add actions with a small delay for better UX
      if (action === 'add') {
        setTimeout(() => {
          triggerAnimation();
        }, 100);
      }
    };

    const handleCartCleared = () => {
      console.log('🛒 Cart cleared');
      setCartItems([]);
      setCartCount(0);
    };

    // Listen to custom cart events
    window.addEventListener('cartUpdated', handleCartUpdated);
    window.addEventListener('cartCleared', handleCartCleared);

    // Listen to storage events (for cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'cartItems') {
        loadCartItems();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
      window.removeEventListener('cartCleared', handleCartCleared);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted, loadCartItems, triggerAnimation]);

  // Calculate cart total price
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price || 0);
    const quantity = parseInt(item.quantity || 0);
    return sum + (price * quantity);
  }, 0);

  // Calculate unique item count (number of different products)
  const uniqueItemCount = cartItems.length;

  return {
    cartItems,
    cartCount,
    uniqueItemCount,
    cartTotal,
    animationTrigger,
    mounted,
    loadCartItems,
    triggerAnimation
  };
};

export default useCart;
