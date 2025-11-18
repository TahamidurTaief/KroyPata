// app/lib/shippingUtils.js
import { analyzeCartShipping, calculateEnhancedCheckout } from './api';

/**
 * Advanced shipping utilities for cart and checkout
 */

/**
 * Calculate total cart amount
 * @param {Array} cartItems - Cart items with price and quantity
 * @returns {number} Total cart amount
 */
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (parseFloat(item.price) * parseInt(item.quantity));
  }, 0);
};

/**
 * Calculate total cart quantity
 * @param {Array} cartItems - Cart items with quantity
 * @returns {number} Total quantity
 */
export const calculateCartQuantity = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + parseInt(item.quantity);
  }, 0);
};

/**
 * Calculate total cart weight
 * @param {Array} cartItems - Cart items with weight and quantity
 * @returns {number} Total weight in kg
 */
export const calculateCartWeight = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const weight = parseFloat(item.weight || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + (weight * quantity);
  }, 0);
};

/**
 * Analyze cart shipping requirements and get available methods
 * @param {Array} cartItems - Cart items
 * @returns {Object} Shipping analysis results
 */
export const analyzeCartShippingRequirements = async (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      success: false,
      error: 'Cart is empty',
      cart_analysis: {
        items: [],
        subtotal: '0.00',
        total_quantity: 0,
        shipping_categories_count: 0,
        shipping_category_ids: []
      },
      shipping_analysis: {
        requires_split_shipping: false,
        available_methods_count: 0,
        available_methods: [],
        free_shipping_eligible: false,
        qualifying_free_rule: null
      }
    };
  }

  try {
    const response = await analyzeCartShipping(cartItems);
    return response;
  } catch (error) {
    console.error('Failed to analyze cart shipping:', error);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
};

/**
 * Check if cart qualifies for free shipping
 * @param {Array} shippingMethods - Available shipping methods
 * @param {boolean} freeShippingEligible - From shipping analysis
 * @returns {boolean} True if free shipping is available
 */
export const hasFreeShipping = (shippingMethods, freeShippingEligible) => {
  if (freeShippingEligible) return true;
  
  return shippingMethods.some(method => 
    method.id === 'free' || 
    method.name.toLowerCase().includes('free') ||
    parseFloat(method.calculated_price || method.base_price) === 0
  );
};

/**
 * Get the free shipping method from available methods
 * @param {Array} shippingMethods - Available shipping methods
 * @returns {Object|null} Free shipping method or null
 */
export const getFreeShippingMethod = (shippingMethods) => {
  return shippingMethods.find(method => 
    method.id === 'free' || 
    method.name.toLowerCase().includes('free') ||
    parseFloat(method.calculated_price || method.base_price) === 0
  ) || null;
};

/**
 * Calculate shipping cost for selected method
 * @param {Array} shippingMethods - Available shipping methods
 * @param {string} selectedMethodId - Selected shipping method ID
 * @returns {number} Shipping cost
 */
export const calculateShippingCost = (shippingMethods, selectedMethodId) => {
  if (!selectedMethodId) return 0;
  
  const method = shippingMethods.find(m => m.id.toString() === selectedMethodId.toString());
  if (!method) return 0;
  
  return parseFloat(method.calculated_price || method.base_price || 0);
};

/**
 * Format shipping method for display
 * @param {Object} method - Shipping method object
 * @param {Object} cartAnalysis - Cart analysis with weight/quantity info  
 * @returns {Object} Formatted method
 */
