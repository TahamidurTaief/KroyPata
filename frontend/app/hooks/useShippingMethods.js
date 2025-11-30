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
  const response = await fetch(`${API_BASE_URL}/api/shipping-methods/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle paginated response - extract results if it's a paginated response
      const methods = data.results || data || [];
      setShippingMethods(methods);
    } catch (err) {
      console.error('Error fetching shipping methods:', err);
      
      // Provide fallback shipping methods when API fails
      const fallbackMethods = [
        {
          id: 'standard',
          name: 'Standard Delivery',
          title: 'Standard Delivery (3-5 days)',
          price: '5.99',
          description: 'Standard delivery within 3-5 business days.',
          delivery_estimated_time: '3-5 business days',
          base_price: 5.99
        },
        {
          id: 'express',
          name: 'Express Delivery',
          title: 'Express Delivery (1-2 days)',
          price: '12.99',
          description: 'Fast delivery within 1-2 business days.',
          delivery_estimated_time: '1-2 business days',
          base_price: 12.99
        }
      ];
      
      console.log('🚚 Using fallback shipping methods');
      setShippingMethods(fallbackMethods);
      setError(null); // Don't show error when using fallbacks
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
