// app/lib/searchApi.js
import { getProducts, getCategories } from './api';

/**
 * Search for products and categories based on query
 * @param {string} query - Search query
 * @returns {Promise<{products: Array, categories: Array, loading: boolean, error: string|null}>}
 */
export const searchProductsAndCategories = async (query) => {
  console.log('🔍 searchProductsAndCategories called with:', query);
  
  if (!query || query.trim().length === 0) {
    console.log('🔍 Empty query, returning empty results');
    return {
      products: [],
      categories: [],
      loading: false,
      error: null
    };
  }

  try {
    const trimmedQuery = query.trim().toLowerCase();
    console.log('🔍 Searching with trimmed query:', trimmedQuery);
    
    // Search products using the existing API
    console.log('🔍 Calling getProducts and getCategories...');
    const [productsResult, categoriesResult] = await Promise.all([
      getProducts({ search: trimmedQuery, page: 1 }, 1),
      getCategories()
    ]);

    console.log('🔍 Raw API results:', { productsResult, categoriesResult });

    // Handle products result
    let products = [];
    if (productsResult && !productsResult.error) {
      products = productsResult.results || productsResult || [];
      console.log('🔍 Processed products:', products.length);
    } else {
      console.log('🔍 Products result error or empty:', productsResult);
    }

    // Handle categories result - filter client-side since API might not support search
    let categories = [];
    if (categoriesResult && !categoriesResult.error) {
      const allCategories = categoriesResult.results || categoriesResult || [];
      categories = allCategories.filter(category =>
        category.name?.toLowerCase().includes(trimmedQuery)
      );
      console.log('🔍 Processed categories:', categories.length);
    } else {
      console.log('🔍 Categories result error or empty:', categoriesResult);
    }

    // Limit results for better performance in search modal
    const limitedProducts = products.slice(0, 10); // Show max 10 products
    const limitedCategories = categories.slice(0, 5); // Show max 5 categories

    console.log('🔍 Final results:', {
      products: limitedProducts.length,
      categories: limitedCategories.length
    });

    return {
      products: limitedProducts,
      categories: limitedCategories,
      loading: false,
      error: null
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      products: [],
      categories: [],
      loading: false,
      error: error.message || 'Failed to search'
    };
  }
};

/**
 * Debounced search function
 * @param {string} query - Search query
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Promise} - Promise that resolves after delay
 */
export const debouncedSearch = (query, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(searchProductsAndCategories(query));
    }, delay);
  });
};
