"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import Tk_icon from "./Tk_icon";

/**
 * Reusable component for displaying wholesale vs regular pricing
 * Provides consistent pricing logic and display across the application
 */
export const WholesalePricing = ({ product, size = "medium", showBadge = true, showSavings = true }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if the current user is an approved wholesaler
  const isApprovedWholesaler = isAuthenticated && user?.user_type === 'WHOLESALER';
  
  // Parse pricing data
  const wholesalePrice = parseFloat(product?.wholesale_price || 0);
  const regularPrice = parseFloat(product?.price || 0);
  const discountPrice = parseFloat(product?.discount_price || 0);
  
  // Pricing logic based on user type
  let displayPrice, originalPrice, showWholesaleLabel, wholesaleSavings;
  
  if (isApprovedWholesaler && wholesalePrice > 0) {
    displayPrice = wholesalePrice;
    originalPrice = regularPrice;
    showWholesaleLabel = true;
    wholesaleSavings = originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  } else {
    displayPrice = discountPrice || regularPrice;
    originalPrice = discountPrice ? regularPrice : 0;
    showWholesaleLabel = false;
    wholesaleSavings = 0;
  }
  
  const discount = !showWholesaleLabel && originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  
  // Size-based styling
  const sizes = {
    small: {
      primaryText: "text-lg",
      secondaryText: "text-sm",
      iconSize: 16,
      badgeText: "text-xs",
      badgePadding: "px-1.5 py-0.5"
    },
    medium: {
      primaryText: "text-2xl",
      secondaryText: "text-base",
      iconSize: 20,
      badgeText: "text-sm",
      badgePadding: "px-2 py-1"
    },
    large: {
      primaryText: "text-4xl",
      secondaryText: "text-xl",
      iconSize: 28,
      badgeText: "text-base",
      badgePadding: "px-3 py-1.5"
    }
  };
  
  const sizeConfig = sizes[size] || sizes.medium;
  
  return (
    <div className="flex flex-col gap-2">
      {/* Primary price display */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className={`${sizeConfig.primaryText} font-bold text-[var(--primary)] flex items-baseline gap-1`}>
          <Tk_icon size={sizeConfig.iconSize} className="text-[var(--primary)]" />
          {displayPrice.toFixed(2)}
        </span>
        {showBadge && showWholesaleLabel && (
          <span className={`bg-[var(--primary)]/10 text-[var(--primary)] rounded ${sizeConfig.badgeText} ${sizeConfig.badgePadding} font-medium`}>
            🏪 Wholesale
          </span>
        )}
      </div>
      
      {/* Secondary price and savings */}
      {originalPrice > 0 && (
        <div className="flex flex-col gap-1">
          {showWholesaleLabel ? (
            // Wholesaler pricing display
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-sm text-[var(--muted-foreground)]">Regular:</span>
                <span className={`${sizeConfig.secondaryText} flex items-baseline gap-1 text-[var(--muted-foreground)] line-through`}>
                  <Tk_icon size={sizeConfig.iconSize - 4} className="text-[var(--muted-foreground)]" />
                  {originalPrice.toFixed(2)}
                </span>
              </div>
              {showSavings && wholesaleSavings > 0 && (
                <span className={`${sizeConfig.badgeText} text-[#16a34a] font-medium bg-[#16a34a]/10 px-2 py-0.5 rounded`}>
                  Save {wholesaleSavings}%
                </span>
              )}
            </div>
          ) : (
            // Regular discount display
            <span className={`${sizeConfig.secondaryText} flex items-baseline gap-1 text-[var(--muted-foreground)] line-through`}>
              <Tk_icon size={sizeConfig.iconSize - 4} className="text-[var(--muted-foreground)]" />
              {originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Component for displaying discount badges
 */
export const PricingBadges = ({ product }) => {
  const { user, isAuthenticated } = useAuth();
  const isApprovedWholesaler = isAuthenticated && user?.user_type === 'WHOLESALER';
  
  const wholesalePrice = parseFloat(product?.wholesale_price || 0);
  const regularPrice = parseFloat(product?.price || 0);
  const discountPrice = parseFloat(product?.discount_price || 0);
  
  let wholesaleSavings = 0;
  let discount = 0;
  
  if (isApprovedWholesaler && wholesalePrice > 0) {
    wholesaleSavings = regularPrice > wholesalePrice ? Math.round(((regularPrice - wholesalePrice) / regularPrice) * 100) : 0;
  } else {
    discount = discountPrice && regularPrice > discountPrice ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100) : 0;
  }
  
  return (
    <div className="flex flex-col gap-1">
      {wholesaleSavings > 0 && (
        <div className="bg-[var(--primary)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          -{wholesaleSavings}% Wholesale
        </div>
      )}
      {discount > 0 && !isApprovedWholesaler && (
        <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          -{discount}%
        </div>
      )}
    </div>
  );
};

/**
 * Hook for getting pricing logic
 */
export const usePricingLogic = (product) => {
  const { user, isAuthenticated } = useAuth();
  const isApprovedWholesaler = isAuthenticated && user?.user_type === 'WHOLESALER';
  
  const wholesalePrice = parseFloat(product?.wholesale_price || 0);
  const regularPrice = parseFloat(product?.price || 0);
  const discountPrice = parseFloat(product?.discount_price || 0);
  
  let displayPrice, originalPrice, showWholesaleLabel, wholesaleSavings, discount;
  
  if (isApprovedWholesaler && wholesalePrice > 0) {
    displayPrice = wholesalePrice;
    originalPrice = regularPrice;
    showWholesaleLabel = true;
    wholesaleSavings = originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
    discount = 0;
  } else {
    displayPrice = discountPrice || regularPrice;
    originalPrice = discountPrice ? regularPrice : 0;
    showWholesaleLabel = false;
    wholesaleSavings = 0;
    discount = originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  }
  
  return {
    displayPrice,
    originalPrice,
    showWholesaleLabel,
    wholesaleSavings,
    discount,
    isApprovedWholesaler,
    wholesalePrice,
    regularPrice,
    discountPrice
  };
};

export default WholesalePricing;