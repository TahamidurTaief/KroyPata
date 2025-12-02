"use client";
import { Badge, Star, Check } from "lucide-react";
import Tk_icon from "../Common/Tk_icon";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "@/app/contexts/AuthContext";
import { WholesalePricingDisplay, useWholesalePricingLogic } from "../Common/WholesalePricingNew";
import { FaStore, FaBox } from 'react-icons/fa';

// This component displays the core product details, including name, price, rating,
// and variant selectors (color, size).
export default function ProductInfo({ product, selectedColor, setSelectedColor, selectedSize, setSelectedSize }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
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
      <nav className="text-sm lato text-[var(--muted-foreground)]">
        <span>Home / </span>
        <span>{product.sub_category?.category?.name || 'Product'} / </span>
        <span className="text-[var(--foreground)] lato font-medium">{product.name}</span>
      </nav>
      
      {/* Main product title */}
      <h1 className="text-xl lg:text-3xl font-semibold text-[var(--foreground)] leading-tight">{product.name}</h1>

      {/* Rating and Shop Info */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={i < Math.round(rating) ? "fill-current" : "text-gray-300"} />
          ))}
          <span className="text-muted-foreground ml-1">({reviewCount} reviews)</span>
        </div>
        <div className="h-4"></div>
        <span className="text-[var(--muted-foreground)]">Shop: <span className="font-medium text-[var(--primary)]">{product.shop?.name}</span></span>
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
          <div className="bg-[var(--primary)]/10 p-4 rounded-lg border border-[var(--primary)]/20">
            <div className="flex items-start gap-2">
              <FaStore className="text-[var(--primary)] text-lg mt-0.5" />
              <div className="text-sm text-[var(--primary)]">
                <span className="font-medium">Wholesale Benefits:</span> 
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Special bulk pricing for your business</li>
                  <li>• Priority customer support</li>
                  <li>• Flexible payment terms available</li>
                  <li>• Volume discounts on larger orders</li>
                </ul>
                {/* Minimum order requirement */}
                {minimumPurchase > 1 && (
                  <div className="mt-2 p-2 bg-orange-500/10 rounded border-l-4 border-orange-500/50">
                    <div className="flex items-center gap-1 text-orange-500">
                      <FaBox className="text-orange-500" size={14} />
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
          <div className="bg-[var(--muted)] p-4 rounded-lg border border-[var(--border)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--muted-foreground)] text-lg">⚠️</span>
              <div className="text-sm text-[var(--foreground)]">
                <span className="font-medium">Wholesale Notice:</span> 
                This product is not available for wholesale pricing. Regular pricing applies.
                <div className="mt-1 text-xs text-[var(--muted-foreground)]">
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
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-[#22c55e]' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${product.stock > 0 ? 'text-[#16a34a]' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>

      {/* Short description */}
      <p className="text-[var(--muted-foreground)] text-base leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />

      {/* See More Button for Landing Page */}
      {product.enable_landing_page && (
        <button
          onClick={() => router.push(`/products/landing/${product.slug}`)}
          className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium text-sm transition-all group mt-2"
        >
          See More Details
          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </button>
      )}

      <div className="my-4"></div>

      {/* Color Selector */}
      {product.colors?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Color: <span className="font-normal text-[var(--muted-foreground)]">{selectedColor?.name || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button 
                key={color.id} 
                onClick={() => setSelectedColor(color)} 
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center
                  ${selectedColor?.id === color.id 
                    ? 'ring-1 ring-offset-2 ring-[var(--primary)] border-transparent' 
                    : 'border-[var(--color-border)] hover:border-[var(--primary)]/50'
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
          <h3 className="font-semibold text-lg">Size: <span className="font-normal text-[var(--muted-foreground)]">{selectedSize?.name || 'N/A'}</span></h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button 
                key={size.id} 
                onClick={() => setSelectedSize(size)} 
                className={`px-3 py-1 rounded-sm lato border-2 font-medium transition-all text-base
                  ${selectedSize?.id === size.id 
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]' 
                    : 'border-[var(--color-border)] bg-[var(--card)] hover:bg-[var(--muted)] hover:border-[var(--primary)]/50'
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
