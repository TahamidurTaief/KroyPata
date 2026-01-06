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
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [showShippingHelp, setShowShippingHelp] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    alternative_phone: '',
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
      fetchShippingMethods();
    } else {
      console.error('No slug in params');
    }
  }, [params.slug]);

  // Calculate shipping charge when quantity or shipping method changes
  useEffect(() => {
    if (selectedShippingMethod && product) {
      calculateShippingCharge();
    }
  }, [formData.quantity, selectedShippingMethod, product, selectedVariant]);

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

  const fetchShippingMethods = async () => {
    try {
      console.log('Fetching shipping methods from:', `${API_BASE}/api/orders/shipping-methods/`);
      const response = await fetch(`${API_BASE}/api/orders/shipping-methods/`);
      if (response.ok) {
        const data = await response.json();
        console.log('Shipping methods response:', data);
        // Backend already filters active methods, handle both paginated and non-paginated responses
        const methods = data.results || data || [];
        console.log('Shipping methods:', methods);
        setShippingMethods(methods);
        
        // Auto-select first method if available
        if (methods.length > 0) {
          setSelectedShippingMethod(methods[0]);
        }
      } else {
        console.error('Failed to fetch shipping methods:', response.status, response.statusText);
        setShippingMethods([]);
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      setShippingMethods([]);
    }
  };

  const calculateShippingCharge = () => {
    if (!selectedShippingMethod || !product) {
      setShippingCharge(0);
      return;
    }

    const effectiveProduct = selectedVariant || product;
    const weight = parseFloat(effectiveProduct.weight) || 0;
    const totalWeight = weight * formData.quantity;
    const quantity = parseInt(formData.quantity) || 1;

    console.log('Calculating shipping charge:', {
      method: selectedShippingMethod.name,
      quantity,
      weight,
      totalWeight,
      pricingType: selectedShippingMethod.preferred_pricing_type
    });

    // Use preferred pricing type from shipping method
    const pricingType = selectedShippingMethod.preferred_pricing_type || 'quantity';
    const tiers = selectedShippingMethod.shipping_tiers || [];
    
    let calculatedCharge = 0;
    
    if (pricingType === 'weight' && totalWeight > 0) {
      // Weight-based calculation
      console.log('Weight-based tiers:', tiers.filter(t => t.pricing_type === 'weight'));
      
      const applicableTier = tiers
        .filter(t => t.pricing_type === 'weight' && parseFloat(t.min_weight || 0) <= totalWeight)
        .filter(t => !t.max_weight || parseFloat(t.max_weight) >= totalWeight)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0) || parseFloat(b.min_weight || 0) - parseFloat(a.min_weight || 0))[0];
      
      if (applicableTier) {
        console.log('Applicable tier:', applicableTier);
        calculatedCharge = parseFloat(applicableTier.base_price || 0);
        if (applicableTier.has_incremental_pricing && totalWeight > parseFloat(applicableTier.min_weight || 0)) {
          const excessWeight = totalWeight - parseFloat(applicableTier.min_weight || 0);
          const incrementSize = parseFloat(applicableTier.increment_unit_size || 1);
          const incrementPrice = parseFloat(applicableTier.increment_per_unit || 0);
          const incrementUnits = Math.ceil(excessWeight / incrementSize);
          calculatedCharge += incrementUnits * incrementPrice;
          console.log('Incremental pricing applied:', { excessWeight, incrementUnits, additional: incrementUnits * incrementPrice });
        }
      } else {
        calculatedCharge = parseFloat(selectedShippingMethod.price || 0);
        console.log('Using base price (no tier matched):', calculatedCharge);
      }
    } else {
      // Quantity-based calculation
      console.log('Quantity-based tiers:', tiers.filter(t => t.pricing_type === 'quantity'));
      
      const applicableTier = tiers
        .filter(t => t.pricing_type === 'quantity' && parseInt(t.min_quantity || 0) <= quantity)
        .filter(t => !t.max_quantity || parseInt(t.max_quantity) >= quantity)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0) || parseInt(b.min_quantity || 0) - parseInt(a.min_quantity || 0))[0];
      
      if (applicableTier) {
        console.log('Applicable tier:', applicableTier);
        calculatedCharge = parseFloat(applicableTier.base_price || 0);
        if (applicableTier.has_incremental_pricing && quantity > parseInt(applicableTier.min_quantity || 0)) {
          const excessQty = quantity - parseInt(applicableTier.min_quantity || 0);
          const incrementSize = parseFloat(applicableTier.increment_unit_size || 1);
          const incrementPrice = parseFloat(applicableTier.increment_per_unit || 0);
          const incrementUnits = Math.ceil(excessQty / incrementSize);
          calculatedCharge += incrementUnits * incrementPrice;
          console.log('Incremental pricing applied:', { excessQty, incrementUnits, additional: incrementUnits * incrementPrice });
        }
      } else {
        calculatedCharge = parseFloat(selectedShippingMethod.price || 0);
        console.log('Using base price (no tier matched):', calculatedCharge);
      }
    }
    
    // Fail-safe: ensure valid number
    calculatedCharge = isNaN(calculatedCharge) || calculatedCharge < 0 ? 0 : calculatedCharge;
    console.log('Final shipping charge:', calculatedCharge);
    setShippingCharge(calculatedCharge);
  };

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
    
    // Validate shipping method selection
    if (!selectedShippingMethod) {
      toast.error('অনুগ্রহ করে একটি শিপিং মেথড নির্বাচন করুন');
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
        alternative_phone: formData.alternative_phone || '',
        detailed_address: formData.detailed_address,
        shipping_method: selectedShippingMethod.id,
        customer_notes: formData.customer_notes || ''
      };
      
      console.log('Submitting order with data:', {
        ...orderData,
        calculated_shipping_charge: shippingCharge,
        shipping_method_details: {
          id: selectedShippingMethod.id,
          name: selectedShippingMethod.name,
          preferred_pricing_type: selectedShippingMethod.preferred_pricing_type
        }
      });
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
      
      // Show success modal with order details
      setOrderResult({
        order_number: result.order_number,
        product_name: product.name,
        quantity: formData.quantity,
        unit_price: result.unit_price,
        shipping_charge: result.shipping_charge,
        total_price: result.total_price
      });
      setShowSuccessModal(true);
      
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
    
    let price = 0;
    if (isWholesaler && effectiveProduct.wholesale_price) {
      price = parseFloat(effectiveProduct.wholesale_price);
    } else {
      price = parseFloat(effectiveProduct.discount_price || effectiveProduct.price);
    }
    
    return isNaN(price) || price < 0 ? 0 : price;
  };

  const getTotalPrice = () => {
    const unitPrice = getDisplayPrice();
    const quantity = parseInt(formData.quantity) || 1;
    const shipping = parseFloat(shippingCharge) || 0;
    const productTotal = unitPrice * quantity;
    const total = productTotal + shipping;
    
    return isNaN(total) || total < 0 ? 0 : total;
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

  const openLightbox = (imgSrc, index = 0) => {
    setLightboxImage(imgSrc);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
    setLightboxIndex(0);
  };
  
  const nextImage = () => {
    const images = getAllImages();
    const newIndex = (lightboxIndex + 1) % images.length;
    setLightboxIndex(newIndex);
    setLightboxImage(images[newIndex]);
  };
  
  const prevImage = () => {
    const images = getAllImages();
    const newIndex = (lightboxIndex - 1 + images.length) % images.length;
    setLightboxIndex(newIndex);
    setLightboxImage(images[newIndex]);
  };

  // Shipping Help Modal Component
  const ShippingHelpModal = () => {
    if (!showShippingHelp || !selectedShippingMethod) return null;
    
    const effectiveProduct = selectedVariant || product;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowShippingHelp(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                শিপিং তথ্য
              </h3>
              <button onClick={() => setShowShippingHelp(false)} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Method Name */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{selectedShippingMethod.name}</h4>
              {selectedShippingMethod.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShippingMethod.description}</p>
              )}
            </div>
            
            {/* Current Calculation */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">আপনার অর্ডারের জন্য</p>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-700 dark:text-gray-300">পরিমাণ: <span className="font-semibold">{parseInt(formData.quantity) || 1} টি</span></p>
                    {effectiveProduct?.weight && parseFloat(effectiveProduct.weight) > 0 && (
                      <p className="text-gray-700 dark:text-gray-300">মোট ওজন: <span className="font-semibold">{(parseFloat(effectiveProduct.weight) * (parseInt(formData.quantity) || 1)).toFixed(2)} কেজি</span></p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300">শিপিং চার্জ: <span className="font-bold text-green-600 dark:text-green-400">{Tk_icon && <Tk_icon size={14} className="inline" />} {(parseFloat(shippingCharge) || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 })} টাকা</span></p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pricing Details */}
            <div className="space-y-3">
              <h5 className="font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                মূল্য নির্ধারণ পদ্ধতি
              </h5>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-semibold">বেস মূল্য:</span> {Tk_icon && <Tk_icon size={13} className="inline" />} {selectedShippingMethod.price.toLocaleString()} টাকা
                </p>
                {selectedShippingMethod.preferred_pricing_type && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">মূল্য ভিত্তি:</span> {selectedShippingMethod.preferred_pricing_type === 'weight' ? 'ওজন ভিত্তিক' : 'পরিমাণ ভিত্তিক'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Delivery Time */}
            {selectedShippingMethod.delivery_estimated_time && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><span className="font-semibold">ডেলিভারি সময়:</span> {selectedShippingMethod.delivery_estimated_time}</span>
                </p>
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => setShowShippingHelp(false)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      </div>
    );
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

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !orderResult) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={() => setShowSuccessModal(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden sm:max-w-lg md:max-w-xl" onClick={(e) => e.stopPropagation()}>
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center sticky top-0 z-10 rounded-t-2xl">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">অর্ডার সফল হয়েছে! 🎉</h2>
            <p className="text-green-50 text-sm">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে</p>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Order Number Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 mb-4 text-center border-2 border-blue-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">অর্ডার নাম্বার</p>
              <p className="text-2xl font-bold text-primary">{orderResult.order_number}</p>
            </div>
            
            {/* Order Details Table */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                অর্ডার বিবরণ
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-start py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">পণ্য</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{orderResult.product_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">পরিমাণ</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{orderResult.quantity} টি</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">প্রোডাক্ট মূল্য</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {Tk_icon && <Tk_icon size={14} className="inline mr-1" />}
                    {(orderResult.unit_price * orderResult.quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">শিপিং চার্জ</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {Tk_icon && <Tk_icon size={14} className="inline mr-1" />}
                    {orderResult.shipping_charge.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-base font-bold text-gray-900 dark:text-white">মোট মূল্য</span>
                  <span className="text-xl font-bold text-primary">
                    {Tk_icon && <Tk_icon size={18} className="inline mr-1" />}
                    {orderResult.total_price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Info Message */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন এবং অর্ডারটি নিশ্চিত করবেন।</span>
              </p>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/products');
              }}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:from-primary/90 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              আরও পণ্য দেখুন
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="landing-page-container">
      {/* Success Modal */}
      <SuccessModal />
      
      {/* Shipping Help Modal */}
      <ShippingHelpModal />
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation Buttons */}
            {getAllImages().length > 1 && (
              <>
                <button 
                  className="lightbox-nav lightbox-nav-prev" 
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="lightbox-nav lightbox-nav-next" 
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {getAllImages().length > 1 && (
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {getAllImages().length}
              </div>
            )}
            
            <Image 
              src={lightboxImage} 
              alt="Zoomed Product" 
              width={1200} 
              height={1200} 
              className="lightbox-img"
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              priority
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
                    onClick={() => openLightbox(img, index)}
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


              {/* Order Summary Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 mb-4 border-2 border-blue-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  অর্ডার সামারি
                </h3>

                {/* Quantity Selector */}
                <div className="form-group mb-4">
                  <label className="block mb-2 font-semibold">পরিমাণ</label>
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
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const validVal = isNaN(val) || val < minPurchase ? minPurchase : Math.min(val, effectiveProduct.stock);
                        setFormData(prev => ({ ...prev, quantity: validVal }));
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val) || val < minPurchase) {
                          setFormData(prev => ({ ...prev, quantity: minPurchase }));
                        }
                      }}
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

                {/* Shipping Method Selector */}
                <div className="form-group mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold">শিপিং মেথড নির্বাচন করুন *</label>
                    {selectedShippingMethod && (
                      <button
                        type="button"
                        onClick={() => setShowShippingHelp(true)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="শিপিং তথ্য দেখুন"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {shippingMethods.length === 0 ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">কোন শিপিং মেথড পাওয়া যায়নি</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">দয়া করে পরে আবার চেষ্টা করুন</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shippingMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedShippingMethod(method)}
                          className={`w-full p-3.5 rounded-xl border-2 transition-all text-left relative group ${
                            selectedShippingMethod?.id === method.id
                              ? 'border-primary bg-primary text-white shadow-lg scale-[1.02]'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all ${
                                selectedShippingMethod?.id === method.id
                                  ? 'border-white bg-white'
                                  : 'border-gray-300 group-hover:border-primary'
                              }`}>
                                {selectedShippingMethod?.id === method.id && (
                                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold mb-1 ${
                                  selectedShippingMethod?.id === method.id ? 'text-white' : 'text-gray-900 dark:text-white'
                                }`}>{method.name}</div>
                                {method.delivery_estimated_time && (
                                  <div className={`text-xs flex items-center ${
                                    selectedShippingMethod?.id === method.id ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {method.delivery_estimated_time}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={`font-bold text-base flex items-center ml-2 ${
                              selectedShippingMethod?.id === method.id ? 'text-white' : 'text-primary'
                            }`}>
                              {Tk_icon && <Tk_icon size={14} className="mr-1" />}
                              {method.price.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!selectedShippingMethod && (
                    <p className="text-xs text-red-500 mt-1">অর্ডার সম্পন্ন করতে শিপিং মেথড নির্বাচন করুন</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">প্রোডাক্ট মূল্য:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Tk_icon && <Tk_icon size={14} className="inline mr-1" />}
                      {(getDisplayPrice() * (parseInt(formData.quantity) || 1)).toLocaleString('en-BD', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">শিপিং চার্জ:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Tk_icon && <Tk_icon size={14} className="inline mr-1" />}
                      {selectedShippingMethod ? (parseFloat(shippingCharge) || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 }) : '---'}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900 dark:text-white">মোট মূল্য:</span>
                    <span className="text-lg font-bold text-primary">
                      {Tk_icon && <Tk_icon size={18} className="inline mr-1" />}
                      {getTotalPrice().toLocaleString('en-BD', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ক্রেতার তথ্য
                </h3>
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

              {/* Alternative Phone */}
              <div className="form-group">
                <label htmlFor="alternative_phone">বিকল্প নাম্বার (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  id="alternative_phone"
                  name="alternative_phone"
                  value={formData.alternative_phone}
                  onChange={handleInputChange}
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
