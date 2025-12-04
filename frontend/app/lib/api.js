// Wholeseller registration API
export const registerWholeseller = async (formData) => {
  const response = await fetchAPI('/api/auth/register/wholesaler/', {
    method: 'POST',
    body: formData, // FormData object - don't JSON.stringify it
  });

  if (response.error) {
    return response;
  }
  // Store tokens and user info if available
  if (response.tokens && response.user) {
    localStorage.setItem('accessToken', response.tokens.access);
    localStorage.setItem('refreshToken', response.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  return response;
};
// Brands fetch
export const getBrands = cache(async (categorySlug = null) => {
  try {
    const params = new URLSearchParams();
    if (categorySlug) {
      params.append('category', categorySlug);
    }
    const url = params.toString() ? `/api/products/brands/?${params.toString()}` : '/api/products/brands/';
    const response = await fetchAPI(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (response?.error) {
      console.warn('Brands API error:', response.error);
      return [];
    }
    return response?.results || response || [];
  } catch (error) {
    console.warn('Brands fetch failed, using fallback:', error);
    return [];
  }
});
// app/lib/api.js
import { cache } from 'react';
import { fetchWithRetry } from './safeFetch';

// Normalize API base URL and ensure no trailing slash
// Use local development server if running locally, otherwise use production API
export const API_BASE_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Otherwise use env var or production default
  return (envUrl || 'https://api.chinakroy.com').replace(/\/+$/, '');
})();

// Debug API calls
const DEBUG_API = false;

// Test function to check API connectivity
export const testAPIConnection = async () => {
  try {
    const { data, error } = await fetchWithRetry(`${API_BASE_URL}/admin/`, { method: 'HEAD' });
    const status = error ? 0 : 200;
    console.log('🌐 API Connection Test:', {
      url: `${API_BASE_URL}/admin/`,
      status,
      ok: !error
    });
    return { connected: !error, status };
  } catch (error) {
    console.error('🌐 API Connection Test Failed:', error);
    return { connected: false, error: error.message };
  }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  return {};
};

// Helper function to refresh access token
const refreshAccessToken = async () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      console.log('🔄 Token refreshed successfully');
      return true;
    } else {
      console.log('🔄 Token refresh failed, status:', response.status);
      // Refresh token is invalid or expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('🔄 Token refresh error:', error);
    return false;
  }
};

// Helper function to handle 401 unauthorized responses
const handle401Redirect = () => {
  if (typeof window !== 'undefined') {
    // Clear stored auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login - check if we're not already on a public page
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/products', '/categories', '/auth'];
    const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
    
    if (!isPublicPath) {
      // Store the current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      window.dispatchEvent(new CustomEvent('authRequired', { 
        detail: { reason: 'Session expired. Please login again.' }
      }));
    }
  }
};

