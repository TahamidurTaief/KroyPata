// Checkout utilities for handling post-checkout actions
import { clearCartAfterCheckout } from '@/app/lib/api';

/**
 * Handle successful checkout completion
 * This function should be called after a successful order placement
 * @param {Object} orderResponse - The response from the order creation API
 * @param {Object} options - Additional options
 * @param {boolean} options.clearCart - Whether to clear the cart (default: true)
 * @param {boolean} options.showNotification - Whether to show success notification (default: false)
 * @param {Function} options.onComplete - Callback function to run after cleanup
 */
export const handleCheckoutSuccess = async (orderResponse, options = {}) => {
  const {
    clearCart = true,
    showNotification = false,
    onComplete = null
  } = options;

  console.log('🎉 Checkout completed successfully:', orderResponse);

  try {
    // Clear the cart if requested
    if (clearCart) {
      await clearCartAfterCheckout();
    }

    // Show success notification if requested
    if (showNotification && typeof window !== 'undefined') {
      // You can replace this with your preferred notification system
      console.log('✅ Order placed successfully!');
    }

    // Run any additional completion logic
    if (onComplete && typeof onComplete === 'function') {
      await onComplete(orderResponse);
    }

    return { success: true };
  } catch (error) {
    console.error('Error during checkout success handling:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Utility to check if cart should be cleared after checkout
 * This can be used to implement different clearing strategies
 * @param {Array} checkedOutItems - Items that were successfully checked out
 * @param {Array} currentCartItems - Current items in the cart
 * @returns {Array} Items that should remain in the cart
 */
export const getItemsToKeepInCart = (checkedOutItems, currentCartItems) => {
  if (!Array.isArray(checkedOutItems) || !Array.isArray(currentCartItems)) {
    return currentCartItems || [];
  }

  // Filter out items that were successfully checked out
  return currentCartItems.filter(cartItem => {
    return !checkedOutItems.some(checkedOutItem => 
      cartItem.id === checkedOutItem.product_id ||
      cartItem.product_id === checkedOutItem.product_id ||
      cartItem.variantId === checkedOutItem.variantId
    );
  });
};

/**
 * Clear only specific items from cart after checkout
 * Use this if you want to implement partial cart clearing
 * @param {Array} itemsToRemove - Items that should be removed from cart
 */
export const clearSpecificItemsFromCart = async (itemsToRemove) => {
  if (typeof window === 'undefined') {
    return { error: 'localStorage not available' };
  }

  try {
    const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const updatedCart = getItemsToKeepInCart(itemsToRemove, currentCart);
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { 
        reason: 'checkout_partial_clear',
        removedItems: itemsToRemove,
        remainingItems: updatedCart
      } 
    }));

    console.log('🛒 Specific items cleared from cart:', itemsToRemove);
    return { success: true, cartItems: updatedCart };
  } catch (error) {
    console.error('Error clearing specific items from cart:', error);
    return { error: 'Failed to clear specific items from cart' };
  }
};
