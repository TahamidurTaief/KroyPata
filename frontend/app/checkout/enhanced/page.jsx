// app/checkout/enhanced/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import EnhancedCheckout from '../../Components/Checkout/EnhancedCheckout';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../../context/MessageContext';
import { getCart } from '../../lib/api';

const EnhancedCheckoutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { showMessage } = useMessage();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart items on component mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const items = await getCart();
        
        if (items.error) {
          setError(items.error);
          return;
        }

        // Ensure we have valid cart items
        const validItems = Array.isArray(items) ? items.filter(item => 
          item && (item.id || item.product_id) && item.quantity > 0
        ) : [];
        
        setCartItems(validItems);

        // Redirect if cart is empty
        if (validItems.length === 0) {
          showMessage('Your cart is empty. Please add items before checkout.', 'warning');
          setTimeout(() => {
            window.location.href = '/cart';
          }, 2000);
          return;
        }

      } catch (err) {
        console.error('Failed to load cart:', err);
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [showMessage]);

  const handleOrderComplete = (orderData) => {
    console.log('Order completed:', orderData);
    
    // Clear cart after successful order
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cartItems');
      window.dispatchEvent(new CustomEvent('cartCleared', { 
        detail: { reason: 'checkout_success' } 
      }));
    }

    // Show success message
    showMessage('Your order has been placed successfully!', 'success');

    // Redirect to order confirmation
    setTimeout(() => {
      if (orderData.order?.order_number) {
        window.location.href = `/orders/${orderData.order.order_number}`;
      } else {
        window.location.href = '/orders';
      }
    }, 2000);
  };

  const handleCancel = () => {
    window.location.href = '/cart';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Checkout</h2>
          <p className="text-gray-600">Preparing your order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checkout Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/cart'}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5m6-2.5l2.5 2.5M17 13l-2.5 2.5" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
          <button
            onClick={() => window.location.href = '/products'}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            continue 
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Enhanced Checkout</h1>
            </div>
            <div className="text-sm text-gray-600">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <EnhancedCheckout
          cartItems={cartItems}
          onOrderComplete={handleOrderComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EnhancedCheckoutPage;
