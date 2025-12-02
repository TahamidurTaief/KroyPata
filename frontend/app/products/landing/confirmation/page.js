'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiHome, FiShoppingBag } from 'react-icons/fi';
import Link from 'next/link';

export default function LandingConfirmationPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from sessionStorage
    const storedOrderData = sessionStorage.getItem('landingOrderConfirmation');
    
    if (storedOrderData) {
      try {
        const parsedData = JSON.parse(storedOrderData);
        setOrderData(parsedData);
      } catch (error) {
        console.error('Error parsing order data:', error);
        router.push('/products');
      }
    } else {
      // No order data, redirect to products
      router.push('/products');
    }
  }, [router]);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-button-primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-xl p-6 border" 
             style={{ 
               background: 'var(--color-second-bg)',
               borderColor: 'var(--color-border)'
             }}>
          
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <FiCheckCircle className="w-16 h-16" style={{ color: 'var(--color-accent-green)' }} strokeWidth={2} />
          </div>
          
          {/* Success Message */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2" 
                style={{ color: 'var(--color-text-primary)' }}>
              Order Placed Successfully!
            </h1>
            
            <p className="text-sm mb-4" 
               style={{ color: 'var(--color-text-secondary)' }}>
              Thank you for your order. We'll contact you shortly.
            </p>
            
            {/* Order Number Badge */}
            <div className="inline-block px-4 py-2 rounded-lg border"
                 style={{ 
                   background: 'var(--color-background)',
                   borderColor: 'var(--color-border)'
                 }}>
              <p className="text-xs font-medium mb-0.5" 
                 style={{ color: 'var(--color-text-secondary)' }}>
                Order Number
              </p>
              <p className="text-lg font-bold" 
                 style={{ color: 'var(--color-accent-orange)' }}>
                {orderData.order_number}
              </p>
            </div>
          </div>
          
          {/* Action Buttons - Vertical Stack */}
          <div className="space-y-3">
            <Link 
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{
                background: 'var(--color-button-primary)',
                color: 'white'
              }}
            >
              <FiHome size={18} />
              <span>Go to Home</span>
            </Link>
            
            <Link 
              href="/products"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border transition-colors hover:bg-opacity-5"
              style={{
                borderColor: 'var(--color-button-primary)',
                color: 'var(--color-button-primary)',
                background: 'transparent'
              }}
            >
              <FiShoppingBag size={18} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
