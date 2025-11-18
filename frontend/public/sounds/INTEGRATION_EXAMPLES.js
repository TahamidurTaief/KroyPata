// Example integration for checkout page
// Add this to your checkout page imports:

import { checkoutSounds, preloadNotificationSounds } from '../lib/soundUtils';

// In your CheckoutProcess component, add this useEffect to preload sounds:
useEffect(() => {
  // Preload sounds when component mounts
  preloadNotificationSounds();
}, []);

// Usage examples in your existing functions:

// 1. In handleApplyCoupon function (when coupon is successfully applied):
if (applyResult.success || applyResult.valid) {
  setDiscount(applyResult.discount_amount || applyResult.discount || 0);
  setCouponApplied(true);
  
  // Play success sound
  checkoutSounds.couponApplied();
  
  showModal({
    status: 'success',
    title: 'Coupon Applied!',
    message: applyResult.message || `${couponCode} applied successfully!`,
    primaryActionText: 'continue '
  });
  setIsApplyingCoupon(false);
  return;
}

// 2. In handleApplyCoupon function (when coupon is invalid):
showModal({
  status: 'error',
  title: 'Invalid Coupon',
  message: 'The coupon code you entered is not valid or has expired.',
  primaryActionText: 'Try Again'
});

// Play error sound
checkoutSounds.couponInvalid();

// 3. In handlePayment function (when payment is successful):
const result = await createOrderWithPayment({
  // ... payment data
});

if (result && result.success) {
  // Play success sound
  checkoutSounds.paymentSuccess();
  
  showModal({
    status: 'success',
    title: 'Payment Successful!',
    message: `Your order has been placed successfully. Order ID: ${result.order_id}`,
    primaryActionText: 'View Order'
  });
} else {
  // Play error sound
  checkoutSounds.paymentFailed();
  
  showModal({
    status: 'error',
    title: 'Payment Failed',
    message: result?.error || 'Payment processing failed. Please try again.',
    primaryActionText: 'Try Again'
  });
}

// 4. For form validation errors:
if (!transactionNumber.trim()) {
  checkoutSounds.formError();
  showModal({
    status: 'error',
    title: 'Missing Information',
    message: 'Please enter a transaction number.',
    primaryActionText: 'OK'
  });
  return;
}
