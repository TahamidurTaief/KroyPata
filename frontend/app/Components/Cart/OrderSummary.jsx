// app/Components/Cart/OrderSummary.jsx
"use client";

import CartItem from "./CartItem";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const OrderSummary = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="rounded-[20px] sm:rounded-[24px] shadow-sm p-4 sm:p-6 lg:p-8 h-full" style={{ backgroundColor: 'var(--cart-card-bg)', boxShadow: '0 1px 3px var(--cart-shadow)' }}>
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--cart-text-primary)' }}>Shopping Bag</h2>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--cart-text-secondary)' }}>
          {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items in your bag.
        </p>
      </div>

      {/* Table Headers - Hidden on mobile, visible on md+ */}
      {cartItems.length > 0 && (
        <div className="hidden md:grid grid-cols-12 gap-4 pb-3 sm:pb-4 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--cart-text-primary)' }}>
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Total Price</div>
        </div>
      )}

      {/* Items List */}
      <div className="mt-2">
        <AnimatePresence>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => {
              const uniqueKey = item.variantId || (item.id ? `item-${item.id}` : `cart-item-${index}`);
              return (
                <CartItem
                  key={uniqueKey}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                />
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16 lg:py-20"
            >
              <ShoppingCart size={48} className="mx-auto mb-4" style={{ color: 'var(--cart-text-muted)' }} />
              <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--cart-text-primary)' }}>Your cart is empty</h3>
              <p className="mb-4 sm:mb-6 text-sm" style={{ color: 'var(--cart-text-secondary)' }}>Looks like you haven't added anything yet.</p>
              <Link
                href="/products"
                className="inline-block font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full transition-colors text-sm"
                style={{ backgroundColor: 'var(--cart-button-primary)', color: 'var(--cart-card-bg)' }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Start Shopping
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderSummary;