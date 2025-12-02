// app/Components/Cart/CartItem.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useThemeAssets } from "@/app/hooks/useThemeAssets";
import Tk_icon from "../Common/Tk_icon";
import { validateMinimumPurchase } from "../Common/WholesalePricingNew";
import { useAuth } from "@/app/contexts/AuthContext";

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const { noImagePlaceholder, fallbackPlaceholder, mounted } = useThemeAssets();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  const getImageSrc = (imageSrc) => {
    if (imageError || !imageSrc) {
      return mounted ? noImagePlaceholder : fallbackPlaceholder;
    }
    return imageSrc;
  };

  const minimumPurchaseValidation = validateMinimumPurchase(item, item.quantity, user);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-12 gap-2 sm:gap-4 items-center py-4 sm:py-6"
    >
      {/* Mobile Layout (full width) - Visible only on mobile */}
      <div className="col-span-12 md:hidden">
        <div className="flex gap-3">
          <div className="relative h-20 w-16 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--muted)' }}>
            <Image
              src={getImageSrc(item.thumbnail_url)}
              alt={item.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized={getImageSrc(item.thumbnail_url).includes('.svg')}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase tracking-wider font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
              {item.category || "Item"}
            </span>
            <Link href={`/products/${item.slug}`} className="font-bold transition-colors line-clamp-2 text-sm block mb-2" style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--foreground)'}
            >
              {item.name}
            </Link>
            
            {/* Mobile Price and Quantity Row */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center text-sm" style={{ color: 'var(--primary)' }}>
                <Tk_icon size={14} className="mr-1" />
                {item.price.toFixed(2)}
              </span>
              
              <div className="flex items-center gap-2 rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--muted)' }}>
                <button
                  onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 transition-colors disabled:opacity-30"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <FiMinus size={12} />
                </button>
                <span className="text-sm font-semibold w-6 text-center" style={{ color: 'var(--foreground)' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
                  className="p-2 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <FiPlus size={12} />
                </button>
              </div>
            </div>
            
            {/* Mobile Total Price and Remove Row */}
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center text-base" style={{ color: 'var(--primary)' }}>
                <Tk_icon size={16} className="mr-1" />
                {(item.price * item.quantity).toFixed(2)}
              </span>
              
              <button
                onClick={() => onRemoveItem(item.variantId)}
                className="p-2 transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                onMouseLeave={(e) => e.target.style.color = 'var(--muted-foreground)'}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
            
            {/* Mobile Product Details */}
            <div className="flex flex-col gap-1 mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.selectedColor && (
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--muted-foreground)' }}>Color:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedColor.hex_code }} />
                    {item.selectedColor.name}
                  </span>
                </div>
              )}
              {item.selectedSize && (
                <div><span style={{ color: 'var(--muted-foreground)' }}>Size:</span> {item.selectedSize.name}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:contents">
        {/* Product Column (Span 6) */}
        <div className="col-span-6 flex gap-4">
          <div className="relative h-24 w-20 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--muted)' }}>
            <Image
              src={getImageSrc(item.thumbnail_url)}
              alt={item.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized={getImageSrc(item.thumbnail_url).includes('.svg')}
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <span className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              {item.category || "Item"}
            </span>
            <Link href={`/products/${item.slug}`} className="font-bold transition-colors line-clamp-2 text-base" style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--foreground)'}
            >
              {item.name}
            </Link>
            <div className="flex flex-col gap-1 mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.selectedColor && (
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--muted-foreground)' }}>Color:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedColor.hex_code }} />
                    {item.selectedColor.name}
                  </span>
                </div>
              )}
              {item.selectedSize && (
                <div><span style={{ color: 'var(--muted-foreground)' }}>Size:</span> {item.selectedSize.name}</div>
              )}
            </div>
          </div>
        </div>

        {/* Price Column (Span 2) */}
        <div className="col-span-2 flex items-center justify-center">
          <span className="font-bold flex items-center text-sm" style={{ color: 'var(--primary)' }}>
            <Tk_icon size={14} className="mr-1" />
            {item.price.toFixed(2)}
          </span>
        </div>

        {/* Quantity Column (Span 2) */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--muted)' }}>
            <button
              onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-1 transition-colors disabled:opacity-30"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => !e.disabled && (e.target.style.color = 'var(--foreground)')}
              onMouseLeave={(e) => !e.disabled && (e.target.style.color = 'var(--muted-foreground)')}
            >
              <FiMinus size={12} />
            </button>
            <span className="text-sm font-semibold w-4 text-center" style={{ color: 'var(--foreground)' }}>
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
              className="p-1 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--foreground)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--muted-foreground)'}
            >
              <FiPlus size={12} />
            </button>
          </div>
        </div>

        {/* Total Price Column (Span 2) */}
        <div className="col-span-2 flex items-center justify-center gap-4">
          <span className="font-bold flex items-center text-lg" style={{ color: 'var(--primary)' }}>
            <Tk_icon size={16} className="mr-1" />
            {(item.price * item.quantity).toFixed(2)}
          </span>
          <button
            onClick={() => onRemoveItem(item.variantId)}
            className="transition-colors flex items-center justify-center"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
            onMouseLeave={(e) => e.target.style.color = 'var(--muted-foreground)'}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Validation Message Row */}
      {!minimumPurchaseValidation.isValid && (
        <div className="col-span-12 mt-2 text-xs p-2 rounded" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
          {minimumPurchaseValidation.message}
        </div>
      )}
    </motion.div>
  );
};

export default CartItem;