// Helper function to fetch with retry logic for network issues
async function fetchWithRetryInternal(url, options = {}, maxRetries = 1) { // Reduced from 2 to 1 for faster initial load
  const { retries = 0 } = options;
  
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.error(`Fetch attempt ${retries + 1} failed for ${url}:`, error.message);
    
    // If it's a network error and we have retries left, try again
    if ((error.name === 'TypeError' && error.message.includes('fetch')) && retries < maxRetries) {
      console.log(`Retrying fetch for ${url} (attempt ${retries + 2}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1))); // Reduced backoff time
      return fetchWithRetryInternal(url, { ...options, retries: retries + 1 }, maxRetries);
    }
    
    throw error;
  }
}

async function fetchAPI(endpoint, options = {}) {
  const headers = { 
    // Only set Content-Type to JSON if not FormData
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...getAuthHeaders(),
    ...options.headers 
  };
  
  // Ensure endpoint begins with slash
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  if (DEBUG_API) {
    let bodyLog = null;
    if (options.body) {
      if (options.body instanceof FormData) {
        bodyLog = '[FormData with fields: ' + Array.from(options.body.keys()).join(', ') + ']';
      } else {
        try {
          bodyLog = JSON.parse(options.body);
        } catch {
          bodyLog = '[Non-JSON body]';
        }
      }
    }
    
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined },
      body: bodyLog
    });
  }

  const makeRequest = async (requestHeaders) => {
    try {
      // Add timeout and better caching for performance
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const fetchOptions = { 
        ...options, 
        headers: requestHeaders, 
        signal: controller.signal,
        // Use Next.js caching options if provided
        ...(options.next ? { next: options.next } : {}),
      };

      // Only set cache if next is NOT provided to avoid conflict
      if (!options.next) {
        fetchOptions.cache = options.cache || (options.method && options.method !== 'GET' ? 'no-store' : 'default');
      }
      
      const response = await fetchWithRetryInternal(url, fetchOptions);
      
      clearTimeout(timeoutId);
      
      if (DEBUG_API) {
        console.log('🌐 API Response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });
      }
      
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout: API call to ${endpoint} took longer than 10 seconds`);
        timeoutError.name = 'TimeoutError';
        timeoutError.code = 'TIMEOUT_ERROR';
        throw timeoutError;
      }
      
      console.error("Fetch request failed:", endpoint, error);
      
      // If it's a network error, provide more helpful error message
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error(`Network error: Unable to connect to API at ${API_BASE_URL}. Please ensure the backend server is running.`);
        networkError.name = 'NetworkError';
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }
      
      throw error;
    }
  };

  try {
    let response = await makeRequest(headers);
    
    // If we get a 401 and have a refresh token, try to refresh the access token
    if (response.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !endpoint.includes('/token/refresh/')) {
        console.log('🔄 Received 401, attempting token refresh...');
        const refreshSuccess = await refreshAccessToken();
        
        if (refreshSuccess) {
          // Retry the original request with the new token
          const newHeaders = { 
            ...headers,
            ...getAuthHeaders() // Get fresh token
          };
          response = await makeRequest(newHeaders);
          console.log('🔄 Retried request after token refresh, status:', response.status);
        }
      }
    }

    if (!response.ok) {
        // Check if response is HTML (which indicates Django error page)
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
          console.error("Server returned HTML error page instead of JSON");
          const htmlText = await response.text();
          console.error("HTML Response:", htmlText.substring(0, 200));
          return { error: `Server error: ${response.status} ${response.statusText}. The API endpoint may not exist or the server is misconfigured.` };
        }
        
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        
        // Log more detailed error information
        if (DEBUG_API) {
          console.log('🔴 API Error Details:', {
            url,
            status: response.status,
            statusText: response.statusText,
            errorData,
            headers: Object.fromEntries(response.headers.entries())
          });
        }
        
        if (errorData && (Object.keys(errorData).length > 0)) {
          console.error("Backend Error:", errorData);
        } else {
          console.error(`Backend Error: status ${response.status} ${response.statusText} at ${url}`);
        }
        
        // Handle 401 Unauthorized responses (after token refresh attempt)
        if (response.status === 401) {
          handle401Redirect();
          return { error: 'Authentication required. Please login again.' };
        }
        
        // Return the full error data for better error handling
        if (response.status === 400 && errorData.errors) {
          // Validation errors from our RegisterAPIView
          return { error: errorData.message || 'Validation failed', errors: errorData.errors };
        } else if (response.status === 403) {
          // Forbidden - user doesn't have permission
          return { error: errorData.detail || 'Access denied. You do not have permission to perform this action.' };
        } else if (response.status === 404) {
          // Not found - endpoint doesn't exist
          return { error: `Resource not found: ${endpoint}` };
        } else if (response.status >= 500) {
          // Server error
          return { error: 'Server error. Please try again later.' };
        } else {
          // Other errors
          return { error: errorData.detail || errorData.message || response.statusText };
        }
    }
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (response.status === 204) {
      return null;
    } else if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      if (DEBUG_API) {
        console.log('🌐 API Success:', jsonData);
      }
      return jsonData;
    } else {
      console.error("Server returned non-JSON response:", contentType);
      const textResponse = await response.text();
      console.error("Text response:", textResponse.substring(0, 200));
      return { error: 'Server returned unexpected response format' };
    }
  } catch (error) {
    console.error("Fetch API failed:", endpoint, error);
    
    // Check for our enhanced network error
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return { 
        error: error.message,
        code: 'NETWORK_ERROR',
        endpoint: endpoint
      };
    }
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { 
        error: `Network error connecting to ${API_BASE_URL}. Please check if the backend server is running on port 8000.`,
        code: 'NETWORK_ERROR',
        endpoint: endpoint
      };
    }
    
    // Check for JSON parsing errors
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return { 
        error: 'Invalid server response. The server may be returning HTML instead of JSON.',
        code: 'PARSE_ERROR',
        endpoint: endpoint
      };
    }
    
    return { error: error.message || 'An unexpected error occurred' };
  }
}

