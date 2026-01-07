"use client";
import { useEffect } from "react";
import { Plus, Minus, Check, Store } from "lucide-react";
import Tk_icon from "../Common/Tk_icon";
import { useWholesalePricingLogic, validateMinimumPurchase } from "../Common/WholesalePricingNew";
import { useAuth } from "@/app/contexts/AuthContext";

// This component provides the order action panel. It now focuses on quantity
// and the primary add-to-cart action, with shipping removed for a cleaner flow.
export default function PaymentDetails({ 
  product,
  selectedVariant,
  setSelectedVariant,
  setSelectedColor,
  setSelectedSize,
  quantity, 
  setQuantity, 
  isInCart, 
  handleAddToCart, 
  handleRemoveFromCart,
  handleBuyNow,
  handlePreorderNow
}) {
  const { user } = useAuth();
  const effectiveProduct = selectedVariant ? { ...product, ...selectedVariant } : product;
  const { isUsingWholesalePrice, minimumPurchase } = useWholesalePricingLogic(effectiveProduct);
  
  // Check if product is preorder-only (stock === 0 for variant)
  const variantStock = selectedVariant ? (selectedVariant.stock || 0) : (product.stock || 0);
  const isPreorderOnly = variantStock === 0;
  const inStock = variantStock > 0 && effectiveProduct.is_active && !isPreorderOnly;
  
  // Ensure a default variant is selected on mount if none is provided
  useEffect(() => {
    if (!selectedVariant && product?.variants && product.variants.length > 0) {
      const defaultVar = product.variants.find(v => v.is_default && v.is_active) || product.variants.find(v => v.is_active);
      if (defaultVar) {
        if (setSelectedVariant) setSelectedVariant(defaultVar);
        if (setSelectedColor && defaultVar.color) setSelectedColor(defaultVar.color);
        if (setSelectedSize && defaultVar.size) setSelectedSize(defaultVar.size);
      }
    }
  }, [product, selectedVariant, setSelectedVariant, setSelectedColor, setSelectedSize]);

  // Use wholesale price if available and user is wholesaler
  const price = isUsingWholesalePrice 
    ? parseFloat(effectiveProduct.wholesale_price) 
    : parseFloat(effectiveProduct.discount_price) || parseFloat(effectiveProduct.price) || 0;
  const subtotal = price * quantity;
  
  // Validate minimum purchase requirements
  const minimumPurchaseValidation = validateMinimumPurchase(effectiveProduct, quantity, user);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const minQuantity = isUsingWholesalePrice ? minimumPurchase : 1;
    if (newQuantity >= minQuantity && newQuantity <= (effectiveProduct.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-[var(--card)] p-6 rounded-xl shadow-lg sticky top-24">
      <div className="space-y-4">
        {/* Variant Selection - Simple, Clean, Focused Design */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-base text-[var(--foreground)]">Select Variant</h4>
              <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full">Required</span>
            </div>
            <div className="space-y-2.5">
              {product.variants
                .filter(v => v.is_active)
                .sort((a, b) => {
                  // Sort by: 1) default first, 2) in stock, 3) name
                  if (a.is_default && !b.is_default) return -1;
                  if (!a.is_default && b.is_default) return 1;
                  if (a.stock > 0 && b.stock <= 0) return -1;
                  if (a.stock <= 0 && b.stock > 0) return 1;
                  const nameA = `${a.color?.name || ''} ${a.size?.name || ''}`.trim();
                  const nameB = `${b.color?.name || ''} ${b.size?.name || ''}`.trim();
                  return nameA.localeCompare(nameB);
                })
                .map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isOutOfStock = variant.stock <= 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (setSelectedVariant) setSelectedVariant(variant);
                        if (setSelectedColor && variant.color) setSelectedColor(variant.color);
                        if (setSelectedSize && variant.size) setSelectedSize(variant.size);
                        const isWholesaler = user?.user_type === 'WHOLESALER';
                        const minQ = isWholesaler ? (variant.minimum_purchase || product.minimum_purchase || 1) : 1;
                        if (quantity < minQ) setQuantity(minQ);
                      }}
                      className={`w-full p-3.5 rounded-xl border-2 transition-all duration-200 text-left relative
                        ${isSelected 
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md' 
                          : isOutOfStock
                            ? 'bg-[var(--muted)]/50 border-[var(--border)] opacity-60 cursor-not-allowed'
                            : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)] hover:shadow-sm'
                        }`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <Check size={16} className="text-white" strokeWidth={3} />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 pr-7">
                        <div className="flex-1 min-w-0">
                          {/* Variant name with color indicator */}
                          <div className="flex items-center gap-2 mb-1.5">
                            {variant.color && (
                              <div 
                                className={`w-4 h-4 rounded-full border-2 shadow-sm flex-shrink-0 ${isSelected ? 'border-white' : 'border-gray-300'}`}
                                style={{ backgroundColor: variant.color.hex_code }}
                                title={variant.color.name}
                              />
                            )}
                            <span className={`font-semibold text-sm leading-tight ${
                              isSelected ? 'text-white' : 'text-[var(--foreground)]'
                            }`}>
                              {variant.color?.name}{variant.color && variant.size && ' • '}{variant.size?.name}
                            </span>
                          </div>
                          
                          {/* Price and stock info */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={`flex items-center gap-1 font-bold text-base ${
                              isSelected ? 'text-white' : 'text-[var(--primary)]'
                            }`}>
                              <Tk_icon size={14} className={isSelected ? 'text-white' : 'text-[var(--primary)]'} />
                              <span>{(variant.discount_price || variant.price).toLocaleString()}</span>
                            </div>
                            
                            {/* Stock badge */}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isSelected 
                                ? 'bg-white/20 text-white' 
                                : variant.stock > 0 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-red-500/10 text-red-600'
                            }`}>
                              {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              }
            </div>
          </div>
        )} 

        {/* Availability Status */}
        {isPreorderOnly ? (
          <div className="text-sm font-bold py-2 px-3 rounded-md text-center bg-blue-500/10 text-blue-600">
            ⏰ Available for Preorder • Ships in 25–30 days
          </div>
        ) : (
          <div className={`text-sm font-bold py-2 px-3 rounded-md text-center ${inStock ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {inStock ? `✓ In Stock (${variantStock} available)` : '✗ Out of Stock'}
          </div>
        )}

        {/* Quantity Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-md">Quantity:</h3>
            {isUsingWholesalePrice && minimumPurchase > 1 && (
              <span className="text-xs text-orange-500 font-medium">
                Min: {minimumPurchase}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg p-2">
            <button 
              onClick={() => handleQuantityChange(-1)} 
              className="p-2 rounded-md hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={quantity <= (isUsingWholesalePrice ? minimumPurchase : 1)}
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-lg w-12 text-center">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(1)} 
              className="p-2 rounded-md hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!isPreorderOnly && quantity >= (variantStock || 99)}
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Show minimum purchase validation */}
          {isUsingWholesalePrice && !minimumPurchaseValidation.isValid && (
            <div className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded">
              {minimumPurchaseValidation.message}
            </div>
          )}
        </div>
      </div>

      <div className="my-5"></div>

      {/* Simplified Order Summary */}
      <div className="space-y-2 text-md">
        <div className="flex justify-between font-bold text-xl text-[var(--foreground)]">
          <span>Subtotal</span>
          <span className={`flex items-baseline gap-1 ${isUsingWholesalePrice ? 'text-blue-500' : 'text-[var(--primary)]'}`}>
            <Tk_icon size={20} className={isUsingWholesalePrice ? 'text-blue-500' : 'text-[var(--primary)]'} />
            {subtotal.toFixed(2)}
          </span>
        </div>
        
        {/* Show pricing type badge */}
        {isUsingWholesalePrice && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Price Type:</span>
            <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Store size={10} />
              Wholesale
            </span>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {isPreorderOnly ? (
          <>
            <button 
              onClick={handlePreorderNow}
              className="w-full font-semibold py-3 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            >
              Preorder Now
            </button>
            <p className="text-xs text-center text-[var(--muted-foreground)] leading-relaxed">
              This item is imported from China and will be delivered within 25–30 days after order confirmation.
            </p>
          </>
        ) : (
          <>
            <button 
              onClick={isInCart ? handleRemoveFromCart : handleAddToCart} 
              disabled={!inStock || (isUsingWholesalePrice && !minimumPurchaseValidation.isValid)} 
              className={`w-full font-semibold py-2 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                ${isInCart 
                  ? 'bg-red-500 text-white hover:bg-red-500' 
                  : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90'
                }`}
            >
              {!inStock 
                ? 'Out of Stock'
                : (isUsingWholesalePrice && !minimumPurchaseValidation.isValid)
                  ? `Need ${minimumPurchaseValidation.shortage} More Units`
                  : (isInCart ? 'Remove from Cart' : 'Add to Cart')
              }
            </button>
            
            {/* Buy Now Button */}
            <button 
              onClick={handleBuyNow} 
              disabled={!inStock || (isUsingWholesalePrice && !minimumPurchaseValidation.isValid)} 
              className="w-full font-semibold py-2 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 bg-orange-500 text-white hover:bg-orange-600"
            >
              {!inStock 
                ? 'Out of Stock'
                : (isUsingWholesalePrice && !minimumPurchaseValidation.isValid)
                  ? `Need ${minimumPurchaseValidation.shortage} More Units`
                  : 'Buy Now'
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
}
