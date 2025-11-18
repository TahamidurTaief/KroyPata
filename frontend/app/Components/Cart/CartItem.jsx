// app/Components/Cart/CartItem.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useThemeAssets } from "@/app/hooks/useThemeAssets";
import { formatBDTWithIcon } from "@/app/utils/currencyWithIcon";
import Tk_icon from "../Common/Tk_icon";
import { validateMinimumPurchase } from "../Common/WholesalePricingNew";
import { useAuth } from "@/app/contexts/AuthContext";
import { FaStore } from 'react-icons/fa';

// This component displays a single item in the shopping cart.
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

  const handleImageError = () => {
    setImageError(true);
  };

  // Check minimum purchase requirements
  const minimumPurchaseValidation = validateMinimumPurchase(item, item.quantity, user);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-4 p-4"
    >
      <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-[var(--color-second-bg)] flex-shrink-0">
        <Image
          src={getImageSrc(item.thumbnail_url)}
          alt={item.name}
          fill
          className="object-cover"
          sizes="100px"
          onError={handleImageError}
          unoptimized={getImageSrc(item.thumbnail_url).endsWith('.svg')}
        />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`} passHref>
           <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">{item.name}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-[var(--text-primary)] mt-1">
          {item.selectedSize && <span>Size: {item.selectedSize.name}</span>}
          {item.selectedColor && (
            <div className="flex items-center gap-1.5">
              {item.selectedSize && <span className="text-gray-300 dark:text-gray-600">|</span>}
              <span>Color:</span>
              <span
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: item.selectedColor.hex_code }}
                title={item.selectedColor.name}
              />
            </div>
          )}
        </div>
        {/* Weight information for shipping calculations */}
        {item.weight && item.weight > 0 && (
          <div className="text-sm text-[var(--color-text-secondary)] mt-1">
            Weight: {item.weight}kg {item.quantity > 1 && (
              <span className="text-xs">
                (Total: {(item.weight * item.quantity).toFixed(2)}kg)
              </span>
            )}
          </div>
        )}
        {/* Enhanced pricing display for cart items */}
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary flex items-baseline gap-1">
              <Tk_icon size={16} className="text-primary" />
              {item.price.toFixed(2)}
            </span>
            {item.is_wholesale && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <FaStore size={10} />
                Wholesale
              </span>
            )}
          </div>
          {/* Show original price if wholesale */}
          {item.is_wholesale && item.original_price > item.price && (
            <div className="text-sm text-muted-foreground">
              Regular: <span className="line-through">৳{item.original_price.toFixed(2)}</span>
            </div>
          )}
          {/* Show subtotal if quantity > 1 */}
          {item.quantity > 1 && (
            <div className="text-sm text-muted-foreground">
              Total: ৳{(item.price * item.quantity).toFixed(2)}
            </div>
          )}
          
          {/* Show minimum purchase validation for wholesale items */}
          {item.is_wholesale && (
            <div className={`text-xs mt-1 p-1 rounded ${
              minimumPurchaseValidation.isValid 
                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
            }`}>
              {minimumPurchaseValidation.message}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
            className="p-1 rounded-full hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
            disabled={item.is_wholesale && item.quantity <= minimumPurchaseValidation.minimumRequired}
          >
            <FiMinus size={14} />
          </button>
          <span className="w-8 text-center font-medium text-foreground">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>
        <button
          onClick={() => onRemoveItem(item.variantId)}
          className="text-muted-foreground hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