// Product and related fetches
export const getProducts = async (filters = {}, page = 1, pageSize = 24) => {
    console.log('🔧 getProducts called with:', { filters, page, pageSize });
    
    const params = new URLSearchParams({ page, page_size: pageSize });

    if (filters.category) {
        params.append('category', filters.category);
    }
    if (filters.subcategory) {
        params.append('subcategory', filters.subcategory);
    }
    // Support multiple subcategories
    if (filters.subcategories?.length) {
        params.append('subcategories', filters.subcategories.join(','));
    }
    if (filters.brand) {
        params.append('brand', filters.brand);
    }
    if (filters.brands?.length) {
        params.append('brands', filters.brands.join(','));
    }
    if (filters.colors?.length) {
        params.append('colors', filters.colors.join(','));
    }
    if (filters.shipping_categories?.length) {
        params.append('shipping_categories', filters.shipping_categories.join(','));
    }
    if (filters.search) {
        params.append('search', filters.search);
    }

    // Handle price filtering
    if (filters.min_price !== undefined && filters.min_price !== null) {
        params.append('min_price', filters.min_price);
    }
    if (filters.max_price !== undefined && filters.max_price !== null) {
        params.append('max_price', filters.max_price);
    }

    // FIX: Correctly access priceRange by index and ensure values are numbers (legacy support)
    if (filters.priceRange && Array.isArray(filters.priceRange)) {
        const minPrice = filters.priceRange[0];
        const maxPrice = filters.priceRange[1];
        
        if (typeof minPrice === 'number' && minPrice > 0) {
            params.append('min_price', minPrice);
        }
        if (typeof maxPrice === 'number' && maxPrice < 10000) {
            params.append('max_price', maxPrice);
        }
    }

    // Handle ordering/sorting
    if (filters.ordering) {
        params.append('ordering', filters.ordering);
    }

    // FIX: Translate frontend sort values to backend ordering parameters (legacy support)
    const sortMapping = {
        'price-asc': 'price',
        'price-desc': '-price',
        'name-asc': 'name',
        'name-desc': '-name',
        'created_at': '-created_at',
    };

    if (filters.sort && sortMapping[filters.sort]) {
        params.append('ordering', sortMapping[filters.sort]);
    }
    
    const endpoint = `/api/products/products/?${params.toString()}`;
    console.log('🌐 Fetching products from:', endpoint);
    
    try {
        const result = await fetchAPI(endpoint, {
            next: { revalidate: 60 } // Cache for 1 minute for product lists
        });
        
        console.log('🌐 Raw API result:', {
            isObject: typeof result === 'object',
            hasError: !!result?.error,
            hasResults: !!result?.results,
            hasCount: !!result?.count,
            count: result?.count,
            resultsLength: result?.results?.length,
            keys: result ? Object.keys(result) : null
        });
        
        // If there's an error, return it as-is for SWR to handle
        if (result?.error) {
            console.log('🔴 API returned error:', result.error);
            return result;
        }
        
        // If the result has the expected structure, return it
        if (result && (result.results || result.count !== undefined)) {
            console.log('✅ API returned valid data:', {
                count: result.count,
                resultsLength: result.results?.length
            });
            return result;
        }
        
        // If we get here, something unexpected happened
        console.log('⚠️ Unexpected API response structure:', result);
        return {
            error: 'Unexpected response format from server',
            debug: result
        };
        
    } catch (error) {
        console.error('🚨 getProducts error:', error);
        return { error: error.message || 'Failed to fetch products' };
    }
};


export const getProductBySlug = cache(async (slug) => fetchAPI(`/api/products/products/${slug}/`, {
  next: { revalidate: 120 } // Cache for 2 minutes
}));

export const getCategories = cache(async () => {
  try {
    const response = await fetchAPI('/api/products/categories/', {
      next: { revalidate: 600 } // Cache for 10 minutes since categories change less frequently
    });
    
    // Handle errors - return empty array instead of fallback data
    if (response?.error) {
      console.warn('Categories API error:', response.error);
      return [];
    }
    
    return response?.results || response || [];
  } catch (error) {
    console.warn('Categories fetch failed, using fallback:', error);
    return [
      { id: 1, name: 'Electronics', slug: 'electronics' },
      { id: 2, name: 'Clothing', slug: 'clothing' },
      { id: 3, name: 'Home & Garden', slug: 'home-garden' },
      { id: 4, name: 'Sports', slug: 'sports' },
      { id: 5, name: 'Books', slug: 'books' }
    ];
  }
});

