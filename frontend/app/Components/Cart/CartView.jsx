// app/Components/Cart/CartView.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useModal } from "../../contexts/ModalContext";
import { useCartContext } from "../../contexts/CartContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { calculateCartTotal } from "@/app/lib/shippingUtils";
import { calculateTotalsWithCoupon } from "../../../lib/enhancedCouponUtils";
import { validateMinimumPurchase } from "../Common/WholesalePricingNew";

// Components
import OrderSummary from "./OrderSummary";
import EnhancedCartTotals from "./EnhancedCartTotals";
import EnhancedCartCoupon from "./EnhancedCartCoupon";
import ShippingAnalysis from "../Checkout/ShippingAnalysis";
import CartServices from "./CartServices";

const CartView = () => {
  const { 
    cartItems, 
    updateCartItemQuantity: updateQuantity, 
    removeFromCart: removeItem,
    mounted 
  } = useCartContext();
  
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingAnalysis, setShippingAnalysis] = useState(null);
  const { showModal } = useModal();
  const { user } = useAuth();

  const handleUpdateQuantity = (variantId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(variantId);
      return;
    }
    updateQuantity(variantId, newQuantity);
  };

  const handleRemoveItem = (variantId) => {
    const result = removeItem(variantId);
    if (result.success) {
      showModal({
        status: 'success',
        title: 'Item Removed',
        message: 'Item has been removed from your bag.',
        primaryActionText: 'OK'
      });
    }
  };

  // Don't calculate shipping cost in cart page - only show product-based shipping methods
  const selectedShippingCost = 0;

  // Calculations
  const totalsWithCoupon = useMemo(() => {
    const sub = calculateCartTotal(cartItems);
    return calculateTotalsWithCoupon(sub, 0, appliedCoupon); // No shipping cost in cart
  }, [cartItems, appliedCoupon]);

  const minimumPurchaseValidations = useMemo(() => {
    return cartItems.map(item => ({
      ...item,
      validation: validateMinimumPurchase(item, item.quantity, user)
    }));
  }, [cartItems, user]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen pb-20 pt-4 sm:pt-6 md:pt-10 font-sans" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          
          {/* LEFT SIDE: Shopping Bag (2/3 width) */}
          <div className="order-2 lg:order-1 lg:col-span-2 h-full">
            <OrderSummary
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* RIGHT SIDE: Sidebar (1/3 width) */}
          <div className="order-1 lg:order-2 lg:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* 1. Cart Total (Yellow Card) - First */}
            <EnhancedCartTotals
              subtotal={totalsWithCoupon.originalSubtotal || totalsWithCoupon.subtotal}
              shipping={0}
              appliedCoupon={appliedCoupon}
              total={totalsWithCoupon.subtotal}
              cartItems={cartItems}
              shippingAnalysis={shippingAnalysis}
            />

            {/* 2. Product-Based Shipping Methods - Second */}
            <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm" style={{ backgroundColor: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>Available Shipping Methods</h3>
              <ShippingAnalysis
                cartItems={cartItems}
                cartTotal={totalsWithCoupon.subtotal}
                onAnalysisUpdate={setShippingAnalysis}
              />
            </div>

            {/* 3. Coupon Code - Third */}
            <EnhancedCartCoupon
              cartItems={cartItems}
              cartTotal={totalsWithCoupon.subtotal}
              onApplyCoupon={setAppliedCoupon}
              appliedCoupon={appliedCoupon}
              onCouponRemoved={() => setAppliedCoupon(null)}
            />

          </div>
        </div>

        {/* BOTTOM: Service Features */}
        <CartServices />
        
      </div>
    </div>
  );
};

export default CartView;