export const formatShippingMethod = (method, cartAnalysis = null) => {
  const price = parseFloat(method.calculated_price || method.base_price || method.price || 0);
  const isFree = price === 0 || method.id === 'free';
  
  // Build detailed pricing explanation based on method configuration
  let pricingExplanation = '';
  let pricingType = method.preferred_pricing_type || 'quantity';
  let tierDetails = null;
  
  // Add weight/quantity context and tier information if available
  if (cartAnalysis) {
    if (pricingType === 'weight' && cartAnalysis.total_weight) {
      const weight = parseFloat(cartAnalysis.total_weight);
      
      // Find applicable weight tier
      const weightTiers = method.weight_tiers || [];
      const applicableTier = weightTiers.find(tier => 
        tier.min_weight <= weight && (!tier.max_weight || tier.max_weight >= weight)
      );
      
      if (applicableTier) {
        tierDetails = applicableTier;
        if (applicableTier.has_incremental_pricing) {
          pricingExplanation = `Weight-based: ${weight.toFixed(2)}kg (${applicableTier.base_price} BDT + increments)`;
        } else {
          pricingExplanation = `Weight-based: ${weight.toFixed(2)}kg (fixed ${applicableTier.base_price} BDT)`;
        }
      } else {
        pricingExplanation = `Weight-based pricing (${weight.toFixed(2)} kg)`;
      }
    } else if (pricingType === 'quantity' && cartAnalysis.total_quantity) {
      const quantity = parseInt(cartAnalysis.total_quantity);
      
      // Find applicable quantity tier
      const quantityTiers = method.quantity_tiers || [];
      const applicableTier = quantityTiers.find(tier => 
        tier.min_quantity <= quantity && (!tier.max_quantity || tier.max_quantity >= quantity)
      );
      
      if (applicableTier) {
        tierDetails = applicableTier;
        if (applicableTier.has_incremental_pricing) {
          pricingExplanation = `Quantity-based: ${quantity} items (${applicableTier.base_price} BDT + increments)`;
        } else {
          pricingExplanation = `Quantity-based: ${quantity} items (fixed ${applicableTier.base_price} BDT)`;
        }
      } else {
        pricingExplanation = `Quantity-based pricing (${quantity} items)`;
      }
    }
  }
  
  return {
    ...method,
    displayPrice: isFree ? 'Free' : price.toFixed(2),
    displayPriceWithIcon: isFree ? 'Free' : `BDT${price.toFixed(2)}`,
    numericPrice: price,
    isFree,
    isPriceTiered: method.tier_applied || (method.calculated_price !== method.base_price),
    pricingExplanation,
    pricingType,
    tierDetails,
    isDynamic: Boolean(tierDetails?.has_incremental_pricing),
    // Add tier information for display
    tierInfo: method.applied_tier || null
  };
};

/**
 * Get shipping recommendations and warnings
 * @param {Object} shippingAnalysis - Shipping analysis from API
 * @param {Array} cartItems - Cart items
 * @returns {Object} Recommendations and warnings
 */
export const getShippingRecommendations = (shippingAnalysis, cartItems) => {
  const recommendations = {
    warnings: [],
    suggestions: [],
    savings: []
  };

  // Split shipping warning
  if (shippingAnalysis.requires_split_shipping) {
    recommendations.warnings.push({
      type: 'split_shipping',
      title: 'Split Shipping Required',
      message: 'Items in your cart require different shipping methods. Your order may be shipped separately.',
      icon: '📦'
    });
  }

  // Free shipping suggestions
  if (!shippingAnalysis.free_shipping_eligible && shippingAnalysis.qualifying_free_rule) {
    const cartTotal = calculateCartTotal(cartItems);
    const threshold = parseFloat(shippingAnalysis.qualifying_free_rule.threshold_amount);
    const needed = threshold - cartTotal;
    
    if (needed > 0) {
      recommendations.suggestions.push({
        type: 'free_shipping',
        title: 'Free Shipping Available',
        message: `Add $${needed.toFixed(2)} more to qualify for free shipping!`,
        icon: '🚚',
        actionNeeded: needed
      });
    }
  }

  // Method availability
  if (shippingAnalysis.available_methods_count === 0) {
    recommendations.warnings.push({
      type: 'no_shipping',
      title: 'No Shipping Methods Available',
      message: 'Please contact support for shipping options.',
      icon: '⚠️'
    });
  }

  return recommendations;
};

