// Enhanced Currency utilities with SVG Taka icon support
// Version: 4.0 - No currency conversion, direct BDT display with SVG icon

import React from 'react';
import Tk_icon from '../Components/Common/Tk_icon';

/**
 * BDT Currency Configuration
 * No conversion needed - prices are already in BDT
 */
export const BDT_CONFIG = {
  code: 'BDT',
  name: 'Bangladeshi Taka',
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
  spaceAfterSymbol: false
};

/**
 * Format amount as number with proper separators (no symbol)
 * @param {number|string} amount - Amount to format (already in BDT)
 * @returns {string} Formatted number string
 */
export const formatBDTNumber = (amount) => {
  const bdtAmount = parseFloat(amount) || 0;
  
  // Format with thousands separator and decimal places
  return bdtAmount.toLocaleString('en-US', {
    minimumFractionDigits: BDT_CONFIG.decimalPlaces,
    maximumFractionDigits: BDT_CONFIG.decimalPlaces
  });
};

/**
 * Format amount as BDT currency with SVG icon (React component)
 * @param {number|string} amount - Amount to format (already in BDT)
 * @param {boolean} showIcon - Whether to show currency icon
 * @param {object} options - Additional styling options
 * @returns {React.Component} JSX component with Taka icon and amount
 */
export const formatBDTWithIcon = (
  amount, 
  showIcon = true, 
  options = {}
) => {
  const {
    iconSize = 16,
    iconColor = 'currentColor',
    className = '',
    iconClassName = '',
    amountClassName = '',
    gap = '4px'
  } = options;
  
  const formattedAmount = formatBDTNumber(amount);
  
  if (!showIcon) {
    return <span className={amountClassName}>{formattedAmount}</span>;
  }
  
  return (
    <span 
      className={`inline-flex items-center ${className}`}
      style={{ gap }}
    >
      <Tk_icon 
        size={iconSize} 
        color={iconColor}
        className={iconClassName}
      />
      <span className={amountClassName}>{formattedAmount}</span>
    </span>
  );
};

/**
 * Legacy function for backward compatibility (returns string with ৳)
 * @param {number|string} amount - Amount to format (already in BDT)
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted currency string
 */
export const formatBDT = (amount, showSymbol = true) => {
  const formattedAmount = formatBDTNumber(amount);
  return showSymbol ? `৳${formattedAmount}` : formattedAmount;
};

/**
 * Format price range with SVG icons
 * @param {number} minPrice - Minimum price (already in BDT)
 * @param {number} maxPrice - Maximum price (already in BDT)
 * @param {object} options - Styling options
 * @returns {React.Component} JSX component with price range
 */
export const formatBDTPriceRangeWithIcon = (minPrice, maxPrice, options = {}) => {
  const config = {
    iconSize: 14,
    className: '',
    ...options
  };
  
  if (minPrice === maxPrice) {
    return formatBDTWithIcon(minPrice, true, config);
  }
  
  return (
    <span className={`flex items-center gap-2 ${config.className}`}>
      {formatBDTWithIcon(minPrice, true, config)}
      <span>-</span>
      {formatBDTWithIcon(maxPrice, true, config)}
    </span>
  );
};

/**
 * Format discount with SVG icon and minus sign
 * @param {number} discount - Discount amount (already in BDT)
 * @param {object} options - Styling options
 * @returns {React.Component} JSX component with discount
 */
export const formatDiscountWithIcon = (discount, options = {}) => {
  const config = {
    iconSize: 14,
    className: 'text-red-500',
    ...options
  };
  
  if (discount <= 0) {
    return formatBDTWithIcon(0, true, config);
  }
  
  return (
    <span className={`inline-flex items-center gap-1 ${config.className}`}>
      <span>-</span>
      {formatBDTWithIcon(discount, true, config)}
    </span>
  );
};

/**
 * Format shipping cost with SVG icon
 * @param {number} cost - Shipping cost (already in BDT)
 * @param {boolean} isFree - Whether shipping is free
 * @param {object} options - Styling options
 * @returns {React.Component|string} JSX component or "Free" string
 */
export const formatShippingWithIcon = (cost, isFree = false, options = {}) => {
  if (isFree || cost === 0) {
    return <span className="text-green-600 font-medium">Free</span>;
  }
  
  const config = {
    iconSize: 14,
    className: '',
    ...options
  };
  
  return formatBDTWithIcon(cost, true, config);
};

/**
 * Product card price component with original price strikethrough
 * @param {number} price - Current price (already in BDT)
 * @param {number} originalPrice - Original price for comparison (already in BDT)
 * @param {object} options - Styling options
 * @returns {React.Component} JSX component with styled prices
 */
export const ProductPrice = ({ price, originalPrice, options = {} }) => {
  const config = {
    iconSize: 16,
    className: '',
    ...options
  };
  
  return (
    <div className={`flex items-center gap-2 ${config.className}`}>
      {formatBDTWithIcon(price, true, {
        ...config,
        className: `${config.className} text-primary font-semibold`
      })}
      {originalPrice && originalPrice > price && (
        <span className="line-through text-muted-foreground">
          {formatBDTWithIcon(originalPrice, true, {
            iconSize: config.iconSize - 2,
            className: 'text-sm text-muted-foreground'
          })}
        </span>
      )}
    </div>
  );
};

// Cart total formatting
export const CartTotal = ({ amount, className = '' }) => 
  formatBDTWithIcon(amount, true, {
    iconSize: 20,
    className: `text-xl font-bold ${className}`
  });

// Compact price for small displays
export const CompactPrice = ({ amount, className = '' }) => 
  formatBDTWithIcon(amount, true, {
    iconSize: 12,
    className: `text-sm ${className}`
  });

/**
 * Parse BDT string to number
 * @param {string} bdtString - BDT formatted string
 * @returns {number} Numeric amount
 */
export const parseBDT = (bdtString) => {
  if (typeof bdtString !== 'string') return parseFloat(bdtString) || 0;
  
  // Remove currency symbol, spaces, and thousands separators
  const cleanString = bdtString
    .replace(/[৳\s,]/g, '')
    .replace(BDT_CONFIG.decimalSeparator, '.');
    
  return parseFloat(cleanString) || 0;
};

/**
 * Check if amount qualifies for free shipping threshold
 * @param {number} amount - Current cart amount (already in BDT)
 * @param {number} threshold - Free shipping threshold (already in BDT)
 * @returns {object} Qualification status and remaining amount needed
 */
export const checkFreeShippingEligibility = (amount, threshold) => {
  const cartAmount = parseFloat(amount) || 0;
  const thresholdAmount = parseFloat(threshold) || 0;
  
  const isEligible = cartAmount >= thresholdAmount;
  const amountNeeded = isEligible ? 0 : thresholdAmount - cartAmount;
  
  return {
    isEligible,
    amountNeeded,
    formattedAmountNeeded: formatBDTWithIcon(amountNeeded, true),
    formattedThreshold: formatBDTWithIcon(thresholdAmount, true),
    formattedCartAmount: formatBDTWithIcon(cartAmount, true)
  };
};

/**
 * Get currency info for display
 * @returns {object} Currency configuration
 */
export const getCurrencyInfo = () => BDT_CONFIG;

/**
 * Default export with main formatting function (SVG version)
 */
export default formatBDTWithIcon;
