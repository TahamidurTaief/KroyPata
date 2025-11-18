// cartUtils.js - Centralized cart management utilities

/**
 * Get the appropriate price for a product based on user type
 * @param {Object} product - Product data
 * @param {Object} user - User object (optional)
 * @returns {Object} - Price information
 */
export const getProductPrice = (product, user = null) => {
  // Check if user is a wholesaler
  const isWholesaler = user?.user_type === 'WHOLESALER';
  
  const wholesalePrice = parseFloat(product?.wholesale_price || 0);
  const regularPrice = parseFloat(product?.price || 0);
  const discountPrice = parseFloat(product?.discount_price || 0);
  
  if (isWholesaler && wholesalePrice > 0) {
    return {
      price: wholesalePrice,
      originalPrice: regularPrice,
      label: "Wholesale Price",
      isWholesale: true
    };
  } else {
    return {
      price: discountPrice || regularPrice,
      originalPrice: discountPrice ? regularPrice : 0,
      label: discountPrice ? "Discounted Price" : "Regular Price", 
      isWholesale: false
    };
  }
};

/**
 * Add item to cart with proper localStorage management and wholesale pricing
 * @param {Object} product - Product data
 * @param {Object} options - Options like quantity, selectedColor, selectedSize, etc.
 * @returns {Object} - Result with success status and updated cart
 */
export const addToCart = (product, options = {}) => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    const {
      quantity = 1,
      selectedColor = null,
      selectedSize = null,
      variantId = null,
      user = null  // Accept user data to determine pricing
    } = options;

    // Get current cart
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Get appropriate pricing based on user type
    const pricingInfo = getProductPrice(product, user);
    
    // Create unique variant ID if not provided
    const itemVariantId = variantId || `${product.id}_${selectedColor?.id || 'default'}_${selectedSize?.id || 'default'}`;
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.variantId === itemVariantId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart with appropriate pricing
      const newItem = {
        id: product.id,
        productId: product.id,  // Ensure backend compatibility
        product_id: product.id,  // Additional backend compatibility
        variantId: itemVariantId,
        name: product.name,
        slug: product.slug,
        price: pricingInfo.price,  // Use the appropriate price (wholesale or regular/discount)
        quantity: quantity,
        thumbnail_url: product.thumbnail_url,
        selectedColor: selectedColor,
        selectedSize: selectedSize,
        color_id: selectedColor?.id || null,
        size_id: selectedSize?.id || null,
        // Enhanced pricing info for cart display
        original_price: parseFloat(product.price || 0),
        discount_price: parseFloat(product.discount_price || 0),
        wholesale_price: parseFloat(product.wholesale_price || 0),
        is_wholesale: pricingInfo.isWholesale,
        price_label: pricingInfo.label,
        unit_price: pricingInfo.price,
        stock: product.stock || 0,
        // Ensure we have all required fields for the cart display
        image: product.thumbnail_url,
        product_image: product.thumbnail_url,
        product_name: product.name,
        // Add weight and dimensions for shipping calculations
        weight: parseFloat(product.weight || 0),
        length: parseFloat(product.length || 0),
        width: parseFloat(product.width || 0),
        height: parseFloat(product.height || 0),
        // Add minimum purchase requirement
        minimum_purchase: parseInt(product.minimum_purchase || 1)
      };
      
      cartItems.push(newItem);
    }
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Trigger storage event to notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { 
        action: 'add',
        product: product,
        cartItems: cartItems 
      } 
    }));
    
    return { 
      success: true, 
      cartItems: cartItems,
      addedItem: cartItems[existingItemIndex] || cartItems[cartItems.length - 1]
    };
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: 'Failed to add item to cart' };
  }
};

/**
 * Remove item from cart
 * @param {string} variantId - Unique variant identifier
 * @returns {Object} - Result with success status and updated cart
 */
export const removeFromCart = (variantId) => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const updatedCart = cartItems.filter(item => item.variantId !== variantId);
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Trigger storage event to notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { 
        action: 'remove',
        variantId: variantId,
        cartItems: updatedCart 
      } 
    }));
    
    return { success: true, cartItems: updatedCart };
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, error: 'Failed to remove item from cart' };
  }
};

/**
 * Update item quantity in cart
 * @param {string} variantId - Unique variant identifier
 * @param {number} newQuantity - New quantity
 * @returns {Object} - Result with success status and updated cart
 */
export const updateCartItemQuantity = (variantId, newQuantity) => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    if (newQuantity <= 0) {
      return removeFromCart(variantId);
    }
    
    const itemIndex = cartItems.findIndex(item => item.variantId === variantId);
    
    if (itemIndex >= 0) {
      cartItems[itemIndex].quantity = newQuantity;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      // Trigger storage event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { 
          action: 'update',
          variantId: variantId,
          quantity: newQuantity,
          cartItems: cartItems 
        } 
      }));
      
      return { success: true, cartItems: cartItems };
    }
    
    return { success: false, error: 'Item not found in cart' };
    
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, error: 'Failed to update cart item' };
  }
};

/**
 * Get current cart items
 * @returns {Array} - Current cart items
 */
export const getCartItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    return Array.isArray(cartItems) ? cartItems : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

/**
 * Check if item is in cart
 * @param {string} variantId - Unique variant identifier
 * @returns {boolean} - Whether item is in cart
 */
export const isItemInCart = (variantId) => {
  const cartItems = getCartItems();
  return cartItems.some(item => item.variantId === variantId);
};

/**
 * Get cart summary (total items, total price, etc.)
 * @returns {Object} - Cart summary
 */
export const getCartSummary = () => {
  const cartItems = getCartItems();
  
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
  
  // Calculate total weight for shipping
  const totalWeight = cartItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight || 0);
    const quantity = item.quantity || 0;
    return sum + (weight * quantity);
  }, 0);
  
  return {
    totalItems,
    totalPrice,
    totalWeight,
    itemCount: cartItems.length
  };
};

/**
 * Clear entire cart
 * @returns {Object} - Result with success status
 */
export const clearCart = () => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    localStorage.removeItem('cartItems');
    
    // Trigger storage event to notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { 
        action: 'clear',
        cartItems: [] 
      } 
    }));
    
    return { success: true, cartItems: [] };
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: 'Failed to clear cart' };
  }
};
