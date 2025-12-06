/**
 * Performance and SEO Optimization Utilities
 * For ChinaKroy Navbar and Components
 */

// Preload critical fonts
export const preloadFonts = () => {
  if (typeof document === 'undefined') return;
  
  const fonts = [
    { family: 'Inter', weight: '400' },
    { family: 'Inter', weight: '600' },
    { family: 'Inter', weight: '700' }
  ];

  fonts.forEach(({ family, weight }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = `/fonts/${family}-${weight}.woff2`;
    document.head.appendChild(link);
  });
};

// Prefetch critical routes
export const prefetchCriticalRoutes = (router) => {
  const criticalRoutes = [
    '/products',
    '/cart',
    '/categories'
  ];

  if (router && typeof router.prefetch === 'function') {
    criticalRoutes.forEach(route => {
      router.prefetch(route);
    });
  }
};

// Lazy load images with intersection observer
export const createImageObserver = (callback) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
};

// Debounce function for search and resize events
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Format price for BDT currency
export const formatBDTPrice = (price, options = {}) => {
  const {
    showDecimals = true,
    locale = 'en-BD'
  } = options;

  const numPrice = parseFloat(price || 0);
  
  if (isNaN(numPrice)) return '0.00';
  
  return showDecimals 
    ? numPrice.toFixed(2)
    : Math.round(numPrice).toString();
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice, discountPrice) => {
  const original = parseFloat(originalPrice);
  const discount = parseFloat(discountPrice);
  
  if (!original || !discount || original <= discount) return 0;
  
  return Math.round(((original - discount) / original) * 100);
};

// Generate product schema for SEO
export const generateProductSchema = (product) => {
  if (!product) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.thumbnail_url || product.image_url,
    "description": product.short_description || product.description?.replace(/<[^>]*>/g, ''),
    "sku": product.sku || product.id,
    "offers": {
      "@type": "Offer",
      "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.slug}`,
      "priceCurrency": "BDT",
      "price": product.discount_price || product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "ChinaKroy"
      }
    }
  };
};

// Generate breadcrumb schema for SEO
export const generateBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

// Optimize images for performance
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return null;

  const {
    width = 400,
    quality = 75,
    format = 'webp'
  } = options;

  // If using Next.js Image optimization
  if (url.startsWith('/')) {
    return url;
  }

  // For external URLs, you might use a CDN or image optimization service
  // This is a placeholder - adjust based on your setup
  return url;
};

// Check if user is a wholesaler
export const isWholesalerUser = (user) => {
  if (!user) return false;
  return user.user_type === 'WHOLESALER' || 
         user.user_type === 'Wholesaler' || 
         user.wholesaler_status === 'APPROVED';
};

// Get display price based on user type
export const getDisplayPrice = (product, user) => {
  const isWholesaler = isWholesalerUser(user);
  
  if (isWholesaler && product.wholesale_price && parseFloat(product.wholesale_price) > 0) {
    return {
      price: product.wholesale_price,
      originalPrice: product.price,
      isWholesale: true,
      minimumPurchase: product.minimum_purchase || 1
    };
  }

  return {
    price: product.discount_price || product.price,
    originalPrice: product.discount_price ? product.price : null,
    isWholesale: false,
    minimumPurchase: 1
  };
};

// Memoization helper for expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  if (typeof window === 'undefined' || !window.performance) {
    return fn();
  }

  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  const measureName = `${name}-measure`;

  performance.mark(startMark);
  const result = fn();
  performance.mark(endMark);

  try {
    performance.measure(measureName, startMark, endMark);
    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
  } catch (e) {
    // Ignore errors
  }

  return result;
};

export default {
  preloadFonts,
  prefetchCriticalRoutes,
  createImageObserver,
  debounce,
  throttle,
  formatBDTPrice,
  calculateDiscount,
  generateProductSchema,
  generateBreadcrumbSchema,
  getOptimizedImageUrl,
  isWholesalerUser,
  getDisplayPrice,
  memoize,
  measurePerformance
};
