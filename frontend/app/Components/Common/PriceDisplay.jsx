"use client";

import React, { memo } from "react";
import Tk_icon from "./Tk_icon";

/**
 * Optimized Price Display Component with BDT Currency
 * Memoized for better performance
 */
const PriceDisplay = memo(({ 
  price, 
  className = "", 
  iconSize = 14,
  iconClassName = "",
  showDecimals = true,
  as = "span"
}) => {
  const Component = as;
  const formattedPrice = showDecimals 
    ? parseFloat(price || 0).toFixed(2)
    : Math.round(parseFloat(price || 0));

  return (
    <Component className={`inline-flex items-center gap-1 ${className}`}>
      <Tk_icon size={iconSize} className={iconClassName} />
      <span>{formattedPrice}</span>
    </Component>
  );
});

PriceDisplay.displayName = "PriceDisplay";

/**
 * Wholesaler Price Display Component
 * Shows both retail and wholesale prices with highlights
 */
export const WholesalerPriceDisplay = memo(({
  retailPrice,
  wholesalePrice,
  minimumPurchase = 1,
  size = "md",
  className = ""
}) => {
  const hasValidWholesalePrice = wholesalePrice && parseFloat(wholesalePrice) > 0;
  
  const sizeConfig = {
    sm: { icon: 12, text: "text-sm", badge: "text-[8px]" },
    md: { icon: 14, text: "text-base", badge: "text-[9px]" },
    lg: { icon: 16, text: "text-lg", badge: "text-[10px]" }
  };
  
  const config = sizeConfig[size] || sizeConfig.md;

  if (!hasValidWholesalePrice) {
    return (
      <div className={className}>
        <div className={`${config.badge} font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1`}>
          Wholesale Not Available
        </div>
        <PriceDisplay 
          price={retailPrice} 
          iconSize={config.icon}
          className={`${config.text} font-bold text-[var(--color-text-primary)]`}
        />
      </div>
    );
  }

  const savings = retailPrice && parseFloat(retailPrice) > parseFloat(wholesalePrice)
    ? Math.round(((parseFloat(retailPrice) - parseFloat(wholesalePrice)) / parseFloat(retailPrice)) * 100)
    : 0;

  return (
    <div className={className}>
      {/* Minimum Quantity Badge */}
      <div className={`${config.badge} font-bold uppercase tracking-wider text-[var(--color-accent-orange)] mb-1`}>
        Min: {minimumPurchase} pcs
      </div>
      
      {/* Wholesale Price */}
      <PriceDisplay 
        price={wholesalePrice}
        iconSize={config.icon}
        iconClassName="text-blue-600 dark:text-blue-400"
        className={`${config.text} font-bold text-blue-600 dark:text-blue-400 mb-1`}
      />
      <span className={`${config.badge} text-blue-600 dark:text-blue-400 ml-1 font-semibold`}>WSL</span>
      
      {/* Retail Price & Savings */}
      <div className="flex items-center gap-2 mt-1">
        {retailPrice && (
          <PriceDisplay 
            price={retailPrice}
            iconSize={10}
            iconClassName="text-gray-400"
            className="text-xs text-gray-400 line-through"
          />
        )}
        {savings > 0 && (
          <span className={`${config.badge} font-bold text-green-600 dark:text-green-400`}>
            Save {savings}%
          </span>
        )}
      </div>
    </div>
  );
});

WholesalerPriceDisplay.displayName = "WholesalerPriceDisplay";

/**
 * Regular Customer Price Display Component
 * Shows sale price and regular price with savings
 */
export const RegularPriceDisplay = memo(({
  price,
  discountPrice,
  size = "md",
  className = ""
}) => {
  const sizeConfig = {
    sm: { icon: 12, text: "text-sm", badge: "text-[8px]" },
    md: { icon: 14, text: "text-base", badge: "text-[9px]" },
    lg: { icon: 16, text: "text-lg", badge: "text-[10px]" }
  };
  
  const config = sizeConfig[size] || sizeConfig.md;
  const displayPrice = discountPrice || price;
  const hasDiscount = discountPrice && parseFloat(price) > parseFloat(discountPrice);
  const savings = hasDiscount
    ? Math.round(((parseFloat(price) - parseFloat(discountPrice)) / parseFloat(price)) * 100)
    : 0;

  return (
    <div className={className}>
      {/* Main Price */}
      <PriceDisplay 
        price={displayPrice}
        iconSize={config.icon}
        className={`${config.text} font-bold text-[var(--color-text-primary)] mb-1`}
      />
      
      {/* Original Price & Savings */}
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <PriceDisplay 
            price={price}
            iconSize={10}
            iconClassName="text-gray-400"
            className="text-xs text-gray-400 line-through"
          />
          {savings > 0 && (
            <span className={`${config.badge} font-bold text-green-600 dark:text-green-400`}>
              Save {savings}%
            </span>
          )}
        </div>
      )}
    </div>
  );
});

RegularPriceDisplay.displayName = "RegularPriceDisplay";

export default PriceDisplay;