export const getSubCategories = cache(async (categorySlug = null) => {
  try {
    const params = new URLSearchParams();
    if (categorySlug) {
      params.append('category', categorySlug);
    }
    const url = params.toString() ? `/api/products/subcategories/?${params.toString()}` : '/api/products/subcategories/';
    const response = await fetchAPI(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (response?.error) {
      console.warn('Subcategories API error:', response.error);
      return [];
    }
    return response?.results || response || [];
  } catch (error) {
    console.warn('Subcategories fetch failed:', error);
    return [];
  }
});

export const getProductsByCategory = cache(async (categorySlug, page=1, pageSize=24) => { 
  const params = new URLSearchParams({ page });
  if (pageSize) params.append('page_size', pageSize);
  if (categorySlug) params.append('category', categorySlug);
  return fetchAPI(`/api/products/products/?${params.toString()}`, {
    next: { revalidate: 60 } // Cache for 1 minute
  });
});

export const getShops = cache(async (categorySlug = null) => {
  try {
    const params = new URLSearchParams();
    if (categorySlug) {
      params.append('category', categorySlug);
    }
    const url = params.toString() ? `/api/shops/shops/?${params.toString()}` : '/api/shops/shops/';
    const response = await fetchAPI(url);
    return response?.results || response || [];
  } catch (error) {
    console.warn('Shops fetch failed:', error);
    return [];
  }
});

export const getColors = cache(async (categorySlug = null) => {
  try {
    const params = new URLSearchParams();
    if (categorySlug) {
      params.append('category', categorySlug);
    }
    const url = params.toString() ? `/api/products/colors/?${params.toString()}` : '/api/products/colors/';
    console.log('🎨 Fetching colors with URL:', url);
    const response = await fetchAPI(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    console.log('🎨 Colors response:', response);
    return response?.results || response || [];
  } catch (error) {
    console.warn('Colors fetch failed:', error);
    return [];
  }
});

export const getSizes = cache(async (categorySlug = null) => {
  try {
    const params = new URLSearchParams();
    if (categorySlug) {
      params.append('category', categorySlug);
    }
    const url = params.toString() ? `/api/products/sizes/?${params.toString()}` : '/api/products/sizes/';
    const response = await fetchAPI(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    return response?.results || response || [];
  } catch (error) {
    console.warn('Sizes fetch failed:', error);
    return [];
  }
});

// Shipping categories fetch
export const getShippingCategories = cache(async () => {
  const response = await fetchAPI('/api/orders/shipping-categories/', {
    next: { revalidate: 300 } // Cache for 5 minutes
  });
  return response?.results || response || [];
});

export const getInitialHomeProducts = cache(async () => {
  try {
    return await fetchAPI('/api/products/products/?page_size=12', {
      next: { revalidate: 60 } // Cache for 1 minute
    });
  } catch (error) {
    console.error('Error fetching initial home products:', error);
    return { results: [], count: 0 };
  }
});

// Shipping fetches
export const getShippingMethods = cache(async () => {
  try {
    const fullUrl = `${API_BASE_URL}/api/orders/shipping-methods/`;
    console.log('🚚 Fetching shipping methods from:', fullUrl);
    console.log('🚚 API_BASE_URL:', API_BASE_URL);
    
    // Try direct fetch first for debugging
    try {
      const directResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      console.log('🚚 Direct fetch response status:', directResponse.status);
      console.log('🚚 Direct fetch response headers:', Object.fromEntries(directResponse.headers.entries()));
      
      if (directResponse.ok) {
        const directResult = await directResponse.json();
        console.log('🚚 Direct fetch result:', directResult);
        console.log('🚚 Direct fetch result type:', typeof directResult);
        console.log('🚚 Direct fetch is array:', Array.isArray(directResult));
        
        // Handle different response formats
        let shippingMethods = [];
        if (Array.isArray(directResult)) {
          shippingMethods = directResult;
        } else if (directResult?.results && Array.isArray(directResult.results)) {
          shippingMethods = directResult.results;
        } else if (directResult?.data && Array.isArray(directResult.data)) {
          shippingMethods = directResult.data;
        } else if (directResult && typeof directResult === 'object' && !directResult.error) {
          shippingMethods = [directResult];
        }
        
        // Format and validate shipping methods
        const formattedMethods = shippingMethods.map(method => ({
          ...method,
          id: method.id || method.pk || Math.random().toString(36).substr(2, 9),
          name: method.name || 'Unknown Shipping Method',
          price: (() => {
            const parsed = typeof method.price === 'number' ? method.price : parseFloat(method.price || 0);
            return isNaN(parsed) ? 0 : parsed;
          })(),
          description: method.description || method.estimated_delivery || 'Standard delivery',
          details: method.details || method.description || 'Delivery service',
          estimated_delivery: method.estimated_delivery || method.description || '3-5 business days',
          tracking_available: method.tracking_available !== undefined ? method.tracking_available : true
        }));
        
        console.log('🚚 Direct fetch formatted methods:', formattedMethods);
        return formattedMethods.length > 0 ? formattedMethods : [{
          id: 1,
          name: 'Standard Shipping',
          price: 9.99,
          description: '5-7 business days',
          details: 'Standard delivery service with tracking included.',
          estimated_delivery: '5-7 business days',
          tracking_available: true,
          fallback: true
        }];
      } else {
        console.error('🚚 Direct fetch failed:', directResponse.status, directResponse.statusText);
        const errorText = await directResponse.text();
        console.error('🚚 Error response:', errorText);
      }
    } catch (directError) {
      console.error('🚚 Direct fetch error:', directError);
    }
    
    // Fallback to fetchAPI
    const result = await fetchAPI('/api/orders/shipping-methods/', { 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🚚 Shipping methods result:', result);
    console.log('🚚 Result type:', typeof result);
    console.log('🚚 Is array:', Array.isArray(result));
    
    if (result?.error) {
      console.warn('Shipping methods API error:', result.error);
      
      // If it's a network error, provide more specific fallback message
      if (result.code === 'NETWORK_ERROR') {
        console.warn('Backend server not available, using fallback shipping methods');
        return [{
          id: 1,
          name: 'Standard Shipping',
          price: 9.99,
          description: '5-7 business days',
          details: 'Standard delivery service with tracking included.',
          estimated_delivery: '5-7 business days',
          tracking_available: true,
          fallback: true
        }];
      }
      
      console.warn('Shipping methods API not available, returning fallback:', result.error);
      return [{
        id: 1,
        name: 'Standard Shipping',
        price: 9.99,
        description: '5-7 business days',
        details: 'Standard delivery service with tracking included.',
        estimated_delivery: '5-7 business days',
        tracking_available: true,
        fallback: true
      }];
    }
    
    // Handle different response formats
    let shippingMethods = [];
    if (Array.isArray(result)) {
      shippingMethods = result;
    } else if (result?.results && Array.isArray(result.results)) {
      shippingMethods = result.results;
    } else if (result?.data && Array.isArray(result.data)) {
      shippingMethods = result.data;
    } else if (result && typeof result === 'object' && !result.error) {
      // If it's a single object, wrap it in an array
      shippingMethods = [result];
    }
    
    // Format and validate shipping methods
    const formattedMethods = shippingMethods.map(method => ({
      ...method,
      id: method.id || method.pk || Math.random().toString(36).substr(2, 9),
      name: method.name || 'Unknown Shipping Method',
      price: (() => {
        const parsed = typeof method.price === 'number' ? method.price : parseFloat(method.price || 0);
        return isNaN(parsed) ? 0 : parsed;
      })(),
      description: method.description || method.estimated_delivery || 'Standard delivery',
      details: method.details || method.description || 'Delivery service',
      estimated_delivery: method.estimated_delivery || method.description || '3-5 business days',
      tracking_available: method.tracking_available !== undefined ? method.tracking_available : true
    }));
    
    console.log('🚚 Formatted shipping methods:', formattedMethods);
    return formattedMethods.length > 0 ? formattedMethods : [{
      id: 1,
      name: 'Standard Shipping',
      price: 9.99,
      description: '5-7 business days',
      details: 'Standard delivery service with tracking included.',
      estimated_delivery: '5-7 business days',
      tracking_available: true,
      fallback: true
    }];
    
  } catch (error) {
    console.warn('Failed to fetch shipping methods, using fallback:', error);
    return [{
      id: 1,
      name: 'Standard Shipping',
      price: 9.99,
      description: '5-7 business days',
      details: 'Standard delivery service with tracking included.',
      estimated_delivery: '5-7 business days',
      tracking_available: true,
      fallback: true
    }];
  }
});

// Get shipping price for specific quantity
export const getShippingPriceForQuantity = async (methodId, quantity) => {
  return fetchAPI(`/api/orders/shipping-methods/${methodId}/price-for-quantity/?quantity=${quantity}`);
};

// Cart & Shipping Analysis API - Advanced shipping logic
export const analyzeCartShipping = async (cartItems) => {
  // Transform cart items to the format expected by the API
  const apiCartItems = cartItems.map(item => {
    const productId = item.productId || item.product_id || item.id || item.uuid;
    
    // Validate productId exists
    if (!productId) {
      console.error('❌ Cart item missing productId:', item);
      throw new Error(`Cart item missing valid productId: ${JSON.stringify(item)}`);
    }
    
    return {
      product_id: productId,
      quantity: item.quantity || 1,
      ...(item.color && { color: item.color }),
      ...(item.size && { size: item.size })
    };
  });

  const response = await fetchAPI('/api/orders/analyze-cart-shipping/', {
    method: 'POST',
    body: JSON.stringify({
      cart_items: apiCartItems
    })
  });

  if (response.error) {
    console.error('Cart shipping analysis failed:', response.error);
    return {
      success: false,
      error: response.error,
      fallback: {
        cart_analysis: {
          items: cartItems,
          subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
          total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          shipping_categories_count: 0,
          shipping_category_ids: []
        },
        shipping_analysis: {
          requires_split_shipping: false,
          available_methods_count: 1,
          available_methods: [{
            id: 1,
            name: 'Standard Shipping',
            description: 'Standard delivery service',
            base_price: '9.99',
            calculated_price: '9.99'
          }],
          free_shipping_eligible: false,
          qualifying_free_rule: null
        }
      }
    };
  }

  return response;
};

// Enhanced Checkout API functions using Next.js API routes
export const analyzeCartShippingNext = async (cartItems) => {
  try {
    const response = await fetch('/api/checkout/shipping-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_items: cartItems.map(item => ({
          product_id: item.productId || item.product_id || item.id,
          quantity: item.quantity || 1,
          ...(item.color && { color: item.color }),
          ...(item.size && { size: item.size })
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Next.js shipping analysis failed:', error);
    throw error;
  }
};

export const calculateCheckoutNext = async ({
  cartItems,
  couponCode = null,
  selectedShippingMethodId = null,
  userId = null,
  userInfo = null
}) => {
  try {
    const response = await fetch('/api/checkout/calculation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_items: cartItems.map(item => ({
          product_id: item.productId || item.product_id || item.id,
          quantity: item.quantity || 1,
          ...(item.color && { color: item.color }),
          ...(item.size && { size: item.size }),
          ...(item.price && { price: item.price })
        })),
        ...(couponCode && { coupon_code: couponCode }),
        ...(selectedShippingMethodId && { selected_shipping_method_id: selectedShippingMethodId }),
        ...(userId && { user_id: userId }),
        ...(userInfo && { user_info: userInfo })
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Next.js checkout calculation failed:', error);
    throw error;
  }
};

export const completeCheckoutNext = async ({
  cartItems,
  userInfo,
  shippingMethodId,
  couponCode = null,
  paymentMethod = 'pending',
  userId = null
}) => {
  try {
    const response = await fetch('/api/checkout/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart_items: cartItems.map(item => ({
          product_id: item.productId || item.product_id || item.id,
          quantity: item.quantity || 1,
          ...(item.color && { color: item.color }),
          ...(item.size && { size: item.size }),
          ...(item.price && { price: item.price })
        })),
        user_info: userInfo,
        shipping_method_id: shippingMethodId,
        ...(couponCode && { coupon_code: couponCode }),
        payment_method: paymentMethod,
        ...(userId && { user_id: userId })
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Next.js checkout completion failed:', error);
    throw error;
  }
};

// Enhanced checkout calculation API
export const calculateEnhancedCheckout = async (cartItems, selectedShippingMethodId = null) => {
  const apiCartItems = cartItems.map(item => ({
    product_id: item.productId || item.id,
    quantity: item.quantity || 1
  }));

  const response = await fetchAPI('/api/orders/enhanced-checkout-calculation/', {
    method: 'POST',
    body: JSON.stringify({
      cart_items: apiCartItems,
      shipping_method_id: selectedShippingMethodId
    })
  });

  if (response.error) {
    console.error('Enhanced checkout calculation failed:', response.error);
    // Return fallback calculation
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = selectedShippingMethodId && selectedShippingMethodId !== 'free' ? 9.99 : 0;
    return {
      success: false,
      error: response.error,
      fallback: {
        subtotal: subtotal.toFixed(2),
        shipping_cost: shipping.toFixed(2),
        total: (subtotal + shipping).toFixed(2)
      }
    };
  }

  return response;
};

// Get free shipping rules
export const getFreeShippingRules = cache(async () => {
  const response = await fetchAPI('/api/orders/free-shipping-rules/');
  return response?.results || response || [];
});

// Check free shipping eligibility
export const checkFreeShippingEligibility = async (amount, categoryId = null) => {
  const params = new URLSearchParams({ amount: amount.toString() });
  if (categoryId) {
    params.append('category_id', categoryId.toString());
  }
  
  return fetchAPI(`/api/orders/free-shipping-rules/check-eligibility/?${params.toString()}`);
};

// Cart functions - Frontend cart uses localStorage, not backend API
export const getCart = cache(async () => {
  // Cart is handled on frontend via localStorage, not backend API
  if (typeof window !== 'undefined') {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        // Ensure price and quantity are always numbers for cart items
        return Array.isArray(cartItems) ? cartItems.map(item => ({
          ...item,
          price: (() => {
            const parsed = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
            return isNaN(parsed) ? 0 : parsed;
          })(),
          quantity: (() => {
            const parsed = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 1);
            return isNaN(parsed) ? 1 : parsed;
          })()
        })) : [];
      }
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
    }
  }
  
  // Return empty cart if no localStorage or error
  return [];
});

