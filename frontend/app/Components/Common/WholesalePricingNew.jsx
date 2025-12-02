"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import Tk_icon from "./Tk_icon";
import { FaCheckCircle, FaTimesCircle, FaBolt, FaBox, FaStore } from 'react-icons/fa';

/**
 * Centralized wholesale pricing utility that handles all pricing logic
 * Based on user requirements:
 * - WHOLESALER users see only wholesale_price as primary, regular price as small label
 * - CUSTOMER users see regular price + discount_price, no wholesale info
 * - If no wholesale_price for WHOLESALER, show "Not available for wholesale" badge
 */

export const useWholesalePricingLogic = (product, options = {}) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    hideUnavailableOnUnauthenticated = true, // Don't show "not available" if data might be incomplete
    forceShowUnavailable = false, // Force show unavailable message regardless
    showOnlyPrimaryPrice = false // New option: show only primary price (for clean wholesaler display)
  } = options;
  
  // Get user context from product data (added by backend serializer)
  const userContext = product?._user_context || {};
  const isWholesaler = isAuthenticated && user?.user_type === 'WHOLESALER';
  const isApprovedWholesaler = userContext.is_approved_wholesaler || false;
  const wholesalerStatus = userContext.wholesaler_status || null;
  const isCustomer = !isAuthenticated || user?.user_type === 'CUSTOMER' || user?.user_type !== 'WHOLESALER';
  
  // Parse pricing data with proper null/undefined handling and validation
  const wholesalePrice = product?.wholesale_price && !isNaN(parseFloat(product.wholesale_price)) ? parseFloat(product.wholesale_price) : 0;
  const regularPrice = product?.price && !isNaN(parseFloat(product.price)) ? parseFloat(product.price) : 0;
  const discountPrice = product?.discount_price && !isNaN(parseFloat(product.discount_price)) ? parseFloat(product.discount_price) : 0;
  const minimumPurchase = product?.minimum_purchase && !isNaN(parseInt(product.minimum_purchase)) ? parseInt(product.minimum_purchase) : 1;
  
  // Debug logging for wholesaler users
  if (isWholesaler) {
    console.log('WHOLESALER pricing debug:', {
      user_type: user?.user_type,
      wholesale_price_raw: product?.wholesale_price,
      wholesale_price_parsed: wholesalePrice,
      regular_price: regularPrice,
      discount_price: discountPrice,
      minimum_purchase_raw: product?.minimum_purchase,
      minimum_purchase_parsed: minimumPurchase,
      has_valid_wholesale: wholesalePrice > 0
    });
  }
  
  let displayPrice, secondaryPrice, secondaryLabel, showWholesaleUnavailable;
  
  // Your exact conditions:
  // 1. user_type = WHOLESALER and status=APPROVED and wholesale_price!=none or wholesale_price >= 1
  // 2. user_type = WHOLESALER and status=APPROVED and wholesale_price=none or wholesale_price < 1  
  // 3. user_type = WHOLESALER and status=PENDING
  // 4. Regular customers
  
  if (isApprovedWholesaler) {
    // CONDITION 1 & 2: Approved wholesaler
    const hasValidWholesalePrice = product?.wholesale_price !== null && 
                                  product?.wholesale_price !== undefined && 
                                  wholesalePrice >= 1;
    
    if (hasValidWholesalePrice) {
      // CONDITION 1: wholesale_price >= 1 -> show wholesale_price + regular price + "Available for Wholesale" badge
      displayPrice = wholesalePrice;
      secondaryPrice = showOnlyPrimaryPrice ? 0 : regularPrice;
      secondaryLabel = showOnlyPrimaryPrice ? null : "Regular Price";
      showWholesaleUnavailable = false;
    } else {
      // CONDITION 2: wholesale_price = none or < 1 -> show regular price + discount_price + "Not Available for Wholesale" badge
      displayPrice = discountPrice || regularPrice;
      secondaryPrice = showOnlyPrimaryPrice ? 0 : (discountPrice ? regularPrice : 0);
      secondaryLabel = showOnlyPrimaryPrice ? null : (discountPrice ? "Original Price" : null);
      showWholesaleUnavailable = true;
    }
  } else {
    // CONDITION 3 & 4: Pending wholesaler or regular customer -> show regular pricing
    displayPrice = discountPrice || regularPrice;
    secondaryPrice = showOnlyPrimaryPrice ? 0 : (discountPrice ? regularPrice : 0);
    secondaryLabel = showOnlyPrimaryPrice ? null : (discountPrice ? "Original Price" : null);
    showWholesaleUnavailable = false; // No wholesale badges for non-approved users
  }
  
  return {
    isWholesaler,
    isApprovedWholesaler,
    wholesalerStatus,
    isCustomer,
    displayPrice,
    secondaryPrice,
    secondaryLabel,
    showWholesaleUnavailable,
    wholesalePrice,
    regularPrice,
    discountPrice,
    minimumPurchase,
    hasWholesalePrice: wholesalePrice >= 1,
    isUsingWholesalePrice: isApprovedWholesaler && wholesalePrice >= 1
  };
};

