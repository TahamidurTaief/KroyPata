"use client";

import React from 'react';
import { CheckoutProvider } from '@/app/contexts/CheckoutContext';
import CheckoutProcess from '@/app/Components/Cart/CheckoutProcess';

// Demo page with sample cart data for testing
const CheckoutDemo = () => {
  return (
    <CheckoutProvider>
      <DemoCheckoutWithSampleData />
    </CheckoutProvider>
  );
};

const DemoCheckoutWithSampleData = () => {
  // Initialize with sample cart data for demo purposes
  React.useEffect(() => {
    const sampleCartItems = [
      {
        id: 1,
        name: 'Sample Product 1',
        price: 29.99,
        quantity: 2,
        product_name: 'Sample Product 1'
      },
      {
        id: 2,
        name: 'Sample Product 2', 
        price: 49.99,
        quantity: 1,
        product_name: 'Sample Product 2'
      },
      {
        id: 3,
        name: 'Sample Product 3',
        price: 15.99,
        quantity: 3,
        product_name: 'Sample Product 3'
      }
    ];

    // Set sample data in localStorage for demo
    localStorage.setItem('cartItems', JSON.stringify(sampleCartItems));
    
    // Trigger a storage event to update the context
    window.dispatchEvent(new Event('storage'));
  }, []);

  return (
    <div className="min-h-screen lato" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container mx-auto py-8 lato">
        <div className="mb-6 p-4 rounded-lg" style={{ 
          backgroundColor: 'var(--color-second-bg)', 
          border: '1px solid var(--color-border)' 
        }}>
          <h2 className="text-lg font-semibold lato" style={{ color: 'var(--color-text-primary)' }}>Demo Mode</h2>
          <p className="lato" style={{ color: 'var(--color-text-secondary)' }}>
            This page demonstrates the checkout process with sample cart data. 
            Try different coupon codes like: SAVE10, CART50, WELCOME15, VIP25
          </p>
        </div>
        
        <CheckoutProcess />
      </div>
    </div>
  );
};

export default CheckoutDemo;
