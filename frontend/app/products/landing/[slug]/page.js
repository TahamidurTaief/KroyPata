'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Tk_icon from '@/app/Components/Common/Tk_icon';
import { API_BASE_URL } from '@/app/lib/api';
import { initFacebookPixel, trackPixelEvent } from '@/app/utils/facebookPixel';
import './landing.css';

export default function ProductLandingPage() {
  const params = useParams();
  const router = useRouter();
  // Ensure we have a usable API base URL on the client — fall back to local dev server
  const API_BASE = API_BASE_URL;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    detailed_address: '',
    quantity: 1,
    customer_notes: ''
  });

  // Update page metadata dynamically
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - iCommerce`;
      
      // Update meta tags
      const updateMetaTag = (name, content, isProperty = false) => {
        const attribute = isProperty ? 'property' : 'name';
        let element = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attribute, name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };
      
      const description = product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Buy ${product.name} at the best price`;
      updateMetaTag('description', description);
      updateMetaTag('keywords', `${product.name}, ${product.brand?.name || ''}, ${product.sub_category?.name || ''}, online shopping, Bangladesh`);
      updateMetaTag('og:title', product.name, true);
      updateMetaTag('og:description', description, true);
      updateMetaTag('og:image', product.thumbnail_url, true);
      updateMetaTag('og:type', 'product', true);
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', product.name);
      updateMetaTag('twitter:description', description);
      updateMetaTag('twitter:image', product.thumbnail_url);
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${window.location.origin}/products/landing/${product.slug}`);
    }
  }, [product]);

  useEffect(() => {
    console.log('Landing page mounted, params:', params);
    if (params.slug) {
      fetchProduct();
      checkUser();
    } else {
      console.error('No slug in params');
    }
  }, [params.slug]);

  // Facebook Pixel: Load pixel conditionally for landing page
  useEffect(() => {
    const loadPixel = async () => {
      if (!product?.slug || typeof window === 'undefined') return;
      
      try {
        const response = await fetch(`${API_BASE}/api/products/products/${product.slug}/pixel-verify/`);
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
    
    if (product) {
      loadPixel();
    }
  }, [product?.slug, selectedVariant]);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetch(`${API_BASE}/api/users/me/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            full_name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const fetchProduct = async () => {
    if (!params.slug) {
      console.error('No slug provided');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      console.log('Fetching product with slug:', params.slug);

      const response = await fetch(
        `${API_BASE}/api/products/products/${params.slug}/`,
        { headers }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Product not found (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Product data fetched:', data);
      
      // Check if landing page is enabled - show warning but still display the page
      if (!data.enable_landing_page) {
        console.warn('Landing page is not enabled for this product, showing basic product page');
        // Don't redirect, just show the product with available information
      }
      
      setProduct(data);
      
      // Initialize selected variant
      if (data.variants && data.variants.length > 0) {
        const defaultVar = data.variants.find(v => v.is_default && v.is_active) || data.variants.find(v => v.is_active);
        if (defaultVar) {
          setSelectedVariant(defaultVar);
          // Set minimum quantity for wholesalers based on variant
          if (data._user_context?.is_approved_wholesaler && defaultVar.minimum_purchase) {
            setFormData(prev => ({ ...prev, quantity: defaultVar.minimum_purchase }));
          }
        }
      } else {
        // Set minimum quantity for wholesalers from product
        if (data._user_context?.is_approved_wholesaler && data.minimum_purchase) {
          setFormData(prev => ({ ...prev, quantity: data.minimum_purchase }));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(error.message || 'Failed to load product');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (delta) => {
    const effectiveProduct = selectedVariant || product;
    const isWholesaler = product?._user_context?.is_approved_wholesaler;
    const minPurchase = isWholesaler ? (effectiveProduct?.minimum_purchase || 1) : 1;
    
    setFormData(prev => {
      const newQuantity = Math.max(minPurchase, prev.quantity + delta);
      return { ...prev, quantity: Math.min(newQuantity, effectiveProduct?.stock || 999) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.detailed_address) {
      toast.error('অনুগ্রহ করে সব তথ্য পূরণ করুন');
      return;
    }
    
    // Validate variant selection if product has variants
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error('অনুগ্রহ করে একটি ভ্যারিয়েন্ট নির্বাচন করুন');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      
      const orderData = {
        product: product.id,
        variant: selectedVariant?.id || null,
        quantity: formData.quantity,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        detailed_address: formData.detailed_address,
        customer_notes: formData.customer_notes || ''
      };
      
      console.log('Submitting order:', orderData);
      console.log('API URL:', `${API_BASE}/api/products/landing-orders/`);
      
      // Track Lead/Purchase event
      const effectiveProduct = selectedVariant || product;
      trackPixelEvent('Lead', {
        content_ids: [effectiveProduct.id || product.id],
        content_name: product.name,
        content_type: 'product',
        value: getTotalPrice(),
        currency: 'BDT',
        predicted_ltv: getTotalPrice()
      });
      
      const response = await fetch(`${API_BASE}/api/products/landing-orders/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (!response.ok) {
        // Handle validation errors
        if (result.error) {
          throw new Error(result.error);
        }
        // Handle field-specific errors
        if (typeof result === 'object') {
          const errors = Object.entries(result)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('\n');
          throw new Error(errors || 'অর্ডার করতে সমস্যা হয়েছে');
        }
        throw new Error('অর্ডার করতে সমস্যা হয়েছে');
      }
      
      toast.success(`অর্ডার সফল হয়েছে! অর্ডার #${result.order_number}`);
      
      // Store order data in sessionStorage for confirmation page
      sessionStorage.setItem('landingOrderConfirmation', JSON.stringify({
        order_number: result.order_number,
        product_name: product.name,
        product_slug: product.slug,
        quantity: formData.quantity,
        unit_price: result.unit_price,
        total_price: result.total_price,
        status: result.status,
        email: formData.email,
        phone: formData.phone
      }));
      
      // Redirect to landing confirmation page after a short delay
      setTimeout(() => {
        router.push('/products/landing/confirmation');
      }, 1500);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayPrice = () => {
    if (!product) return 0;
    
    const effectiveProduct = selectedVariant || product;
    const isWholesaler = product._user_context?.is_approved_wholesaler;
    
    if (isWholesaler && effectiveProduct.wholesale_price) {
      return effectiveProduct.wholesale_price;
    }
    
    return effectiveProduct.discount_price || effectiveProduct.price;
  };

  const getTotalPrice = () => {
    return getDisplayPrice() * formData.quantity;
  };

  // Get all images (variant images if selected, otherwise product images)
  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    
    // Use variant images if available
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      images.push(...selectedVariant.images.map(img => img.image));
    } else {
      // Fallback to product images
      if (product.thumbnail_url) images.push(product.thumbnail_url);
      if (product.additional_images) {
        images.push(...product.additional_images.map(img => img.image));
      }
    }
    return images;
  };

  const openLightbox = (imgSrc) => {
    setLightboxImage(imgSrc);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
  };

  if (loading) {
    return (
      <div className="landing-page-container">
        <div className="container">
          <div className="landing-page-content">
            {/* Left Side Skeleton */}
            <div className="product-section">
              {/* Image Skeleton */}
              <div className="skeleton-box" style={{ height: '400px', marginBottom: '1rem' }}></div>
              {/* Info Skeleton */}
              <div className="skeleton-box" style={{ height: '150px', marginBottom: '1rem' }}></div>
              {/* Description Skeleton */}
              <div className="skeleton-box" style={{ height: '200px', marginBottom: '1rem' }}></div>
              <div className="skeleton-box" style={{ height: '200px' }}></div>
            </div>
            
            {/* Right Side Skeleton */}
            <div className="checkout-section">
              <div className="skeleton-box" style={{ height: '600px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="landing-page-container">
        <div className="error-message">
          <h2>পণ্য পাওয়া যায়নি</h2>
          <p>দুঃখিত, এই পণ্যটি বর্তমানে উপলব্ধ নয়।</p>
          <button onClick={() => router.push('/products')} className="back-btn">
            অন্যান্য পণ্য দেখুন
          </button>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();
  const effectiveProduct = selectedVariant || product;
  const isWholesaler = product._user_context?.is_approved_wholesaler;
  const minPurchase = isWholesaler ? (effectiveProduct.minimum_purchase || 1) : 1;

  return (
    <div className="landing-page-container">
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
            <Image 
              src={lightboxImage} 
              alt="Zoomed Product" 
              width={1000} 
              height={1000} 
              className="lightbox-img"
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </div>
        </div>
      )}

      <div className="container">
        {!product.enable_landing_page && (
          <div className="info-banner modern-box">
            <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
            <p>এই পণ্যটি দ্রুত অর্ডারের জন্য উপলব্ধ। ডানদিকের ফর্মটি পূরণ করে অর্ডার করুন।</p>
          </div>
        )}
        
        <div className="landing-page-content">
        
        {/* Left Side - Product Details */}
        <div className="product-section">
          
          {/* Product Images Gallery */}
          <div className="product-gallery-section modern-box">
            {/* <div className="decorative-shape shape-1"></div> */}
            {/* <div className="decorative-shape shape-2"></div> */}
            <h2 className="section-title-shape">পণ্যের ছবি</h2>
            <div className="image-gallery-grid">
              {allImages.length > 0 ? (
                allImages.map((img, index) => (
                  <div 
                    key={index} 
                    className="gallery-item"
                    onClick={() => openLightbox(img)}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      width={400}
                      height={400}
                      className="gallery-image"
                    />
                    <div className="zoom-icon">🔍</div>
                  </div>
                ))
              ) : (
                <div className="no-image">কোন ছবি নেই</div>
              )}
            </div>
          </div>

{/* Variant selection moved to the Order Summary (checkout form) for a streamlined flow */}

          {/* Product Info */}
          <div className="product-info modern-box section-bg-1">
            {/* <div className="decorative-shape shape-3"></div> */}
            <h1 className="product-title">{product.name}</h1>
            
            {product.brand && (
              <div className="product-brand">
                <span className="label">ব্র্যান্ড:</span>
                <span className="value">{product.brand.name}</span>
              </div>
            )}
            
            <div className="product-price">
              <span className="price-label">মূল্য:</span>
              <span className="price-value">
                {Tk_icon && <Tk_icon size={20} className="mr-1" />}
                {getDisplayPrice().toLocaleString()}
              </span>
              {isWholesaler && product.wholesale_price && (
                <span className="wholesale-badge">পাইকারি মূল্য</span>
              )}
            </div>
            
            {effectiveProduct.stock > 0 ? (
              <div className="stock-status in-stock">
                <span className="status-icon">✓</span>
                <span>স্টকে আছে ({effectiveProduct.stock} টি)</span>
              </div>
            ) : (
              <div className="stock-status out-of-stock">
                <span className="status-icon">✗</span>
                <span>স্টক আউট</span>
              </div>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="product-description modern-box section-bg-2">
              {/* <div className="decorative-shape shape-4"></div> */}
              <h2 className="section-title-shape">পণ্যের বিবরণ</h2>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Landing Page Sections */}
          {product.landing_features && product.landing_features.trim() !== '' && (
            <div className="landing-section modern-box section-bg-3">
              {/* <div className="decorative-shape shape-1"></div> */}
              <h2 className="section-title-shape">আমাদের বৈশিষ্ট্যসমূহ</h2>
              <div dangerouslySetInnerHTML={{ __html: product.landing_features }} />
            </div>
          )}

          {product.landing_how_to_use && product.landing_how_to_use.trim() !== '' && (
            <div className="landing-section modern-box section-bg-1">
              {/* <div className="decorative-shape shape-2"></div> */}
              <h2 className="section-title-shape">ব্যবহারের নিয়ম</h2>
              <div dangerouslySetInnerHTML={{ __html: product.landing_how_to_use }} />
            </div>
          )}

          {product.landing_why_choose && product.landing_why_choose.trim() !== '' && (
            <div className="landing-section modern-box section-bg-2">
              {/* <div className="decorative-shape shape-3"></div> */}
              <h2 className="section-title-shape">কেন এই পণ্যটি কিনবেন?</h2>
              <div dangerouslySetInnerHTML={{ __html: product.landing_why_choose }} />
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="specifications modern-box section-bg-3">
              {/* <div className="decorative-shape shape-4"></div> */}
              <h2 className="section-title-shape">স্পেসিফিকেশন</h2>
              <table className="spec-table">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index}>
                      <td className="spec-name">{spec.name}</td>
                      <td className="spec-value">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="reviews-section modern-box section-bg-1">
            {/* <div className="decorative-shape shape-1"></div> */}
            <h2 className="section-title-shape">কাস্টমার রিভিউ</h2>
            <div className="reviews-grid">
              <div className="review-card">
                <div className="review-header">
                  <div className="reviewer-avatar">র</div>
                  <div className="reviewer-info">
                    <h4>রহিম উদ্দিন</h4>
                    <div className="stars">★★★★★</div>
                  </div>
                </div>
                <p className="review-text">খুবই ভালো মানের পণ্য। ডেলিভারি খুব ফাস্ট ছিল। ধন্যবাদ!</p>
              </div>
              <div className="review-card">
                <div className="review-header">
                  <div className="reviewer-avatar">ক</div>
                  <div className="reviewer-info">
                    <h4>করিম আহমেদ</h4>
                    <div className="stars">★★★★★</div>
                  </div>
                </div>
                <p className="review-text">যেমনটা ছবিতে দেখেছি ঠিক তেমনটাই পেয়েছি। আমি সন্তুষ্ট।</p>
              </div>
              <div className="review-card">
                <div className="review-header">
                  <div className="reviewer-avatar">স</div>
                  <div className="reviewer-info">
                    <h4>সুমাইয়া আক্তার</h4>
                    <div className="stars">★★★★☆</div>
                  </div>
                </div>
                <p className="review-text">প্রোডাক্ট কোয়ালিটি ভালো, তবে প্যাকেজিং আরও ভালো হতে পারতো।</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side - Checkout Form */}
        <div className="checkout-section">
          <div className="checkout-card modern-box sticky-form">
            {/* <div className="decorative-shape shape-2"></div> */}
            <h2 className="checkout-title section-title-shape py-1 px-3">অর্ডার করতে ফর্মটি পূরণ করুন</h2>
            
            {isWholesaler && (
              <div className="wholesaler-info">
                <p className="wholesaler-badge-large">পাইকারি ক্রেতা</p>
                <p className="min-purchase-info">
                  সর্বনিম্ন ক্রয়: {minPurchase} টি
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="checkout-form">
              
              {/* Variant Selection - Modern & Focused */}
              {product.variants && product.variants.length > 0 && (
                <div className="form-group">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-base">ভ্যারিয়েন্ট নির্বাচন করুন *</label>
                    <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full">আবশ্যক</span>
                  </div>
                  <div className="space-y-2.5">
                    {product.variants
                      .filter(v => v.is_active)
                      .sort((a, b) => {
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
                            disabled={isOutOfStock}
                            onClick={() => {
                              setSelectedVariant(variant);
                              const minQ = isWholesaler ? (variant.minimum_purchase || 1) : 1;
                              if (formData.quantity < minQ) {
                                setFormData(prev => ({ ...prev, quantity: minQ }));
                              }
                            }}
                            className={`w-full p-3.5 rounded-xl border-2 transition-all duration-200 text-left relative
                              ${isSelected 
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md' 
                                : isOutOfStock
                                  ? 'bg-[var(--muted)]/50 border-[var(--border)] opacity-60 cursor-not-allowed'
                                  : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)] hover:shadow-sm'
                              }`}
                          >
                            {/* Selection Check Mark */}
                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}

                            <div className="flex items-start justify-between gap-2 pr-7">
                              <div className="flex-1 min-w-0">
                                {/* Variant Name with Color Dot */}
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
                                
                                {/* Price and Stock */}
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className={`flex items-center gap-1 font-bold text-base ${
                                    isSelected ? 'text-white' : 'text-[var(--primary)]'
                                  }`}>
                                    {Tk_icon && <Tk_icon size={14} className={isSelected ? 'text-white' : 'text-[var(--primary)]'} />}
                                    <span>{(variant.discount_price || variant.price).toLocaleString()}</span>
                                  </div>
                                  
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    isSelected 
                                      ? 'bg-white/20 text-white' 
                                      : variant.stock > 0 
                                        ? 'bg-green-500/10 text-green-600' 
                                        : 'bg-red-500/10 text-red-600'
                                  }`}>
                                    {variant.stock > 0 ? `স্টকে ${variant.stock} টি` : 'স্টক আউট'}
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


              {/* Quantity Selector */}
              <div className="form-group">
                <label>পরিমাণ</label>
                <div className="quantity-selector">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={formData.quantity <= minPurchase}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quantity: Math.max(minPurchase, Math.min(parseInt(e.target.value) || minPurchase, effectiveProduct.stock))
                    }))}
                    min={minPurchase}
                    max={effectiveProduct.stock}
                    className="qty-input"
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={formData.quantity >= effectiveProduct.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="total-price total-price-rose">
                <span>মোট:</span>
                <span className="total-amount">
                  {Tk_icon && <Tk_icon size={22} className="mr-1" />}
                  {getTotalPrice().toLocaleString()}
                </span>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="full_name">আপনার নাম *</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">ইমেইল *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">মোবাইল নাম্বার *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="01XXX-XXXXXX"
                />
              </div>

              {/* Detailed Address */}
              <div className="form-group">
                <label htmlFor="detailed_address">সম্পূর্ণ ঠিকানা *</label>
                <textarea
                  id="detailed_address"
                  name="detailed_address"
                  value={formData.detailed_address}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="বাসা/ফ্ল্যাট, রোড, এলাকা, থানা, জেলা"
                />
              </div>

              {/* Customer Notes */}
              <div className="form-group">
                <label htmlFor="customer_notes">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                <textarea
                  id="customer_notes"
                  name="customer_notes"
                  value={formData.customer_notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                  placeholder="স্পেশাল কোন অনুরোধ থাকলে লিখুন"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting || effectiveProduct.stock === 0}
              >
                {submitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
