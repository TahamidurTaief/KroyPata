"use client";

import Image from "next/image";
import Link from "next/link";
import { LuShoppingCart, LuHeart, LuEye } from "react-icons/lu";
import { FiX } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/app/contexts/ModalContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { addToCart } from "@/app/lib/cartUtils";
import { useThemeAssets } from "@/app/hooks/useThemeAssets";
import { formatBDTWithIcon, ProductPrice } from "@/app/utils/currencyWithIcon";
import { WholesalePricingDisplay, WholesalePricingBadge, useWholesalePricingLogic } from "./WholesalePricingNew";
import Tk_icon from "./Tk_icon";

const ProductCard = ({ productData }) => {
  const { showModal } = useModal();
  const { user, isAuthenticated } = useAuth();
  const { noImagePlaceholder, fallbackPlaceholder, mounted } = useThemeAssets();
  
  // Call hook at component level, not inside event handler
  const { isUsingWholesalePrice, minimumPurchase } = useWholesalePricingLogic(productData);
  
  const colors = productData?.colors || [];
  const sizes = productData?.sizes || [];
  const inStock = productData?.stock > 0;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes?.[0] || null);
  const [imageError, setImageError] = useState(false);
  
  const allImages = [productData?.thumbnail_url, ...(productData?.additional_images?.map(img => img.image) || [])].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(allImages[0] || null); 

  const productUrl = `/products/${productData?.slug}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    
    // Use the values calculated at component level
    const quantity = isUsingWholesalePrice && minimumPurchase > 1 ? minimumPurchase : 1;
    
    // Add item to cart using utility function with user data for wholesale pricing
    const result = addToCart(productData, {
      quantity: quantity,
      selectedColor,
      selectedSize,
      user: user  // Pass user data to determine pricing
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
      closeQuickView();
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

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const closeQuickView = () => setQuickViewOpen(false);
  
  // Get the appropriate placeholder image based on theme and product image availability
  const getImageSrc = (imageSrc) => {
    if (imageError || !imageSrc) {
      // If error or no image, use theme-aware placeholder
      return mounted ? noImagePlaceholder : fallbackPlaceholder;
    }
    return imageSrc;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <Link href={productUrl} passHref className="h-full">
        <motion.div
          className="group relative bg-[var(--color-surface)] p-3 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300  h-full flex flex-col"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
            <Image
              src={getImageSrc(productData?.thumbnail_url)}
              alt={productData?.name || 'Product Image'}
              fill
              className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={handleImageError}
              unoptimized={getImageSrc(productData?.thumbnail_url).endsWith('.svg')}
            />
            
            {/* Pricing Badge - Positioned at top-right corner */}
            <div className="absolute top-2 right-2 z-10">
              <WholesalePricingBadge 
                product={productData}
                hideUnavailableOnUnauthenticated={false}
                forceShowUnavailable={false}
              />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
              {[
                { icon: LuEye, action: handleQuickView, label: "Quick View" },
                { icon: LuHeart, action: handleAddToWishlist, label: "Wishlist", active: isWishlisted },
                { icon: LuShoppingCart, action: handleAddToCart, label: "Add to Cart", disabled: !inStock },
              ].map((item, index) => (
                <motion.button
                  key={index}
                  onClick={item.action}
                  disabled={item.disabled}
                  className={`min-h-[44px] min-w-[44px] p-3 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${item.active ? "bg-red-500 text-white" : "bg-white/90 text-gray-800 hover:bg-white"} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  aria-label={item.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={`text-lg ${item.active ? 'fill-current' : ''}`} />
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{productData?.sub_category?.name || 'Category'}</span>
            <h3 className="font-semibold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{productData?.name}</h3>
            
            {/* Stock Info */}
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {inStock ? `${productData?.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
            
            <div className="mt-auto">
              {/* Use new wholesale pricing component with user-specific display */}
              <WholesalePricingDisplay 
                product={productData} 
                size="medium"
                showLabels={true} // Always show labels and badges
                hideUnavailableOnUnauthenticated={false} // Show wholesale status clearly
                forceShowUnavailable={false}
                showOnlyPrimaryPrice={false} // Always show full pricing info in cards
              />
              
              {/* Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`w-full mt-3 min-h-[44px] py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  inStock 
                    ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={inStock ? { scale: 1.02 } : {}}
                whileTap={inStock ? { scale: 0.98 } : {}}
              >
                <LuShoppingCart className="w-4 h-4" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Link>

      <AnimatePresence>
        {quickViewOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={closeQuickView}
            style={{ zIndex: 9999 }}
          >
            <motion.div 
              className="bg-[var(--color-surface)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col md:flex-row border border-gray-200 dark:border-gray-700" 
              initial={{ y: 30, scale: 0.95, opacity: 0 }} 
              animate={{ y: 0, scale: 1, opacity: 1 }} 
              exit={{ y: 30, scale: 0.95, opacity: 0 }} 
              transition={{ type: "spring", damping: 20, stiffness: 200 }} 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={closeQuickView} 
                className="absolute top-4 right-4 min-h-[44px] min-w-[44px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full z-30 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center" 
                aria-label="Close quick view"
              >
                <FiX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Left Side - Images */}
              <div className="w-full md:w-1/2 p-6">
                <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <Image 
                    src={getImageSrc(selectedImage)} 
                    alt={productData?.name || 'Product Image'} 
                    fill 
                    className="object-cover" 
                    onError={handleImageError}
                    unoptimized={getImageSrc(selectedImage).endsWith('.svg')}
                  />
                </div>
                
                {/* Thumbnail Navigation */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setSelectedImage(img)} 
                        className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          selectedImage === img 
                            ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" 
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <Image 
                          src={getImageSrc(img)} 
                          alt={`Thumbnail ${idx + 1}`} 
                          fill 
                          className="object-cover" 
                          onError={handleImageError}
                          unoptimized={getImageSrc(img).endsWith('.svg')}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Product Info */}
              <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                <div className="flex-grow">
                  {/* Product Title */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {productData?.name}
                  </h2>
                  
                  {/* Category */}
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 block">
                    {productData?.sub_category?.name || 'Category'}
                  </span>
                  
                  {/* Enhanced price display in Quick View */}
                  <div className="mb-4">
                    <WholesalePricingDisplay 
                      product={productData} 
                      size="large"
                      showLabels={true} // Show all details in quick view
                      className="text-blue-600 dark:text-blue-400"
                      hideUnavailableOnUnauthenticated={true}
                      forceShowUnavailable={false}
                      showOnlyPrimaryPrice={false} // Show full details in quick view
                    />
                  </div>
                  
                  {/* Stock Status */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      inStock 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed line-clamp-3">
                    {productData?.description?.replace(/<[^>]*>?/gm, '') || 'No description available.'}
                  </p>
                  
                  {/* Color Selection */}
                  {colors?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                        Color: {selectedColor?.name && <span className="font-normal text-gray-600 dark:text-gray-400">{selectedColor.name}</span>}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {colors.map((color) => (
                          <button 
                            key={color.id} 
                            onClick={() => setSelectedColor(color)} 
                            className={`min-h-[44px] min-w-[44px] w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                              selectedColor?.id === color.id 
                                ? "ring-2 ring-offset-2 ring-blue-500 border-blue-500" 
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                            }`} 
                            style={{ backgroundColor: color.hex_code }}
                            title={color.name}
                            aria-label={`Select ${color.name} color`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Size Selection */}
                  {sizes?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                        Size: {selectedSize?.name && <span className="font-normal text-gray-600 dark:text-gray-400">{selectedSize.name}</span>}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {sizes.map((size) => (
                          <button 
                            key={size.id} 
                            onClick={() => setSelectedSize(size)} 
                            className={`min-h-[44px] px-4 py-3 text-sm rounded-lg border transition-all hover:scale-105 ${
                              selectedSize?.id === size.id 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                            aria-label={`Select size ${size.name}`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  
                </div>
                
                {/* Action Buttons */}
                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <button 
                    onClick={handleAddToCart} 
                    disabled={!inStock} 
                    className="w-full min-h-[48px] py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <LuShoppingCart className="w-5 h-5" />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                  
                  <Link 
                    href={productUrl} 
                    className="text-center min-h-[44px] py-3 px-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors hover:underline flex items-center justify-center"
                    onClick={closeQuickView}
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
