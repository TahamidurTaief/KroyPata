// API connectivity testing and safe fetching utilities
// Note: Despite the name "testApi", this file provides essential runtime functionality

export const testApiConnectivity = async () => {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.chinakroy.com').replace(/\/+$/, '');
  
  try {
    console.log('🧪 Testing API connectivity to:', API_BASE_URL);
    
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/admin/`, {
      method: 'HEAD',
      timeout: 5000
    });
    
    console.log('✅ API server is reachable:', response.status);
    return { connected: true, status: response.status };
  } catch (error) {
    console.warn('❌ API server not reachable:', error.message);
    return { connected: false, error: error.message };
  }
};

// Enhanced fetch with better error handling
export const safeFetchWithFallback = async (endpoint) => {
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.chinakroy.com').replace(/\/+$/, '');
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Success for ${endpoint}:`, data);
    return { data, error: null, fallback: false };
    
  } catch (error) {
    console.warn(`❌ API Failed for ${endpoint}:`, error.message);
    
    // Return error without fallback data
    return { data: null, error: error.message, fallback: false };
  }
};