export const addToCart = async (productId, quantity = 1, size = null, color = null) => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      // Create a unique variant ID based on product, size, and color
      const variantId = `${productId}_${size || 'default'}_${color || 'default'}`;
      
      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.variantId === variantId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cartItems.push({
          id: productId,
          variantId,
          quantity,
          size,
          color,
          // Note: You might want to fetch product details here to get name, price, etc.
        });
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { success: true, cartItems };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { error: 'Failed to add item to cart' };
    }
  }
  
  return { error: 'localStorage not available' };
};

export const updateCartItem = async (itemId, quantity) => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const itemIndex = cartItems.findIndex(item => item.variantId === itemId);
      
      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = quantity;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        return { success: true, cartItems };
      }
      
      return { error: 'Item not found in cart' };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { error: 'Failed to update cart item' };
    }
  }
  
  return { error: 'localStorage not available' };
};

export const removeFromCart = async (itemId) => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCart = cartItems.filter(item => item.variantId !== itemId);
      
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      return { success: true, cartItems: updatedCart };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { error: 'Failed to remove item from cart' };
    }
  }
  
  return { error: 'localStorage not available' };
};

export const clearCart = async () => {
  // Cart is handled on frontend via localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('cartItems');
      console.log('✅ Cart cleared from localStorage');
      return { success: true, cartItems: [] };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { error: 'Failed to clear cart' };
    }
  }
  
  return { error: 'localStorage not available' };
};

