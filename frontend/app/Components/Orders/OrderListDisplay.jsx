'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Calendar,
  Package,
  X,
  Truck,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders, getCurrentUserOrders } from '@/app/lib/api.js';
import Tk_icon from '../Common/Tk_icon';

export default function OrderListDisplay() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated, openAuthModal, user } = useAuth();

  useEffect(() => {
    let ignore = false;
    
    async function fetchOrders() {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!isAuthenticated) {
          console.log('OrderListDisplay: User not authenticated');
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        console.log('OrderListDisplay: Fetching orders for authenticated user');
        
        // Try to fetch orders using user ID if available, otherwise use current user endpoint
        let data;
        if (user?.id) {
          console.log('OrderListDisplay: Using getUserOrders with user ID:', user.id);
          data = await getUserOrders(user.id);
        } else {
          console.log('OrderListDisplay: Using getCurrentUserOrders');
          data = await getCurrentUserOrders();
        }
        
        console.log('OrderListDisplay: Orders fetched:', data);
        
        if (!ignore) {
          // Check if the response is an error object
          if (data && data.error) {
            console.error('OrderListDisplay: Error fetching orders:', data.error);
            setError(data.error);
            setOrders([]);
            // If it's an authentication error, trigger auth modal and don't show error to user
            if (data.error.includes('Authentication required') || data.error.includes('login')) {
              setError(null); // Clear error so user doesn't see it
              openAuthModal('login');
            }
          } else if (Array.isArray(data)) {
            console.log('OrderListDisplay: Setting orders:', data.length, 'orders');
            setOrders(data);
          } else {
            console.log('OrderListDisplay: Unexpected data format:', data);
            setOrders([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error('OrderListDisplay: Failed to fetch orders:', err);
          setError(err.message || 'Failed to load orders');
          setOrders([]);
          
          // If it's an authentication error, trigger login modal
          if (err.message && err.message.includes('Authentication')) {
            openAuthModal('login');
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    
    // Add a small delay to ensure auth state is properly set
    const timeoutId = setTimeout(fetchOrders, 100);
    return () => { 
      ignore = true; 
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, openAuthModal]);

  // Status color mapping using CSS custom properties
  const statusColor = {
    PENDING: 'bg-[var(--color-status-pending)]',
    PROCESSING: 'bg-[var(--color-status-processing)]',
    SHIPPED: 'bg-[var(--color-status-shipped)]',
    DELIVERED: 'bg-[var(--color-status-delivered)]',
    CANCELLED: 'bg-[var(--color-status-cancelled)]',
  };

  // Order progress steps
  const statusSteps = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  function OrderProgressTracker({ status }) {
    const currentIdx = statusSteps.indexOf(status);
    
    const stepIcons = {
      'PENDING': '📋',
      'PROCESSING': '⚡',
      'SHIPPED': '🚚',
      'DELIVERED': '📦',
      'CANCELLED': '❌',
    };
    
    return (
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm sm:text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--color-status-processing)] rounded-full animate-pulse flex-shrink-0"></div>
          <span>Order Progress</span>
        </h4>
        
        {/* Mobile: Vertical layout */}
        <div className="block sm:hidden space-y-3">
          {statusSteps.map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all duration-300 flex-shrink-0 ${
                idx < currentIdx
                  ? 'bg-[var(--color-status-delivered)] border-[var(--color-status-delivered)] text-white shadow-lg'
                  : idx === currentIdx
                  ? 'bg-[var(--color-status-processing)] border-[var(--color-status-processing)] text-white shadow-md animate-pulse'
                  : 'bg-[var(--color-background)] border-border text-text-secondary'
              }`}>
                {idx <= currentIdx ? stepIcons[step] : step[0]}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium transition-colors duration-300 ${
                  idx <= currentIdx ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {step}
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`w-full h-1 rounded-full mt-2 transition-all duration-500 ${
                    idx < currentIdx
                      ? 'bg-[var(--color-status-delivered)] shadow-sm'
                      : idx === currentIdx - 1
                      ? 'bg-[var(--color-status-processing)] animate-pulse'
                      : 'bg-border'
                  }`} />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          {statusSteps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full text-xs lg:text-sm font-bold border-2 transition-all duration-300 ${
                  idx < currentIdx
                    ? 'bg-[var(--color-status-delivered)] border-[var(--color-status-delivered)] text-white shadow-lg scale-110'
                    : idx === currentIdx
                    ? 'bg-[var(--color-status-processing)] border-[var(--color-status-processing)] text-white shadow-md animate-pulse'
                    : 'bg-[var(--color-background)] border-border text-text-secondary hover:border-[var(--color-status-processing)]'
                }`}>
                  {idx <= currentIdx ? stepIcons[step] : step[0]}
                </div>
                <div className={`text-xs font-medium transition-colors duration-300 text-center px-1 ${
                  idx <= currentIdx ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  <span className="hidden lg:inline">{step}</span>
                  <span className="lg:hidden">{step.slice(0, 4)}</span>
                </div>
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={`flex-1 h-1 rounded-full transition-all duration-500 min-w-[20px] ${
                  idx < currentIdx
                    ? 'bg-[var(--color-status-delivered)] shadow-sm'
                    : idx === currentIdx - 1
                    ? 'bg-[var(--color-status-processing)] animate-pulse'
                    : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  function TrackingHistory({ updates }) {
    return (
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 },
          },
        }}
      >
        {updates && updates.length > 0 ? (
          updates.map((update, idx) => (
            <motion.div
              key={idx}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <ListChecks className="text-accent mt-0.5 flex-shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base text-text-primary">
                  {update.status}
                </div>
                <div className="text-xs sm:text-sm text-text-secondary mt-1">
                  {format(new Date(update.timestamp), 'PPpp')}
                </div>
                {update.notes && (
                  <div className="text-xs sm:text-sm text-text-secondary mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border-l-2 border-accent/30">
                    {update.notes}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-text-secondary text-sm sm:text-base p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
            No tracking updates yet.
          </div>
        )}
      </motion.div>
    );
  }

  // Card for each order
  function OrderCard({ order }) {
    return (
      <motion.div
        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Order ID with modern styling */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-xl border border-blue-200/50 dark:border-blue-500/30">
            <BadgeCheck size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-blue-700 dark:text-blue-300 text-sm tracking-wider">{order.order_number}</span>
          </div>
          <div className={`w-4 h-4 rounded-full ${statusColor[order.status] || 'bg-gray-400'} shadow-lg ring-2 ring-white dark:ring-slate-900`} />
        </div>
        
        {/* Date with enhanced styling */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-4">
          <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
          <span>{format(new Date(order.ordered_at), 'PPpp')}</span>
        </div>
        
        {/* Status with modern badge design */}
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-slate-500 dark:text-slate-400" />
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold text-white ${statusColor[order.status] || 'bg-gray-400'} shadow-md backdrop-blur-sm`}>
            {order.status}
          </span>
        </div>
        
        {/* Total Amount with gradient background */}
        {order.total_amount && (
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 px-4 py-3 rounded-xl mb-4 border border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                <Tk_icon size={16} />
                <span>Total:</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-lg"><Tk_icon size={16} className="inline mr-1" />{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {/* Action buttons with improved design */}
        <div className="flex gap-3 mt-4">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-medium group flex-1 justify-center"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="relative">
              <Truck size={16} className="group-hover:animate-bounce" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-status-delivered)] rounded-full animate-pulse"></div>
            </div>
            <span>Track Order</span>
          </button>
          
          {order.tracking_number && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
              <div className="w-2 h-2 bg-[var(--color-status-delivered)] rounded-full animate-pulse"></div>
              <span className="font-mono text-slate-700 dark:text-slate-300">{order.tracking_number}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center shadow-lg">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Login Required</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">Please log in to view your orders</p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UI rendering
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          {/* Page Title Skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
            </div>
          </div>

          {/* Current Orders Section Skeleton */}
          <div>
            {/* Section Title */}
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
            </div>
            
            {/* Order Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((item) => (
                <div key={item} className="bg-[var(--color-second-bg)] rounded-lg p-4 border border-border shadow-sm">
                  {/* Order Number */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Track Button */}
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Orders Section Skeleton */}
          <div>
            {/* Section Title */}
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
              </div>
            </div>
            
            {/* Order Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-[var(--color-second-bg)] rounded-lg p-4 border border-border shadow-sm">
                  {/* Order Number */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                    </div>
                  </div>
                  
                  {/* Track Button */}
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] transform -skew-x-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Global shimmer animation styles */}
        <style jsx global>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-12deg);
            }
            100% {
              transform: translateX(200%) skewX(-12deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center shadow-lg">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[var(--color-status-cancelled)]/10 dark:bg-[var(--color-status-cancelled)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-800 dark:text-red-200">Error Loading Orders</h2>
              <p className="text-red-600 dark:text-red-300 text-lg mb-6">{error}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-[var(--color-status-cancelled)] hover:bg-[var(--color-status-cancelled)]/90 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                onClick={() => {
                  setError(null);
                  // Retry fetching orders
                  if (isAuthenticated && user?.id) {
                    setIsLoading(true);
                    getUserOrders(user.id).then(data => {
                      if (data && data.error) {
                        setError(data.error);
                      } else if (Array.isArray(data)) {
                        setOrders(data);
                      }
                      setIsLoading(false);
                    }).catch(err => {
                      setError(err.message || 'Failed to load orders');
                      setIsLoading(false);
                    });
                  }
                }}
              >
                Try Again
              </button>
              {error.includes('Authentication') && (
                <button
                  className="bg-[var(--color-button-primary)] hover:bg-[var(--color-button-primary)]/90 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                  onClick={() => openAuthModal('login')}
                >
                  Login Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show orders for the logged-in user (if backend returns all orders, filter by user id)
  // All orders fetched are already user-specific
  const currentOrders = Array.isArray(orders)
    ? orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING')
    : [];
  const previousOrders = Array.isArray(orders)
    ? orders.filter((o) =>
        o.status === 'SHIPPED' ||
        o.status === 'DELIVERED' ||
        o.status === 'CANCELLED')
    : [];

  return (
    <div className="bg-[var(--color-background)] text-text-primary py-6">
      <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-10">
        {/* Current Orders Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl">
              <Truck size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            Current Orders
            {currentOrders.length > 0 && (
              <span className="bg-[var(--color-status-processing)] text-white text-sm px-3 py-1 rounded-full shadow-lg">
                {currentOrders.length}
              </span>
            )}
          </h2>
          {currentOrders.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center shadow-lg">
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl inline-block mb-4">
                <Truck className="text-blue-600 dark:text-blue-400" size={48} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">No current orders</h3>
              <p className="text-slate-600 dark:text-slate-400">You don't have any orders being processed or pending at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentOrders.map((order) => (
                <OrderCard key={order.order_number} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Previous Orders Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-xl">
              <Package size={24} className="text-green-600 dark:text-green-400" />
            </div>
            Order History
            {previousOrders.length > 0 && (
              <span className="bg-[var(--color-status-delivered)] text-white text-sm px-3 py-1 rounded-full shadow-lg">
                {previousOrders.length}
              </span>
            )}
          </h2>
          {previousOrders.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center shadow-lg">
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl inline-block mb-4">
                <Package className="text-green-600 dark:text-green-400" size={48} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">No order history</h3>
              <p className="text-slate-600 dark:text-slate-400">Your previous orders will appear here once you complete some purchases.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {previousOrders.map((order) => (
                <OrderCard key={order.order_number} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
            />
            {/* Modal Content */}
            <motion.div
              className="relative z-10 bg-[var(--color-second-bg)] rounded-lg border border-border shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Modal Header - Fixed */}
              <div className="flex-shrink-0 p-4 sm:p-6 border-b border-border">
                <button
                  className="absolute top-3 right-3 text-text-secondary hover:text-text-primary z-20 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
                
                {/* Header with Order ID and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-2 rounded-lg flex-shrink-0">
                      <BadgeCheck className="text-blue-600" size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-blue-700 dark:text-blue-300 text-base sm:text-lg tracking-wider truncate">
                        {selectedOrder.order_number}
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary text-xs sm:text-sm">
                        <Calendar size={12} />
                        <span className="truncate">{format(new Date(selectedOrder.ordered_at), 'PPpp')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white ${statusColor[selectedOrder.status] || 'bg-gray-400'} shadow-lg flex-shrink-0 text-center`}>
                    {selectedOrder.status}
                  </div>
                </div>

                {/* Tracking Number */}
                {selectedOrder.tracking_number && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-3 rounded-lg mt-4 border border-green-200 dark:border-green-800">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <div className="flex items-center gap-2">
                        <Truck size={16} />
                        <span className="font-medium">Tracking Number:</span>
                      </div>
                      <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-green-800 dark:text-green-200 text-xs sm:text-sm break-all">
                        {selectedOrder.tracking_number}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Order Progress Tracker */}
                <OrderProgressTracker status={selectedOrder.status} />

                {/* Products in this Order */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-base sm:text-lg">
                    <Package size={18} className="text-accent flex-shrink-0" /> 
                    <span>Products</span>
                  </h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                          {item.product_image && (
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded border border-border bg-white flex-shrink-0 overflow-hidden">
                              <Image
                                src={item.product_image}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 48px, 64px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base text-text-primary truncate">{item.product_name}</div>
                            <div className="text-xs sm:text-sm text-text-secondary mt-1 space-y-1">
                              <div>Qty: {item.quantity}</div>
                              {item.color_name && <div>Color: {item.color_name}</div>}
                              {item.size_name && <div>Size: {item.size_name}</div>}
                            </div>
                          </div>
                          <div className="text-sm sm:text-base font-semibold text-text-primary flex-shrink-0">
                            <Tk_icon size={14} className="inline mr-1" />{parseFloat(item.unit_price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-text-secondary text-sm p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-center">
                      No products found for this order.
                    </div>
                  )}
                </div>

                {/* Total Amount Display */}
                {selectedOrder.total_amount && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Tk_icon size={16} className="flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">Order Total:</span>
                      </div>
                      <span className="font-bold text-text-primary text-lg sm:text-xl">
                        <Tk_icon size={16} className="inline mr-1" />{parseFloat(selectedOrder.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tracking History */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-base sm:text-lg">
                    <ListChecks size={18} className="text-accent flex-shrink-0" /> 
                    <span>Tracking History</span>
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <TrackingHistory updates={selectedOrder.updates || []} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
