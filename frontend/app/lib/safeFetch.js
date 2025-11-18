// Safe fetch utility to handle controller transform algorithm errors
export const safeFetch = async (url, options = {}) => {
  const controller = new AbortController();
  
  try {
    // Set a reasonable timeout
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      // Force specific headers to avoid streaming issues
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Prevent caching issues that can cause transform errors
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON, got ${contentType}. Response: ${text.slice(0, 100)}...`);
    }
    
    // Parse JSON safely
    const data = await response.json();
    return { data, error: null };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return { data: null, error: 'Request timeout' };
    }
    
    // Log the full error for debugging
    console.error('Fetch error:', {
      url,
      message: error.message,
      stack: error.stack,
    });
    
    return { data: null, error: error.message };
  } finally {
    // Cleanup
    if (!controller.signal.aborted) {
      controller.abort();
    }
  }
};

// Retry utility for unreliable connections
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await safeFetch(url, options);
    
    if (!error) {
      return { data, error: null };
    }
    
    lastError = error;
    
    // Wait before retrying (exponential backoff)
    if (i < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { data: null, error: lastError };
};
