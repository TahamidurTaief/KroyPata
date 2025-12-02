'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Tk_icon from '@/app/Components/Common/Tk_icon';
import './landing.css';

export default function ProductLandingPage() {
  const params = useParams();
  const router = useRouter();
  // Ensure we have a usable API base URL on the client — fall back to local dev server
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  
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
    if (params.slug) {
      fetchProduct();
      checkUser();
    }
  }, [params.slug]);

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
      
      if (!response.ok) throw new Error('Product not found');
      
      const data = await response.json();
      
      // Check if landing page is enabled
      if (!data.enable_landing_page) {
        toast.error('This product does not have a landing page');
        router.push('/products');
        return;
      }
      
      setProduct(data);
      
      // Set minimum quantity for wholesalers
      if (data._user_context?.is_approved_wholesaler && data.minimum_purchase) {
        setFormData(prev => ({ ...prev, quantity: data.minimum_purchase }));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (delta) => {
    const isWholesaler = product?._user_context?.is_approved_wholesaler;
    const minPurchase = isWholesaler ? (product?.minimum_purchase || 1) : 1;
    
    setFormData(prev => {
      const newQuantity = Math.max(minPurchase, prev.quantity + delta);
      return { ...prev, quantity: Math.min(newQuantity, product?.stock || 999) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.detailed_address) {
      toast.error('Please fill in all required fields');
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
        quantity: formData.quantity,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        detailed_address: formData.detailed_address,
        customer_notes: formData.customer_notes || ''
      };
      
      console.log('Submitting order:', orderData);
      console.log('API URL:', `${API_BASE}/api/products/landing-orders/`);
      
      const response = await fetch(
        `${API_BASE}/api/products/landing-orders/`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(orderData)
        }
      );
      
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
          throw new Error(errors || 'Failed to place order');
        }
        throw new Error('Failed to place order');
      }
      
      toast.success(`Order placed successfully! Order #${result.order_number}`);
      
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
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayPrice = () => {
    if (!product) return 0;
    
    const isWholesaler = product._user_context?.is_approved_wholesaler;
    
    if (isWholesaler && product.wholesale_price) {
      return product.wholesale_price;
    }
    
    return product.discount_price || product.price;
  };

  const getTotalPrice = () => {
    return getDisplayPrice() * formData.quantity;
  };

  // Get all images (thumbnail + additional images)
  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.thumbnail_url) images.push(product.thumbnail_url);
    if (product.additional_images) {
      images.push(...product.additional_images.map(img => img.image));
    }
    return images;
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
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or doesn't have a landing page enabled.</p>
          <button onClick={() => router.push('/products')} className="back-btn">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();
  const isWholesaler = product._user_context?.is_approved_wholesaler;
  const minPurchase = isWholesaler ? (product.minimum_purchase || 1) : 1;

  return (
    <div className="landing-page-container">
      <div className="container">
        <div className="landing-page-content">
        
        {/* Left Side - Product Details */}
        <div className="product-section">
          
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              {allImages.length > 0 ? (
                <Image
                  src={allImages[selectedImageIndex]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="image"
                  priority
                />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="thumbnail-grid">
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image src={img} alt={`${product.name} ${index + 1}`} width={100} height={100} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            {product.brand && (
              <div className="product-brand">
                <span className="label">Brand:</span>
                <span className="value">{product.brand.name}</span>
              </div>
            )}
            
            <div className="product-price">
              <span className="price-label">Price:</span>
              <span className="price-value">
                <Tk_icon size={20} className="mr-1" />
                {getDisplayPrice().toLocaleString()}
              </span>
              {isWholesaler && product.wholesale_price && (
                <span className="wholesale-badge">Wholesale Price</span>
              )}
            </div>
            
            {product.stock > 0 ? (
              <div className="stock-status in-stock">
                <span className="status-icon">✓</span>
                <span>{product.stock} items in stock</span>
              </div>
            ) : (
              <div className="stock-status out-of-stock">
                <span className="status-icon">✗</span>
                <span>Out of stock</span>
              </div>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="product-description">
              <h2>Product Description</h2>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Landing Page Sections */}
          {product.landing_features && (
            <div className="landing-section">
              <h2>Features</h2>
              <div dangerouslySetInnerHTML={{ __html: product.landing_features }} />
            </div>
          )}

          {product.landing_how_to_use && (
            <div className="landing-section">
              <h2>How to Use</h2>
              <div dangerouslySetInnerHTML={{ __html: product.landing_how_to_use }} />
            </div>
          )}

          {product.landing_why_choose && (
            <div className="landing-section">
              <h2>Why Choose This Product?</h2>
              <div dangerouslySetInnerHTML={{ __html: product.landing_why_choose }} />
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="specifications">
              <h2>Specifications</h2>
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
        </div>

        {/* Right Side - Checkout Form */}
        <div className="checkout-section">
          <div className="checkout-card">
            <h2 className="checkout-title">Order Now</h2>
            
            {isWholesaler && (
              <div className="wholesaler-info">
                <p className="wholesaler-badge-large">Wholesale Customer</p>
                <p className="min-purchase-info">
                  Minimum purchase: {minPurchase} items
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="checkout-form">
              
              {/* Quantity Selector */}
              <div className="form-group">
                <label>Quantity</label>
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
                      quantity: Math.max(minPurchase, Math.min(parseInt(e.target.value) || minPurchase, product.stock))
                    }))}
                    min={minPurchase}
                    max={product.stock}
                    className="qty-input"
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={formData.quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="total-price">
                <span>Total:</span>
                <span className="total-amount">
                  <Tk_icon size={22} className="mr-1" />
                  {getTotalPrice().toLocaleString()}
                </span>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="full_name">Full Name *</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email *</label>
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
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>

              {/* Detailed Address */}
              <div className="form-group">
                <label htmlFor="detailed_address">Detailed Address *</label>
                <textarea
                  id="detailed_address"
                  name="detailed_address"
                  value={formData.detailed_address}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="House/Flat, Road, Area, City, Postal Code"
                />
              </div>

              {/* Customer Notes */}
              <div className="form-group">
                <label htmlFor="customer_notes">Additional Notes (Optional)</label>
                <textarea
                  id="customer_notes"
                  name="customer_notes"
                  value={formData.customer_notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                  placeholder="Any special instructions or requests"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting || product.stock === 0}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
