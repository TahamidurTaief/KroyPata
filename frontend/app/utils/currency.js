// Currency utilities for BDT (Bangladeshi Taka)
// This utility provides consistent currency formatting throughout the application
// No currency conversion - amounts are already in BDT

/**
 * BDT Currency Symbol and Formatting Configuration
 */
export const BDT_CONFIG = {
  symbol: '৳', // Bengali Taka symbol
  code: 'BDT',
  name: 'Bangladeshi Taka',
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolPosition: 'before', // 'before' or 'after'
  spaceAfterSymbol: false
};

/**
 * Format amount as BDT currency string
 * @param {number|string} amount - Amount to format (already in BDT)
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted currency string
 */
export const formatBDT = (amount, showSymbol = true) => {
  const bdtAmount = parseFloat(amount) || 0;
  
  // Round to specified decimal places
  const roundedAmount = bdtAmount.toFixed(BDT_CONFIG.decimalPlaces);
  
  // Add thousands separator
  const [wholePart, decimalPart] = roundedAmount.split('.');
  const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, BDT_CONFIG.thousandsSeparator);
  const formattedAmount = decimalPart ? `${formattedWhole}${BDT_CONFIG.decimalSeparator}${decimalPart}` : formattedWhole;
  
  // Add currency symbol
  if (showSymbol) {
    const space = BDT_CONFIG.spaceAfterSymbol ? ' ' : '';
    return BDT_CONFIG.symbolPosition === 'before' 
      ? `${BDT_CONFIG.symbol}${space}${formattedAmount}`
      : `${formattedAmount}${space}${BDT_CONFIG.symbol}`;
  }
  
  return formattedAmount;
};

/**
 * Parse BDT string to number
 * @param {string} bdtString - BDT formatted string
 * @returns {number} Numeric amount
 */
export const parseBDT = (bdtString) => {
  if (typeof bdtString !== 'string') return parseFloat(bdtString) || 0;
  
  // Remove currency symbol, spaces, and thousands separators
  const cleanString = bdtString
    .replace(new RegExp(`[${BDT_CONFIG.symbol}\\s${BDT_CONFIG.thousandsSeparator}]`, 'g'), '')
    .replace(BDT_CONFIG.decimalSeparator, '.');
    
  return parseFloat(cleanString) || 0;
};

/**
 * Format price range in BDT
 * @param {number} minPrice - Minimum price (already in BDT)
 * @param {number} maxPrice - Maximum price (already in BDT)
 * @returns {string} Formatted price range
 */
export const formatBDTPriceRange = (minPrice, maxPrice) => {
  const formattedMin = formatBDT(minPrice, true);
  const formattedMax = formatBDT(maxPrice, true);
  
  if (minPrice === maxPrice) {
    return formattedMin;
  }
  
  return `${formattedMin} - ${formattedMax}`;
};

/**
 * Get currency info for display
 * @returns {object} Currency configuration
 */
export const getCurrencyInfo = () => BDT_CONFIG;

/**
 * Format shipping cost in BDT
 * @param {number} cost - Shipping cost (already in BDT)
 * @param {boolean} isFree - Whether shipping is free
 * @returns {string} Formatted shipping cost
 */
export const formatShippingCost = (cost, isFree = false) => {
  if (isFree || cost === 0) {
    return 'Free';
  }
  
  return formatBDT(cost, true);
};

/**
 * Format discount in BDT
 * @param {number} discount - Discount amount (already in BDT)
 * @returns {string} Formatted discount with minus sign
 */
export const formatDiscount = (discount) => {
  if (discount <= 0) return formatBDT(0);
  
  return `-${formatBDT(discount, true)}`;
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
    formattedAmountNeeded: formatBDT(amountNeeded),
    formattedThreshold: formatBDT(thresholdAmount),
    formattedCartAmount: formatBDT(cartAmount)
  };
};

/**
 * Default export with main formatting function
 */
export default formatBDT;