// Clear cart after successful checkout - specifically for post-order cleanup
export const clearCartAfterCheckout = async () => {
  console.log('🛒 Clearing cart after successful checkout');
  const result = await clearCart();
  
  // Dispatch a custom event to notify components that cart has been cleared
  if (typeof window !== 'undefined' && result.success) {
    window.dispatchEvent(new CustomEvent('cartCleared', { 
      detail: { reason: 'checkout_success' } 
    }));
  }
  
  return result;
};

// Coupon functions
export const getCoupons = cache(async () => fetchAPI('/api/orders/coupons/', {
  next: { revalidate: 180 } // Cache for 3 minutes
}));

export const getActiveCoupons = cache(async () => {
  try {
    const result = await fetchAPI('/api/orders/coupons/', {
      next: { revalidate: 180 } // Cache for 3 minutes
    });
    if (result?.error) {
      console.warn('Active coupons API not available, returning empty array:', result.error);
      return [];
    }
    // The backend already filters for active coupons in CouponViewSet.get_queryset()
    return Array.isArray(result) ? result : result?.results || [];
  } catch (error) {
    console.warn('Failed to fetch active coupons:', error);
    return [];
  }
});

export const validateCoupon = async (couponCode, cartItems, cartTotal = null, userId = null) => {
  const requestBody = {
    coupon_code: couponCode,
    cart_items: cartItems
  };

  // Add optional parameters if provided
  if (cartTotal !== null) {
    requestBody.cart_total = cartTotal;
  }
  if (userId !== null) {
    requestBody.user_id = userId;
  }

  return fetchAPI('/api/orders/coupons/validate/', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
};

// Order fetches (requires authentication)
export const getUserOrders = async (userId) => {
  if (!userId) {
    console.warn('getUserOrders: No userId provided');
    return { error: 'User ID is required to fetch orders' };
  }
  
  try {
    if (DEBUG_API) {
      console.log('🔍 Fetching orders for user:', userId);
    }
    // Check if user is authenticated before making the request
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { error: 'Authentication required. Please login again.' };
      }
    }
    
    // Use the correct endpoint: /api/orders/orders/ with user parameter
    const result = await fetchAPI(`/api/orders/orders/?user=${userId}`);
    if (DEBUG_API) {
      console.log('📦 Orders API result:', result);
    }
    
    // Handle error responses
    if (result && result.error) {
      console.error('getUserOrders error:', result.error);
      return result; // Return the full error object
    }
    
    // The API should return an array of orders directly
    // If result has a 'results' property (pagination), use that, otherwise use the result itself
    const orders = result.results || (Array.isArray(result) ? result : []);
    
    if (DEBUG_API) {
      console.log('📦 Processed orders:', orders.length, 'orders found');
    }
    
    return orders;
    
  } catch (error) {
    console.error('getUserOrders exception:', error);
    return { error: `Failed to fetch orders: ${error.message}` };
  }
};

