// API Error Handler Utility
// Provides consistent error handling across all API calls

/**
 * Standard API error response structure
 */
export class APIError extends Error {
  constructor(message, code, statusCode, details = null) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Error codes for consistent error handling
 */
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Handle API response errors consistently
 * @param {Response} response - Fetch API response object
 * @param {string} endpoint - API endpoint for context
 * @returns {Promise<APIError>}
 */
export async function handleAPIError(response, endpoint) {
  const statusCode = response.status;
  let errorMessage = response.statusText || 'Unknown error';
  let errorCode = ERROR_CODES.UNKNOWN_ERROR;
  let errorDetails = null;

  try {
    const contentType = response.headers.get('content-type');
    
    // Try to parse JSON error response
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
      errorDetails = errorData.errors || errorData;
    }
  } catch (parseError) {
    console.warn('Failed to parse error response:', parseError);
  }

  // Map status codes to error codes
  if (statusCode === 401 || statusCode === 403) {
    errorCode = ERROR_CODES.AUTH_ERROR;
  } else if (statusCode === 404) {
    errorCode = ERROR_CODES.NOT_FOUND;
  } else if (statusCode === 400) {
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  } else if (statusCode >= 500) {
    errorCode = ERROR_CODES.SERVER_ERROR;
  }

  return new APIError(errorMessage, errorCode, statusCode, errorDetails);
}

/**
 * Handle network/fetch errors consistently
 * @param {Error} error - Original error object
 * @param {string} endpoint - API endpoint for context
 * @returns {APIError}
 */
export function handleFetchError(error, endpoint) {
  let errorCode = ERROR_CODES.UNKNOWN_ERROR;
  let message = error.message || 'Network request failed';

  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    errorCode = ERROR_CODES.TIMEOUT_ERROR;
    message = 'Request timeout - Please try again';
  } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
    errorCode = ERROR_CODES.NETWORK_ERROR;
    message = 'Network error - Please check your connection';
  } else if (error.name === 'SyntaxError') {
    errorCode = ERROR_CODES.PARSE_ERROR;
    message = 'Failed to parse server response';
  }

  return new APIError(message, errorCode, 0, { originalError: error.message, endpoint });
}

/**
 * Format error for display to users
 * @param {APIError|Error} error
 * @returns {string}
 */
export function formatErrorMessage(error) {
  if (error instanceof APIError) {
    switch (error.code) {
      case ERROR_CODES.NETWORK_ERROR:
        return 'Unable to connect to the server. Please check your internet connection.';
      case ERROR_CODES.TIMEOUT_ERROR:
        return 'Request timed out. Please try again.';
      case ERROR_CODES.AUTH_ERROR:
        return 'Authentication required. Please login to continue.';
      case ERROR_CODES.VALIDATION_ERROR:
        return error.details ? 
          Object.values(error.details).flat().join(', ') : 
          error.message;
      case ERROR_CODES.NOT_FOUND:
        return 'The requested resource was not found.';
      case ERROR_CODES.SERVER_ERROR:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return error.message || 'An unexpected error occurred.';
}

/**
 * Check if error is recoverable (should retry)
 * @param {APIError} error
 * @returns {boolean}
 */
export function isRecoverableError(error) {
  return error.code === ERROR_CODES.NETWORK_ERROR || 
         error.code === ERROR_CODES.TIMEOUT_ERROR ||
         (error.code === ERROR_CODES.SERVER_ERROR && error.statusCode >= 502);
}

/**
 * Log error with context for debugging
 * @param {APIError|Error} error
 * @param {Object} context - Additional context information
 */
export function logError(error, context = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      ...context,
    });
  }
}

/**
 * Retry wrapper for API calls with exponential backoff
 * @param {Function} apiCall - Async function to call
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise}
 */
export async function retryWithBackoff(apiCall, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not recoverable
      if (error instanceof APIError && !isRecoverableError(error)) {
        throw error;
      }
      
      // Don't wait on last attempt
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