/**
 * Reusable pricing display component
 */
export const WholesalePricingDisplay = ({ 
  product, 
  size = "medium", 
  showLabels = true,
  className = "",
  hideUnavailableOnUnauthenticated = true, // Default to hiding unavailable message on potentially unauthenticated requests
  forceShowUnavailable = false,
  showOnlyPrimaryPrice = false // New option: show only primary price for clean display
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Use explicit showOnlyPrimaryPrice parameter, don't auto-determine
  const {
    isWholesaler,
    isApprovedWholesaler,
    isCustomer,
    displayPrice,
    secondaryPrice,
    secondaryLabel,
    showWholesaleUnavailable,
    isUsingWholesalePrice,
    wholesalePrice,
    regularPrice,
    minimumPurchase
  } = useWholesalePricingLogic(product, {
    hideUnavailableOnUnauthenticated,
    forceShowUnavailable,
    showOnlyPrimaryPrice // Use the explicit parameter passed
  });
  
  // Size configurations
  const sizeConfig = {
    small: {
      primaryText: "text-base font-semibold",
      secondaryText: "text-xs",
      iconSize: 14,
      badgeText: "text-xs px-1 py-0.5",
      gap: "gap-1"
    },
    medium: {
      primaryText: "text-lg font-bold",
      secondaryText: "text-sm",
      iconSize: 16,
      badgeText: "text-xs px-1.5 py-0.5",
      gap: "gap-2"
    },
    large: {
      primaryText: "text-3xl font-bold",
      secondaryText: "text-base",
      iconSize: 24,
      badgeText: "text-sm px-2 py-1",
      gap: "gap-3"
    }
  }[size];
  
  return (
    <div className={`flex flex-col ${sizeConfig.gap} ${className}`}>
      {/* Primary price with wholesale badge */}
      <div className={`flex items-baseline ${sizeConfig.gap} flex-wrap`}>
        <span className={`${sizeConfig.primaryText} ${isUsingWholesalePrice ? 'text-[var(--primary)]' : 'text-[var(--primary)]'} flex items-baseline gap-1`}>
          <Tk_icon size={sizeConfig.iconSize} className={isUsingWholesalePrice ? 'text-[var(--primary)]' : 'text-[var(--primary)]'} />
          {displayPrice.toFixed(2)}
        </span>
        
        {/* Show wholesale available badge when using wholesale price */}
        {isUsingWholesalePrice && showLabels && (
          <span className={`bg-[var(--primary)]/10 text-[var(--primary)] rounded font-medium ${sizeConfig.badgeText} flex items-center gap-1`}>
            <FaCheckCircle className="text-[#16a34a]" size={12} />
            Wholesale Available
          </span>
        )}
        
        {/* Show "not available" badge when approved wholesaler but no wholesale price for this product */}
        {showWholesaleUnavailable && showLabels && (
          <span className={`bg-red-500/10 text-red-500 rounded font-medium ${sizeConfig.badgeText} flex items-center gap-1`}>
            <FaTimesCircle className="text-red-500" size={12} />
            Wholesale Not Available
          </span>
        )}
      </div>
      
      {/* Secondary price (small label) - show regular price for wholesalers when wholesale is available */}
      {secondaryPrice > 0 && secondaryLabel && showLabels && (
        <div className="flex items-center gap-1">
          <span className={`text-[var(--muted-foreground)] ${sizeConfig.secondaryText}`}>
            {secondaryLabel}:
          </span>
          <span className={`${sizeConfig.secondaryText} flex items-baseline gap-1 ${
            isUsingWholesalePrice ? 'text-[var(--muted-foreground)] line-through' : 'text-[var(--muted-foreground)] line-through'
          }`}>
            <Tk_icon size={sizeConfig.iconSize - 2} className="text-[var(--muted-foreground)]" />
            {secondaryPrice.toFixed(2)}
          </span>
        </div>
      )}
      
      {/* Show savings info for wholesalers - REMOVED as per user request */}
      
      {/* Show minimum purchase requirement for wholesalers */}
      {isUsingWholesalePrice && minimumPurchase > 1 && showLabels && (
        <div className="flex items-center gap-1">
          <span className={`text-orange-500 ${sizeConfig.secondaryText} font-medium flex items-center gap-1`}>
            <FaBox className="text-orange-500" size={12} />
            Minimum Order: {minimumPurchase} units
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Badge component for product cards
 */
export const WholesalePricingBadge = ({ 
  product, 
  hideUnavailableOnUnauthenticated = true,
  forceShowUnavailable = false 
}) => {
  const {
    isWholesaler,
    isApprovedWholesaler,
    isCustomer,
    showWholesaleUnavailable,
    isUsingWholesalePrice,
    regularPrice,
    discountPrice,
    displayPrice,
    wholesalePrice
  } = useWholesalePricingLogic(product, {
    hideUnavailableOnUnauthenticated,
    forceShowUnavailable
  });
  
  // Calculate discount for customer users
  const regularDiscount = isCustomer && discountPrice && regularPrice > discountPrice 
    ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100) 
    : 0;
  
  // Calculate wholesale savings for wholesaler users
  const wholesaleSavings = isUsingWholesalePrice && regularPrice > wholesalePrice
    ? Math.round(((regularPrice - wholesalePrice) / regularPrice) * 100)
    : 0;
  
  return (
    <div className="flex flex-col gap-1">
      {/* Wholesale discount percentage for approved wholesaler users */}
      {isApprovedWholesaler && wholesaleSavings > 0 && (
        <div className="bg-[var(--primary)] text-white text-xs font-bold px-2 py-1 rounded-full">
          -{wholesaleSavings}%
        </div>
      )}
      
      {/* Regular discount percentage for customer users */}
      {isCustomer && regularDiscount > 0 && (
        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{regularDiscount}%
        </div>
      )}
      
      {/* No badge for products without discounts */}
    </div>
  );
};

/**
 * Get cart pricing for wholesale users
 */
export const getCartPrice = (product, user) => {
  // Check if user is approved wholesaler (wholesale_price data available means approved)
  const isWholesaler = user?.user_type === 'WHOLESALER';
  const isApprovedWholesaler = isWholesaler && (product?.wholesale_price !== null && product?.wholesale_price !== undefined);
  const wholesalePrice = product?.wholesale_price && !isNaN(parseFloat(product.wholesale_price)) ? parseFloat(product.wholesale_price) : 0;
  const regularPrice = product?.price && !isNaN(parseFloat(product.price)) ? parseFloat(product.price) : 0;
  const discountPrice = product?.discount_price && !isNaN(parseFloat(product.discount_price)) ? parseFloat(product.discount_price) : 0;
  const minimumPurchase = product?.minimum_purchase && !isNaN(parseInt(product.minimum_purchase)) ? parseInt(product.minimum_purchase) : 1;
  
  console.log('getCartPrice debug:', {
    user_type: user?.user_type,
    isWholesaler,
    isApprovedWholesaler,
    wholesalePrice,
    regularPrice,
    discountPrice,
    minimumPurchase,
    product_wholesale_raw: product?.wholesale_price
  });
  
  // Only use wholesale pricing for approved wholesalers with valid wholesale price
  if (isApprovedWholesaler && wholesalePrice > 0) {
    return {
      price: wholesalePrice,
      label: "Wholesale Price",
      isWholesale: true,
      minimumPurchase: minimumPurchase
    };
  } else {
    return {
      price: discountPrice || regularPrice,
      label: discountPrice ? "Discounted Price" : "Regular Price",
      isWholesale: false,
      minimumPurchase: 1 // Regular customers can buy 1 quantity
    };
  }
};

/**
 * Validate minimum purchase requirement for wholesale orders
 */
export const validateMinimumPurchase = (product, quantity, user) => {
  // Check if user is approved wholesaler (wholesale_price data available means approved)
  const isWholesaler = user?.user_type === 'WHOLESALER';
  const isApprovedWholesaler = isWholesaler && (product?.wholesale_price !== null && product?.wholesale_price !== undefined);
  const wholesalePrice = product?.wholesale_price && !isNaN(parseFloat(product.wholesale_price)) ? parseFloat(product.wholesale_price) : 0;
  const minimumPurchase = product?.minimum_purchase && !isNaN(parseInt(product.minimum_purchase)) ? parseInt(product.minimum_purchase) : 1;
  
  // If user is approved wholesaler and product has wholesale pricing
  if (isApprovedWholesaler && wholesalePrice > 0) {
    const isValid = quantity >= minimumPurchase;
    return {
      isValid,
      minimumRequired: minimumPurchase,
      currentQuantity: quantity,
      shortage: isValid ? 0 : minimumPurchase - quantity,
      message: isValid 
        ? `Minimum order requirement met (${minimumPurchase} units)`
        : `Minimum ${minimumPurchase} units required. Add ${minimumPurchase - quantity} more.`
    };
  }
  
  // For regular customers, no minimum requirement
  return {
    isValid: true,
    minimumRequired: 1,
    currentQuantity: quantity,
    shortage: 0,
    message: "No minimum order requirement"
  };
};

/**
 * Get wholesale pricing info for cart display
 */
export const getWholesalePricingInfo = (product, user) => {
  const { 
    isWholesaler, 
    isUsingWholesalePrice, 
    minimumPurchase,
    wholesalePrice,
    regularPrice 
  } = useWholesalePricingLogic(product);
  
  return {
    isWholesaler,
    isUsingWholesalePrice,
    minimumPurchase,
    wholesalePrice,
    regularPrice,
    canUseWholesalePrice: isWholesaler && wholesalePrice > 0
  };
};

export default WholesalePricingDisplay;