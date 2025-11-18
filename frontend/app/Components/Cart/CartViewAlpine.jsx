// app/Components/Cart/CartViewAlpine.jsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import CheckoutSteps from './CheckoutSteps';
import Link from 'next/link';
import Tk_icon from "../Common/Tk_icon";

// React-powered cart view with dynamic shipping updates
const CartViewAlpine = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  // Initialize cart data from localStorage
  const initialCartData = () => {
    if (typeof window === 'undefined') return [];
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        const parsedItems = JSON.parse(storedCart);
        return parsedItems.map((item, index) => ({
          ...item,
          variantId: item.variantId || item.id || `cart-item-${index}`,
          id: item.id || index + 1,
          productId: item.productId || item.id || `product-${index}`
        }));
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        return [];
      }
    }
    return [];
  };

  // Load cart data
  useEffect(() => {
    const items = initialCartData();
    setCartItems(items);
    calculateTotal(items);
    setIsLoading(false);
  }, []);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
    }, 0);
    setCartTotal(total);
  };

  const updateQuantity = (variantId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => 
      item.variantId === variantId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    }
  };

  const removeItem = (variantId) => {
    const updatedItems = cartItems.filter(item => item.variantId !== variantId);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps currentStep={1} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart Items & Shipping */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <AnimatePresence>
            {cartItems.length > 0 ? (
              <motion.div 
                className="bg-white rounded-xl border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.variantId}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                          src={item.image || '/img/placeholder.jpg'} 
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                          <Tk_icon className="mr-1" size={16} />{parseFloat(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                          min="1"
                        />
                        
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                        
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="ml-4 text-red-500 hover:text-red-700 font-medium flex items-center gap-2"
                        >
                          <FaTrash className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-gray-500 text-lg mb-4">Your cart is empty</div>
                <Link 
                  href="/products" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  continue 
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold"><Tk_icon className="mr-1" size={16} />{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span><Tk_icon className="mr-1" size={16} />{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {cartItems.length > 0 && (
              <Link 
                href="/checkout" 
                className="w-full mt-6 relative overflow-hidden rounded-full text-center block font-semibold lato text-base group"
                style={{
                  background: 'var(--color-button-primary)',
                  color: 'var(--color-primary-foreground, #fff)',
                  padding: '0.85rem 1.25rem',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.15)',
                  transition: 'background .25s, box-shadow .25s'
                }}
              >
                <span className="relative z-10 flex text-[var(--color-text-primary)] items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <svg className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0))'}} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartViewAlpine;