// Get orders for the current authenticated user (without requiring userId parameter)
export const getCurrentUserOrders = async () => {
  try {
    if (DEBUG_API) {
      console.log('🔍 Fetching orders for current authenticated user');
    }
    
    // Check if user is authenticated before making the request
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { error: 'Authentication required. Please login again.' };
      }
    }
    
    // Use the endpoint without user parameter - backend will filter by current user automatically
    const result = await fetchAPI('/api/orders/orders/');
    if (DEBUG_API) {
      console.log('📦 Current user orders API result:', result);
    }
    
    // Handle error responses
    if (result && result.error) {
      console.error('getCurrentUserOrders error:', result.error);
      return result; // Return the full error object
    }
    
    // The API should return an array of orders directly
    // If result has a 'results' property (pagination), use that, otherwise use the result itself
    const orders = result.results || (Array.isArray(result) ? result : []);
    
    if (DEBUG_API) {
      console.log('📦 Processed current user orders:', orders.length, 'orders found');
    }
    
    return orders;
    
  } catch (error) {
    console.error('getCurrentUserOrders exception:', error);
    return { error: `Failed to fetch orders: ${error.message}` };
  }
};
export const getOrderDetails = async (orderNumber) => fetchAPI(`/api/orders/orders/${orderNumber}/`);

