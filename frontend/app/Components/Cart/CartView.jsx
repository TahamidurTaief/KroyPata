// app/Components/Cart/CartView.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useModal } from "../../contexts/ModalContext";
import { useCartContext } from "../../contexts/CartContext";
import OrderSummary from "./OrderSummary";
import EnhancedCartTotals from "./EnhancedCartTotals";
import EnhancedCartCoupon from "./EnhancedCartCoupon";
import ShippingAnalysis from "../Checkout/ShippingAnalysis";
import { CouponData } from "@/app/lib/Data/CouponData";
import { applyCouponEnhanced, calculateTotalsWithCoupon } from "../../../lib/enhancedCouponUtils";
import CheckoutSteps from "./CheckoutSteps";
import { 
  calculateCartTotal
} from "@/app/lib/shippingUtils";
import EnhancedSectionRenderer from "../Common/EnhancedSectionRenderer";
import { validateMinimumPurchase } from "../Common/WholesalePricingNew";
import { useAuth } from "@/app/contexts/AuthContext";
import { FaTimesCircle } from 'react-icons/fa';

// This is the main component for the /cart page.
// It orchestrates the entire cart view, including item management, advanced shipping, and order summary.

// Helper function to ensure cart items have unique identifiers
const ensureCartItemIds = (items) => {
  return items.map((item, index) => {
    // Extract valid product ID
    const productId = item.productId || item.product_id || item.id || item.uuid;
    
    if (!productId) {
      console.warn('⚠️ Cart item missing productId, using fallback:', item);
    }
    
    return {
      ...item,
      variantId: item.variantId || item.id || `cart-item-${index}`,
      id: item.id || index + 1,
      productId: productId || `product-${index}`, // Ensure productId for API
      // Also set product_id for backend compatibility
      product_id: productId || `product-${index}`
    };
  });
};

const CartView = () => {
  // Use global cart context instead of local state
  const { 
    cartItems, 
    updateCartItemQuantity: updateQuantity, 
    removeFromCart: removeItem,
    mounted 
  } = useCartContext();
  
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [freeShippingAnalysis, setFreeShippingAnalysis] = useState(null);
  
  const { showModal } = useModal();
  const { user } = useAuth();

  // Handler to handle free shipping analysis updates
  const handleFreeShippingAnalysisUpdate = useCallback((data) => {
    setFreeShippingAnalysis(data);
  }, []);

  // Handler to update the quantity of an item in the cart using global context
  const handleUpdateQuantity = (variantId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(variantId);
      return;
    }
    const result = updateQuantity(variantId, newQuantity);
    if (!result.success) {
      console.error('Failed to update quantity:', result.error);
    }
  };

  // Handler to remove an item from the cart using global context
  const handleRemoveItem = (variantId) => {
    const result = removeItem(variantId);
    if (result.success) {
      showModal({
        status: 'success',
        title: 'Item Removed',
        message: 'Item has been removed from your cart.',
        primaryActionText: 'OK'
      });
    } else {
      console.error('Failed to remove item:', result.error);
    }
  };

  // Handler to select shipping method
  const handleSelectShippingMethod = (methodId) => {
    // This is now handled in checkout page
    console.log('Shipping method selection moved to checkout:', methodId);
  };

  // Handler to apply a coupon code
  const handleApplyCoupon = async (couponData) => {
    setAppliedCoupon(couponData);
  };

  // Handler to remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Validate minimum purchase requirements for wholesale items
  const minimumPurchaseValidations = useMemo(() => {
    return cartItems.map(item => ({
      ...item,
      validation: validateMinimumPurchase(item, item.quantity, user)
    }));
  }, [cartItems, user]);

  // Check if any wholesale items don't meet minimum requirements
  const hasMinimumPurchaseErrors = minimumPurchaseValidations.some(
    item => item.is_wholesale && !item.validation.isValid
  );

  // Memoized calculation for order totals - simplified without shipping
  const totalsWithCoupon = useMemo(() => {
    const sub = calculateCartTotal(cartItems);
    // Shipping is now handled in checkout page
    const shipping = 0; 
    
    return calculateTotalsWithCoupon(sub, shipping, appliedCoupon);
  }, [cartItems, appliedCoupon]);

  if (!mounted) {
    return null; // Show loading skeleton (loading.js) while waiting for client-side mount
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps currentStep={1} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      >
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <OrderSummary
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
          
          {/* Free Shipping Analysis - New Component */}
          {cartItems.length > 0 && (
            <ShippingAnalysis
              cartItems={cartItems}
              cartTotal={totalsWithCoupon.subtotal}
              onAnalysisUpdate={handleFreeShippingAnalysisUpdate}
            />
          )}
        </div>

        {/* Right Column: Order Details Panel */}
        <div className="lg:col-span-1 sticky top-24">
          <div
            className="rounded-xl border shadow-lg p-6 space-y-6 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, var(--color-second-bg) 0%, var(--color-second-bg) 55%, var(--color-surface) 100%)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <h2 className="text-2xl font-bold">Order Details</h2>
            <EnhancedCartTotals
              subtotal={totalsWithCoupon.originalSubtotal || totalsWithCoupon.subtotal}
              shipping={0} // Shipping handled in checkout
              appliedCoupon={appliedCoupon}
              total={totalsWithCoupon.subtotal} // No shipping in cart total
              showShipping={false} // Don't show shipping in cart
              selectedShippingMethod={null}
              shippingMethodName={null}
              cartItems={cartItems} // Pass cartItems for wholesale pricing
            />
            <div className="border-t border-border"></div>
            <EnhancedCartCoupon
              cartItems={cartItems}
              cartTotal={totalsWithCoupon.originalSubtotal || totalsWithCoupon.subtotal}
              onCouponApplied={handleApplyCoupon}
              appliedCoupon={appliedCoupon}
              onCouponRemoved={handleRemoveCoupon}
            />
            
            {/* Show minimum purchase errors */}
            {hasMinimumPurchaseErrors && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <div className="text-red-800 dark:text-red-200 text-sm">
                  <div className="font-medium mb-1 flex items-center gap-2">
                    <FaTimesCircle size={14} />
                    Minimum Order Requirements Not Met
                  </div>
                  <ul className="space-y-1">
                    {minimumPurchaseValidations
                      .filter(item => item.is_wholesale && !item.validation.isValid)
                      .map(item => (
                        <li key={item.variantId} className="text-xs">
                          • {item.name}: Need {item.validation.shortage} more units (Min: {item.validation.minimumRequired})
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            )}
            
            <Link href="/checkout" className="" passHref>
              <motion.button
                className="w-full mt-4 relative overflow-hidden font-semibold lato text-base group rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  padding: '0.85rem 1.25rem',
                  background: 'var(--color-button-primary)',
                  color: 'var(--color-primary-foreground, #fff)',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.15)',
                  transition: 'background .25s, box-shadow .25s'
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -1 }}
                disabled={cartItems.length === 0 || hasMinimumPurchaseErrors}
              >
                <span className="text-white relative z-10 flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <svg className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                {/* subtle gradient highlight */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0))'}} />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Dynamic Sections for Cart Page */}
      <EnhancedSectionRenderer page="cart" />
    </div>
  );
};

export default CartView;
