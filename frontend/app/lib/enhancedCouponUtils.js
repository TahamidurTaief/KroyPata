// Re-export shim so imports like '../lib/enhancedCouponUtils' (from app/* pages)
// work both locally (case-insensitive Windows) and on case-sensitive Linux (Vercel).
// The actual implementation lives in the project root level `lib/enhancedCouponUtils.js`.
// Keeping a thin wrapper avoids having to update multiple existing import paths.

export {
  applyCouponEnhanced,
  getApplicableCoupons,
  calculateTotalsWithCoupon,
  formatCouponDisplay,
  applyCouponUnified,
  getAvailableCoupons
} from '../../lib/enhancedCouponUtils';
