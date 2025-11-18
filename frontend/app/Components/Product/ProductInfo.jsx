"use client";
import { Star, Check } from "lucide-react";
import Tk_icon from "../Common/Tk_icon";
import { useAuth } from "@/app/contexts/AuthContext";
import { WholesalePricingDisplay, useWholesalePricingLogic } from "../Common/WholesalePricingNew";
import { FaStore, FaBox } from 'react-icons/fa';

// This component displays the core product details, including name, price, rating,
// and variant selectors (color, size).
export default function ProductInfo({ product, selectedColor, setSelectedColor, selectedSize, setSelectedSize }) {
  const { user, isAuthenticated } = useAuth();
  
  // Debug the product data
  console.log('🔍 ProductInfo Debug:', {
    productName: product?.name,
    wholesalePrice: product?.wholesale_price,
    userType: user?.user_type,
    isAuthenticated,
    fullProduct: product
  });
  
  // Use the new wholesale pricing logic
  const {
    isApprovedWholesaler,
    showWholesaleUnavailable,
    isUsingWholesalePrice,
    hasWholesalePrice,
    minimumPurchase
  } = useWholesalePricingLogic(product);
  
  const rating = product.rating || 4.5; // Default rating if none provided
  const reviewCount = product.review_count || 0;

  // Function to smoothly scroll to the reviews tab
  const scrollToReviews = (e) => {
    e.preventDefault();
    const tabsElement = document.getElementById('product-tabs');
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: 'smooth' });
      // Optionally, you could also programmatically click the reviews tab here
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Breadcrumbs for navigation context */}
      <nav className="text-sm lato text-[var(--color-text-secondary)]">
        <span>Home / </span>
        <span>{product.sub_category?.category?.name || 'Product'} / </span>
        <span className="text-[var(--color-text-primary)] lato font-medium">{product.name}</span>
      </nav>
      
      {/* Main product title */}
      <h1 className="text-xl lg:text-3xl font-semibold text-[var(--color-foreground)] leading-tight">{product.name}</h1>

      {/* Rating and Shop Info */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={i < Math.round(rating) ? "fill-current" : "text-gray-300"} />
          ))}
          <span className="text-muted-foreground ml-1">({reviewCount} reviews)</span>
        </div>
        <div className="h-4"></div>
        <span className="text-muted-foreground">Shop: <span className="font-medium text-primary">{product.shop?.name}</span></span>
      </div>

      {/* Enhanced pricing section with wholesale logic */}
      <div className="flex flex-col gap-3 pt-2">
        {/* Use the new wholesale pricing display */}
        <WholesalePricingDisplay 
          product={product} 
          size="large"
          showLabels={true}
          forceShowUnavailable={true} // Show unavailable message on product detail page
          hideUnavailableOnUnauthenticated={false}
        />
        
        {/* Wholesale benefits notice */}
        {isUsingWholesalePrice && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-2">
              <FaStore className="text-blue-600 dark:text-blue-400 text-lg mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Wholesale Benefits:</span> 
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Special bulk pricing for your business</li>
                  <li>• Priority customer support</li>
                  <li>• Flexible payment terms available</li>
                  <li>• Volume discounts on larger orders</li>
                </ul>
                {/* Minimum order requirement */}
                {minimumPurchase > 1 && (
                  <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded border-l-4 border-orange-400">
                    <div className="flex items-center gap-1 text-orange-800 dark:text-orange-200">
                      <FaBox className="text-orange-600" size={14} />
                      <span className="text-xs font-medium">
                        Minimum Order: {minimumPurchase} units required for wholesale pricing
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Not available for wholesale notice */}
        {showWholesaleUnavailable && (
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-gray-600 dark:text-gray-400 text-lg">⚠️</span>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Wholesale Notice:</span> 
                This product is not available for wholesale pricing. Regular pricing applies.
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Contact support for custom bulk pricing inquiries.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Info */}
      <div className="flex flex-col gap-3 py-4">
        {/* Stock Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Stock:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>

      {/* Short description */}
      <p className="text-muted-foreground text-base leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />

      <div className="my-4"></div>

      {/* Color Selector */}
      {product.colors?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Color: <span className="font-normal text-muted-foreground">{selectedColor?.name || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button 
                key={color.id} 
                onClick={() => setSelectedColor(color)} 
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center
                  ${selectedColor?.id === color.id 
                    ? 'ring-1 ring-offset-2 ring-primary border-transparent' 
                    : 'border-border hover:border-primary/50'
                  }`} 
                style={{ backgroundColor: color.hex_code }} 
                title={color.name}
              >
                {selectedColor?.id === color.id && <Check size={20} className="text-white mix-blend-difference" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {product.sizes?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Size: <span className="font-normal text-muted-foreground">{selectedSize?.name || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button 
                key={size.id} 
                onClick={() => setSelectedSize(size)} 
                className={`px-3 py-1 rounded-sm lato border-2 font-medium transition-all text-base
                  ${selectedSize?.id === size.id 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-border bg-[var(--color-surface)] hover:bg-[var(--color-second-bg)] hover:border-primary/50'
                  }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
