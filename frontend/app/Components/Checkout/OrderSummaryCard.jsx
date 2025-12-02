// app/Components/Checkout/OrderSummaryCard.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiPlus } from "react-icons/fi";
import Tk_icon from "../Common/Tk_icon";
import { useCheckout } from "@/app/contexts/CheckoutContext";

const OrderSummaryCard = () => {
  const { 
    orderTotals, 
    cartItems,
    selectedShippingMethod
  } = useCheckout();

  const { subtotal, discountAmount, total } = orderTotals;
  // Assuming shipping is free or calculated. If free, show "Free" in red like image
  const shippingCost = selectedShippingMethod?.price || 0;
  const isShippingFree = shippingCost === 0 || selectedShippingMethod?.id === 'free';

  return (
    <div className="bg-[var(--card)] rounded-[20px] p-8 shadow-sm h-fit sticky top-24">
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-8">
        Order Summary
      </h3>

      {/* Product List */}
      <div className="space-y-6 mb-8">
        {cartItems.map((item) => (
          <div key={item.variantId || item.id} className="flex gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0">
              <Image
                src={item.image || item.thumbnail_url || '/placeholder.png'}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized={(item.image || item.thumbnail_url || '').includes('.svg')}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-[var(--foreground)] text-sm line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    {item.selectedSize && <span className="mr-2">{item.selectedSize.name}</span>}
                    {item.selectedColor && <span>• {item.selectedColor.name}</span>}
                  </div>
                </div>
                <div className="text-sm font-bold text-[var(--foreground)] flex items-center">
                  <Tk_icon size={12} className="mr-1" />
                  {(item.price * item.quantity).toFixed(2)} 
                  <span className="text-[var(--muted-foreground)] font-normal ml-1">x{item.quantity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] my-6"></div>

      {/* Totals */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-[var(--foreground)]">
          <span>Sub Total</span>
          <span className="font-medium flex items-center">
            <Tk_icon size={12} className="mr-1"/>{subtotal.toFixed(2)}
          </span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-[var(--foreground)]">
            <span>Discount</span>
            <span className="font-medium flex items-center text-[#16a34a]">
              -<Tk_icon size={12} className="mr-1"/>{discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-[var(--foreground)]">
          <span>Tax</span>
          <span className="font-medium flex items-center">
            <Tk_icon size={12} className="mr-1"/>0.00
          </span>
        </div>

        <div className="flex justify-between text-[var(--foreground)]">
          <span>Shipping</span>
          <span className={`font-medium ${isShippingFree ? 'text-[#16a34a]' : ''}`}>
            {isShippingFree ? 'Free' : (
              <span className="flex items-center"><Tk_icon size={12} className="mr-1"/>{shippingCost}</span>
            )}
          </span>
        </div>

        <div className="flex justify-between text-base font-bold text-[var(--foreground)] pt-4">
          <span>Total</span>
          <span className="flex items-center">
            <Tk_icon size={16} className="mr-1"/>{total.toFixed(2)}
          </span>
        </div>
      </div>

    </div>
  );
};

export default OrderSummaryCard;