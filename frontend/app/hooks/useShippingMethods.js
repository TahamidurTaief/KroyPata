"use client";

import { useState, useEffect } from 'react';

const useShippingMethods = () => {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const response = await fetch(`${API_BASE_URL}/api/orders/shipping-methods/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle paginated response - extract results if it's a paginated response
      const methods = data.results || data || [];
      setShippingMethods(methods);
    } catch (err) {
      console.error('Error fetching shipping methods:', err);
      setError(err.message || 'Failed to load shipping methods');
      setShippingMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const refetch = () => {
    fetchShippingMethods();
  };

  return {
    shippingMethods,
    loading,
    error,
    refetch
  };
};

export default useShippingMethods;