/**
 * Generate Alpine.js data for dynamic cart UI
 * @param {Array} initialCartItems - Initial cart items
 * @returns {Object} Alpine.js data object
 */
export const createCartAlpineData = (initialCartItems = []) => {
  return {
    cartItems: initialCartItems,
    shippingAnalysis: null,
    cartAnalysis: null,
    availableShippingMethods: [],
    selectedShippingMethod: null,
    loading: false,
    error: null,
    recommendations: {
      warnings: [],
      suggestions: [],
      savings: []
    },
    
    // Computed properties
    get cartSubtotal() {
      return calculateCartTotal(this.cartItems);
    },
    
    get cartQuantity() {
      return calculateCartQuantity(this.cartItems);
    },
    
    get cartWeight() {
      return calculateCartWeight(this.cartItems);
    },
    
    get shippingCost() {
      return calculateShippingCost(this.availableShippingMethods, this.selectedShippingMethod);
    },
    
    get cartTotal() {
      return this.cartSubtotal + this.shippingCost;
    },
    
    get hasFreeShipping() {
      return hasFreeShipping(this.availableShippingMethods, this.shippingAnalysis?.free_shipping_eligible);
    },
    
    get formattedShippingMethods() {
      return this.availableShippingMethods.map(method => 
        formatShippingMethod(method, this.cartAnalysis)
      );
    },

    // Methods
    async analyzeShipping() {
      this.loading = true;
      this.error = null;
      
      try {
        const analysis = await analyzeCartShippingRequirements(this.cartItems);
        
        if (analysis.success) {
          this.shippingAnalysis = analysis.shipping_analysis;
          this.cartAnalysis = analysis.cart_analysis;
          this.availableShippingMethods = analysis.shipping_analysis.available_methods;
          
          // Auto-select free shipping if available
          if (analysis.shipping_analysis.free_shipping_eligible) {
            const freeMethod = getFreeShippingMethod(this.availableShippingMethods);
            if (freeMethod) {
              this.selectedShippingMethod = freeMethod.id;
            }
          } else if (this.availableShippingMethods.length > 0) {
            // Select first available method
            this.selectedShippingMethod = this.availableShippingMethods[0].id;
          }
          
          // Update recommendations
          this.recommendations = getShippingRecommendations(this.shippingAnalysis, this.cartItems);
        } else {
          this.error = analysis.error || 'Failed to analyze shipping options';
          if (analysis.fallback) {
            this.availableShippingMethods = analysis.fallback.shipping_analysis.available_methods;
            this.selectedShippingMethod = this.availableShippingMethods[0]?.id || null;
          }
        }
      } catch (error) {
        console.error('Shipping analysis error:', error);
        this.error = 'Unable to load shipping options. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    updateQuantity(variantId, newQuantity) {
      const item = this.cartItems.find(item => item.variantId === variantId);
      if (item) {
        item.quantity = Math.max(1, parseInt(newQuantity));
        this.saveCart();
        this.analyzeShipping(); // Re-analyze shipping when quantity changes
      }
    },

    removeItem(variantId) {
      this.cartItems = this.cartItems.filter(item => item.variantId !== variantId);
      this.saveCart();
      this.analyzeShipping(); // Re-analyze shipping when items change
    },

    selectShippingMethod(methodId) {
      this.selectedShippingMethod = methodId;
    },

    saveCart() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
      }
    },

    init() {
      // Auto-analyze shipping when component initializes
      if (this.cartItems.length > 0) {
        this.analyzeShipping();
      }
    }
  };
};

export default {
  calculateCartTotal,
  calculateCartQuantity,
  analyzeCartShippingRequirements,
  hasFreeShipping,
  getFreeShippingMethod,
  calculateShippingCost,
  formatShippingMethod,
  getShippingRecommendations,
  createCartAlpineData
};
