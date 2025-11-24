"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { motion } from "framer-motion";
import { useModal } from "@/app/contexts/ModalContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { addToCart } from "@/app/lib/cartUtils";
import { useThemeAssets } from "@/app/hooks/useThemeAssets";
import { WholesalePricingDisplay, WholesalePricingBadge, useWholesalePricingLogic } from "./WholesalePricingNew";
import Tk_icon from "./Tk_icon";

const ProductCard = ({ productData }) => {
  const { showModal } = useModal();
  const { user } = useAuth();
  const { noImagePlaceholder, fallbackPlaceholder, mounted } = useThemeAssets();
  
  // Hook for wholesale logic
  const { isUsingWholesalePrice, minimumPurchase } = useWholesalePricingLogic(productData);
  
  const colors = productData?.colors || [];
  const sizes = productData?.sizes || [];
  const inStock = productData?.stock > 0;
  const isWholesaler = user?.user_type === 'WHOLESALER';

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor] = useState(colors?.[0] || null);
  const [selectedSize] = useState(sizes?.[0] || null);
  const [imageError, setImageError] = useState(false);
  
  const productUrl = `/products/${productData?.slug}`;

  // Helper to get plain description
  const plainDescription = productData?.short_description 
    ? productData.short_description 
    : productData?.description?.replace(/<[^>]*>?/gm, '') || '';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    
    // For wholesalers with valid wholesale price, use minimum_purchase quantity
    const hasValidWholesalePrice = productData?.wholesale_price && parseFloat(productData.wholesale_price) > 0;
    const quantity = isWholesaler && hasValidWholesalePrice && minimumPurchase > 1 
      ? minimumPurchase 
      : 1;
    
    const result = addToCart(productData, {
      quantity: quantity,
      selectedColor,
      selectedSize,
      user: user 
    });
    
    if (result.success) {
      const quantityText = quantity > 1 ? ` (${quantity} units)` : '';
      showModal({
        status: 'success',
        title: 'Added to Cart!',
        message: `${productData.name}${quantityText} has been successfully added to your cart.`,
        primaryActionText: 'View Cart',
        onPrimaryAction: () => { window.location.href = '/cart'; },
        secondaryActionText: 'Continue'
      });
    } else {
      showModal({
        status: 'error',
        title: 'Error',
        message: `Failed to add ${productData.name} to cart. Please try again.`,
        primaryActionText: 'OK'
      });
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    showModal({
      status: 'success',
      title: !isWishlisted ? 'Added to Wishlist' : 'Removed from Wishlist',
      message: !isWishlisted ? `${productData?.name} added to wishlist!` : `${productData?.name} removed from wishlist!`,
      primaryActionText: 'Continue'
    });
  };

  const getImageSrc = (imageSrc) => {
    if (imageError || !imageSrc) {
      return mounted ? noImagePlaceholder : fallbackPlaceholder;
    }
    return imageSrc;
  };

  return (
    <Link href={productUrl} passHref className="h-full block">
      <motion.div
        className="group relative bg-[var(--color-surface)] p-2.5 rounded-[28px] shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-white/50 dark:border-gray-700"
        whileHover={{ y: -8 }}
      >
        {/* 1. Image Section */}
        <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-[24px] bg-gray-50 dark:bg-gray-800 mb-3">
          <Image
            src={getImageSrc(productData?.thumbnail_url)}
            alt={productData?.name || 'Product Image'}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImageError(true)}
            unoptimized={getImageSrc(productData?.thumbnail_url).endsWith('.svg')}
          />
          
          {/* Wishlist Button - Glassmorphism Style (Top Right) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToWishlist}
            className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 z-20 shadow-sm ${
              isWishlisted 
                ? 'bg-red-500/90 text-white shadow-red-500/30' 
                : 'bg-white/40 hover:bg-white/80 text-white border border-white/30'
            }`}
            aria-label="Add to wishlist"
          >
            <LuHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Wholesale Badge (Top Left) */}
          {isWholesaler && (
            <div className="absolute top-4 left-4 z-10">
              {productData?.wholesale_price && parseFloat(productData.wholesale_price) > 0 ? (
                // Show discount percentage for wholesale
                productData?.price && parseFloat(productData.price) > parseFloat(productData.wholesale_price) && (
                  <span className="bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
                    -{Math.round(((parseFloat(productData.price) - parseFloat(productData.wholesale_price)) / parseFloat(productData.price)) * 100)}%
                  </span>
                )
              ) : (
                // Show "Not for Wholesale" badge
                <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
                  Not WSL
                </span>
              )}
            </div>
          )}
          
          {/* Regular customer discount badge */}
          {!isWholesaler && productData?.discount_price && productData?.price && parseFloat(productData.price) > parseFloat(productData.discount_price) && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
                -{Math.round(((parseFloat(productData.price) - parseFloat(productData.discount_price)) / parseFloat(productData.price)) * 100)}%
              </span>
            </div>
          )}
        </div>
        
        {/* 2. Content Section */}
        <div className="px-1 flex-grow flex flex-col min-h-0">
          {/* Category Badge */}
          {productData?.sub_category?.name && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full mb-1.5 w-fit">
              {productData.sub_category.name}
            </span>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug mb-2 line-clamp-2 group-hover:text-[var(--color-button-primary)] transition-colors">
            {productData?.name}
          </h3>
          
          {/* 3. Footer: Price & Add to Cart Button */}
          <div className="mt-auto flex flex-col gap-2">
            {/* Price Section */}
            <div className="flex flex-col">
              {isWholesaler ? (
                // Wholesaler pricing display
                productData?.wholesale_price && parseFloat(productData.wholesale_price) > 0 ? (
                  <>
                    {/* Minimum Quantity Badge */}
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-accent-orange)] mb-0.5">
                      Min: {minimumPurchase} pcs
                    </div>
                    
                    {/* Wholesale Price */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <Tk_icon size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {parseFloat(productData.wholesale_price).toFixed(2)}
                      </span>
                      <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 ml-0.5">
                        WSL
                      </span>
                    </div>
                    
                    {/* Regular Price & Savings in one line */}
                    <div className="flex items-center gap-2">
                      {productData?.price && (
                        <div className="flex items-center gap-0.5">
                          <Tk_icon size={11} className="text-gray-400" />
                          <span className="text-[11px] text-gray-400 line-through">
                            {parseFloat(productData.price).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {productData?.price && parseFloat(productData.price) > parseFloat(productData.wholesale_price) && (
                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400">
                          Save {Math.round(((parseFloat(productData.price) - parseFloat(productData.wholesale_price)) / parseFloat(productData.price)) * 100)}%
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  // No wholesale price available
                  <>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-0.5">
                      Wholesale not allowed
                    </div>
                    
                    {/* Show regular price */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <Tk_icon size={16} className="text-[var(--color-text-primary)]" />
                      <span className="text-lg font-bold text-[var(--color-text-primary)]">
                        {productData?.discount_price 
                          ? parseFloat(productData.discount_price).toFixed(2)
                          : parseFloat(productData?.price || 0).toFixed(2)
                        }
                      </span>
                    </div>
                    
                    {/* Regular Price (if discount available) */}
                    {productData?.discount_price && productData?.price && (
                      <div className="flex items-center gap-0.5">
                        <Tk_icon size={11} className="text-gray-400" />
                        <span className="text-[11px] text-gray-400 line-through">
                          {parseFloat(productData.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </>
                )
              ) : (
                // Regular customer pricing
                <>
                  {/* Sale Price or Regular Price */}
                  <div className="flex items-center gap-1 mb-0.5">
                    <Tk_icon size={16} className="text-[var(--color-text-primary)]" />
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                      {productData?.discount_price 
                        ? parseFloat(productData.discount_price).toFixed(2)
                        : parseFloat(productData?.price || 0).toFixed(2)
                      }
                    </span>
                  </div>
                  
                  {/* Regular Price & Savings in one line */}
                  <div className="flex items-center gap-2">
                    {productData?.discount_price && productData?.price && (
                      <>
                        <div className="flex items-center gap-0.5">
                          <Tk_icon size={11} className="text-gray-400" />
                          <span className="text-[11px] text-gray-400 line-through">
                            {parseFloat(productData.price).toFixed(2)}
                          </span>
                        </div>
                        {parseFloat(productData.price) > parseFloat(productData.discount_price) && (
                          <span className="text-[9px] font-bold text-green-600 dark:text-green-400">
                            Save {Math.round(((parseFloat(productData.price) - parseFloat(productData.discount_price)) / parseFloat(productData.price)) * 100)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Add to Cart Button - Full Width */}
            <motion.button
              onClick={handleAddToCart}
              disabled={!inStock}
              whileTap={{ scale: 0.95 }}
              className={`
                w-full px-3 py-2 rounded-full font-semibold text-sm shadow-lg transition-all duration-300
                flex items-center justify-center gap-1.5 whitespace-nowrap
                ${inStock 
                  ? 'bg-[#1f2937] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                }
              `}
              aria-label="Add to cart"
            >
              <LuShoppingCart className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{inStock ? "Add to Cart" : "Sold Out"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;