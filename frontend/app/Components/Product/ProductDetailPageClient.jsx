"use client";
import { useState, useEffect, useMemo } from "react";
import { useMessage } from "@/context/MessageContext";
import { useModal } from "@/app/contexts/ModalContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { useCartContext } from "@/app/contexts/CartContext";
import { motion } from "framer-motion";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import PaymentDetails from "./PaymentDetails";
import ProductTabs from "./ProductTabs";
import { validateMinimumPurchase } from "../Common/WholesalePricingNew";
import RelatedProducts from "./RelatedProducts";
import EnhancedSectionRenderer from "../Common/EnhancedSectionRenderer";
import { getProductBySlug } from "@/app/lib/api";
import { API_BASE_URL } from "@/app/lib/api";
import { initFacebookPixel, trackPixelEvent } from "@/app/utils/facebookPixel";

// This component is the main client-side orchestrator for the product detail page.
// It manages all state and logic, passing props down to the display components.
export default function ProductDetailPageClient({ product: initialProduct }) {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, removeFromCart, isItemInCart } = useCartContext();
  
  // State for product data (will be updated with authenticated data)
  const [product, setProduct] = useState(initialProduct);
  const [isLoadingAuthProduct, setIsLoadingAuthProduct] = useState(false);
  
  // State for selected product variant
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // State for selected product variants (color, size) - kept for backward compatibility
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  
  // State for cart and quantity
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  
  // Initialize selected variant on product load
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const defaultVar = product.variants.find(v => v.is_default && v.is_active) || product.variants.find(v => v.is_active);
      if (defaultVar) {
        setSelectedVariant(defaultVar);
        if (defaultVar.color) setSelectedColor(defaultVar.color);
        if (defaultVar.size) setSelectedSize(defaultVar.size);
      }
    }
  }, [product]);
  
  // Set default quantity based on wholesale user and minimum purchase
  useEffect(() => {
    const minPurchase = selectedVariant?.minimum_purchase || product?.minimum_purchase || 1;
    if (user?.user_type === 'WHOLESALER' && (selectedVariant?.wholesale_price > 0 || product?.wholesale_price > 0)) {
      setQuantity(prevQuantity => prevQuantity < minPurchase ? minPurchase : prevQuantity);
    }
  }, [user?.user_type, selectedVariant, product?.wholesale_price, product?.minimum_purchase]);
  
  // Get message context methods
  const { showSuccess, showError } = useMessage();
  const { showModal } = useModal();

  // Effect to fetch authenticated product data for wholesaler users
  useEffect(() => {
    const fetchAuthenticatedProduct = async () => {
      if (isAuthenticated && user?.user_type === 'WHOLESALER' && !isLoadingAuthProduct) {
        setIsLoadingAuthProduct(true);
        try {
          console.log('🔄 Fetching authenticated product data for wholesaler...');
          const authenticatedProduct = await getProductBySlug(product.slug);
          if (authenticatedProduct && authenticatedProduct.wholesale_price) {
            console.log('✅ Got authenticated product with wholesale price:', authenticatedProduct.wholesale_price);
            setProduct(authenticatedProduct);
          } else {
            console.log('⚠️ No wholesale price in authenticated response');
          }
        } catch (error) {
          console.error('❌ Error fetching authenticated product:', error);
        } finally {
          setIsLoadingAuthProduct(false);
        }
      }
    };

    // Add a small delay to ensure auth is settled
    const timeoutId = setTimeout(fetchAuthenticatedProduct, 100);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user?.user_type, product.slug, isLoadingAuthProduct]);

  // A unique ID for the product variant to manage cart state accurately
  const variantId = selectedVariant?.id || `${product.id}-${selectedColor?.id || 'c'}-${selectedSize?.id || 's'}`;

  // Effect to check if the current product variant is in the cart on load or when variants change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInCart(isItemInCart(variantId));
    }
  }, [variantId]);

  // Effect to listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      if (typeof window !== 'undefined') {
        setIsInCart(isItemInCart(variantId));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', handleCartUpdate);
      window.addEventListener('storage', handleCartUpdate);
      
      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
        window.removeEventListener('storage', handleCartUpdate);
      };
    }
  }, [variantId]);

  // Facebook Pixel: Load pixel conditionally based on product configuration
  useEffect(() => {
    const loadPixel = async () => {
      if (!product?.slug || typeof window === 'undefined') return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/products/${product.slug}/pixel-verify/`);
        if (!response.ok) return;
        
        const pixelConfig = await response.json();
        
        if (pixelConfig.pixel_enabled && pixelConfig.pixel_id && pixelConfig.verification_token) {
          initFacebookPixel(pixelConfig.pixel_id);
          
          const effectiveProduct = selectedVariant || product;
          trackPixelEvent('ViewContent', {
            content_ids: [effectiveProduct.id || product.id],
            content_type: 'product',
            content_name: product.name,
            value: effectiveProduct.price || product.price,
            currency: 'BDT'
          });
        }
      } catch (error) {
        console.error('Pixel load error:', error);
      }
    };
    
    loadPixel();
  }, [product?.slug, selectedVariant]);

  // Handler to add the selected product variant to the cart
  const handleAddToCart = () => {
    // Validate variant selection if product has variants
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      showError('Please select a variant before adding to cart', 'Variant Required');
      showModal({
        status: 'error',
        title: 'Variant Selection Required',
        message: 'Please select a product variant (color, size, etc.) before adding to cart.',
        primaryActionText: 'OK'
      });
      return;
    }
    
    // Use variant data if available
    const productData = selectedVariant ? { ...product, ...selectedVariant } : product;
    const validation = validateMinimumPurchase(productData, quantity, user);
    
    // If validation fails for wholesale users, show error
    if (!validation.isValid && user?.user_type === 'WHOLESALER' && product?.wholesale_price > 0) {
      showError(validation.message, 'Minimum Order Not Met');
      
      showModal({
        status: 'error',
        title: 'Minimum Order Required',
        message: `${validation.message}\n\nPlease increase your quantity to at least ${validation.minimumRequired} units to proceed with wholesale pricing.`,
        primaryActionText: 'OK'
      });
      return;
    }
    
    // Track AddToCart event
    const effectiveProduct = selectedVariant || product;
    trackPixelEvent('AddToCart', {
      content_ids: [effectiveProduct.id || product.id],
      content_type: 'product',
      content_name: product.name,
      value: (effectiveProduct.price || product.price) * quantity,
      currency: 'BDT'
    });
    
    const result = addToCart(product, {
      quantity,
      selectedColor,
      selectedSize,
      variantId: selectedVariant?.id || variantId,
      variant: selectedVariant,
      user
    });
    
    if (result.success) {
      setIsInCart(true);
      
      // Show both message context (for immediate feedback) and modal (for user action)
      showSuccess(`${product.name} added to cart!`, 'Added to Cart');
      
      showModal({
        status: 'success',
        title: 'Added to Cart!',
        message: `${product.name} has been successfully added to your cart.`,
        primaryActionText: 'View Cart',
        onPrimaryAction: () => { window.location.href = '/cart'; },
        secondaryActionText: 'continue '
      });
    } else {
      showError(result.error || 'Failed to add item to cart', 'Error');
      
      showModal({
        status: 'error',
        title: 'Error',
        message: `Failed to add ${product.name} to cart. Please try again.`,
        primaryActionText: 'OK'
      });
    }
  };

  // Handler to remove the product variant from the cart
  const handleRemoveFromCart = () => {
    const result = removeFromCart(variantId);
    
    if (result.success) {
      setIsInCart(false);
      showSuccess(`${product.name} removed from cart`, 'Removed from Cart');
      
      showModal({
        status: 'success',
        title: 'Removed from Cart',
        message: `${product.name} has been removed from your cart.`,
        primaryActionText: 'OK'
      });
    } else {
      showError(result.error || 'Failed to remove item from cart', 'Error');
      
      showModal({
        status: 'error',
        title: 'Error',
        message: `Failed to remove ${product.name} from cart. Please try again.`,
        primaryActionText: 'OK'
      });
    }
  };

  // Handler for Buy Now button
  const handleBuyNow = () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      showError('Please login to continue', 'Login Required');
      showModal({
        status: 'error',
        title: 'Login Required',
        message: 'Please login to proceed with your purchase.',
        primaryActionText: 'Login',
        onPrimaryAction: () => { window.location.href = '/login'; },
        secondaryActionText: 'Cancel'
      });
      return;
    }

    // Validate variant selection if product has variants
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      showError('Please select a variant before proceeding', 'Variant Required');
      showModal({
        status: 'error',
        title: 'Variant Selection Required',
        message: 'Please select a product variant (color, size, etc.) before proceeding to checkout.',
        primaryActionText: 'OK'
      });
      return;
    }

    const productData = selectedVariant ? { ...product, ...selectedVariant } : product;
    const validation = validateMinimumPurchase(productData, quantity, user);
    
    if (!validation.isValid && user?.user_type === 'WHOLESALER' && product?.wholesale_price > 0) {
      showError(validation.message, 'Minimum Order Not Met');
      showModal({
        status: 'error',
        title: 'Minimum Order Required',
        message: `${validation.message}\n\nPlease increase your quantity to at least ${validation.minimumRequired} units to proceed with wholesale pricing.`,
        primaryActionText: 'OK'
      });
      return;
    }

    const effectivePrice = selectedVariant ? (
      user?.user_type === 'WHOLESALER' && selectedVariant.wholesale_price > 0
        ? parseFloat(selectedVariant.wholesale_price)
        : parseFloat(selectedVariant.discount_price) || parseFloat(selectedVariant.price)
    ) : (
      user?.user_type === 'WHOLESALER' && product?.wholesale_price > 0
        ? parseFloat(product.wholesale_price)
        : parseFloat(product.discount_price) || parseFloat(product.price) || 0
    );
    
    const buyNowItem = {
      product_id: product.id,
      productId: product.id,
      id: product.id,
      variant_id: selectedVariant?.id || null,
      name: product.name,
      price: effectivePrice,
      unit_price: effectivePrice,
      quantity: quantity,
      image: product.thumbnail_url || product.image_url || product.image || '',
      slug: product.slug,
      stock: selectedVariant?.stock || product.stock,
      color_id: selectedColor?.id || null,
      selectedColor: selectedColor,
      size_id: selectedSize?.id || null,
      selectedSize: selectedSize,
      variantId: selectedVariant?.id || variantId
    };

    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    
    // Navigate to checkout
    window.location.href = '/checkout';
  };
  
  // Memoize the list of all product images to prevent unnecessary recalculations
  const allImages = useMemo(() => {
    // Use variant images if available, otherwise product images
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images.map(img => img.image).filter(Boolean);
    }
    return [product.thumbnail_url, ...(product.additional_images?.map(img => img.image) || [])].filter(Boolean);
  }, [product, selectedVariant]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      {/* Main product section with a 3-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <motion.div 
          className="lg:col-span-4"
          variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
        >
          <ImageGallery images={allImages} productName={product.name} />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-5"
          variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
        >
          <ProductInfo 
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
          />
        </motion.div>

        <motion.div 
          className="lg:col-span-3"
          variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
        >
          <PaymentDetails
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            setSelectedColor={setSelectedColor}
            setSelectedSize={setSelectedSize}
            quantity={quantity}
            setQuantity={setQuantity}
            isInCart={isInCart}
            handleAddToCart={handleAddToCart}
            handleRemoveFromCart={handleRemoveFromCart}
            handleBuyNow={handleBuyNow}
          />
        </motion.div>
      </div>

      {/* Product tabs section, appears below the main 3-column section */}
      <motion.div 
        className="mt-12 lg:mt-16"
        variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } } }}
      >
        <ProductTabs product={product} />
      </motion.div>

      {/* Related Products section */}
      <RelatedProducts product={product} />
      
      {/* Dynamic Sections for Product Detail Page */}
      <EnhancedSectionRenderer page="product_detail" />
    </motion.div>
  );
}