// Order creation with payment info
export const createOrderWithPayment = async (orderData) => {
  return fetchAPI('/api/orders/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

// Confirm payment with transaction details
export const confirmPayment = async (paymentData) => {
  return fetchAPI('/api/orders/orders/confirm-payment/', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// Checkout data fetching function
export const getCheckoutData = async () => {
  try {
    // Fetch all required data in parallel
    const [cartResponse, shippingResponse, couponsResponse] = await Promise.allSettled([
      getCart(),
      getShippingMethods(),
      getActiveCoupons()
    ]);

    // Handle cart items
    let cartItems = [];
    if (cartResponse.status === 'fulfilled' && !cartResponse.value?.error) {
      cartItems = Array.isArray(cartResponse.value) ? cartResponse.value : cartResponse.value?.items || [];
    } else {
      console.error('Failed to fetch cart items:', cartResponse.reason || cartResponse.value?.error);
      // Fallback to empty cart
      cartItems = [];
    }

    // Handle shipping methods
    let shippingMethods = [];
    if (shippingResponse.status === 'fulfilled' && !shippingResponse.value?.error) {
      shippingMethods = Array.isArray(shippingResponse.value) ? shippingResponse.value : shippingResponse.value?.results || [];
    } else {
      console.error('Failed to fetch shipping methods:', shippingResponse.reason || shippingResponse.value?.error);
      // Fallback shipping method
      shippingMethods = [{
        id: 1,
        name: 'Standard Shipping',
        price: 9.99,
        description: '5-7 business days',
        details: 'Standard delivery service with tracking included.',
        estimated_delivery: '5-7 business days',
        tracking_available: true
      }];
    }

    // Handle active coupons
    let activeCoupons = [];
    if (couponsResponse.status === 'fulfilled' && !couponsResponse.value?.error) {
      activeCoupons = Array.isArray(couponsResponse.value) ? couponsResponse.value : couponsResponse.value?.results || [];
    } else {
      console.error('Failed to fetch active coupons:', couponsResponse.reason || couponsResponse.value?.error);
      // Fallback to empty coupons array
      activeCoupons = [];
    }

    return {
      cartItems,
      shippingMethods,
      activeCoupons,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching checkout data:', error);
    
    // Return empty data instead of fallback
    return {
      cartItems: [],
      shippingMethods: [],
      activeCoupons: [],
      error: 'Failed to fetch checkout data',
      timestamp: new Date().toISOString()
    };
  }
};

// Authentication functions
export const loginUser = async (email, password) => {
  const response = await fetchAPI('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.error) {
    return response; // Return error response instead of throwing
  }

  // Store tokens in localStorage
  if (response.access && response.refresh) {
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    // Store user info if available
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }

  return response;
};

export const signupUser = async (userData) => {
  const response = await fetchAPI('/api/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (response.error) {
    return response; // Return error response instead of throwing
  }

  // Store user info if available (registration doesn't return tokens by default)
  if (response.user) {
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  return response;
};

// Website Data API Functions
export const getWebsiteData = cache(async () => {
  if (DEBUG_API) console.log('🌐 Fetching all website data...');
  return fetchAPI('/api/website/api/data/all/');
});

export const getNavbarData = cache(async () => {
  if (DEBUG_API) console.log('🌐 Fetching navbar data...');
  return fetchAPI('/api/website/api/data/navbar/');
});

export const getOfferCategories = cache(async () => {
  if (DEBUG_API) console.log('🌐 Fetching offer categories...');
  try {
    const response = await fetchAPI('/api/website/offer-categories/', {
      next: { revalidate: 600 } // Cache for 10 minutes
    });
    
    if (response?.error) {
      console.warn('Offer categories API error:', response.error);
      return [];
    }
    
    return response?.results || response || [];
  } catch (error) {
    console.warn('Offer categories fetch failed:', error);
    return [];
  }
});

export const getHeroBanners = cache(async () => {
  if (DEBUG_API) console.log('🌐 Fetching hero banners...');
  return fetchAPI('/api/website/hero-banners/');
});

export const getHorizontalBanners = cache(async () => {
  try {
    if (DEBUG_API) console.log('🌐 Fetching horizontal banners...');
    return await fetchAPI('/api/website/horizontal-banners/', {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
  } catch (error) {
    console.error('Error fetching horizontal banners:', error);
    return { results: [], count: 0 };
  }
});

export const getOfferBanners = cache(async () => {
  try {
    if (DEBUG_API) console.log('🌐 Fetching offer banners...');
    return await fetchAPI('/api/website/offer-banners/', {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
  } catch (error) {
    console.error('Error fetching offer banners:', error);
    return { results: [], count: 0 };
  }
});

export const getFooterData = cache(async () => {
  if (DEBUG_API) console.log('🌐 Fetching footer data...');
  return fetchAPI('/api/website/api/data/footer/');
});