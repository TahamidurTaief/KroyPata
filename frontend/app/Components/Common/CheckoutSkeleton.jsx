"use client";
import React from 'react';
import { 
  SkeletonBox, 
  SkeletonText, 
  SkeletonButton, 
  SkeletonForm,
  SkeletonCard 
} from './SkeletonLoader';

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <SkeletonBox className="h-10 w-48 mx-auto rounded-lg mb-3" />
          <SkeletonBox className="h-6 w-64 mx-auto rounded-lg" />
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* LEFT COLUMN - Checkout Forms */}
          <div className="space-y-6">
            
            {/* Shipping Address Card */}
            <SkeletonCard className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <SkeletonBox className="w-8 h-8 rounded-lg mr-3" />
                <SkeletonBox className="h-6 w-40 rounded-lg" />
              </div>
              
              {/* Address Form Fields */}
              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SkeletonBox className="h-4 w-20 rounded mb-2" />
                    <SkeletonBox className="h-12 w-full rounded-lg" />
                  </div>
                  <div>
                    <SkeletonBox className="h-4 w-20 rounded mb-2" />
                    <SkeletonBox className="h-12 w-full rounded-lg" />
                  </div>
                </div>
                
                {/* Street Address */}
                <div>
                  <SkeletonBox className="h-4 w-28 rounded mb-2" />
                  <SkeletonBox className="h-12 w-full rounded-lg" />
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SkeletonBox className="h-4 w-24 rounded mb-2" />
                    <SkeletonBox className="h-12 w-full rounded-lg" />
                  </div>
                  <div>
                    <SkeletonBox className="h-4 w-28 rounded mb-2" />
                    <SkeletonBox className="h-12 w-full rounded-lg" />
                  </div>
                </div>
                
                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <SkeletonBox className="h-4 w-12 rounded mb-2" />
                    <SkeletonBox className="h-12 w-full rounded-lg" />
                  </div>
                  <div>
                    <SkeletonBox className="h-4 w-12 rounded mb-2" />
                    <SkeletonBox className="h-12 w-full rounded-lg" />
                  </div>
                  <div>
                    <SkeletonBox className="h-4 w-20 rounded mb-2" />
                    <SkeletonBox className="h-12 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </SkeletonCard>

            {/* Shipping Method Card */}
            <SkeletonCard className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <SkeletonBox className="w-8 h-8 rounded-lg mr-3" />
                <SkeletonBox className="h-6 w-36 rounded-lg" />
              </div>
              
              {/* Shipping Options */}
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item} 
                    className="border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:border-blue-300 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Radio Button */}
                        <SkeletonBox className="w-6 h-6 rounded-full mt-1 flex-shrink-0" />
                        
                        {/* Method Details */}
                        <div className="flex-1 min-w-0">
                          <SkeletonBox className="h-6 w-32 rounded-lg mb-2" />
                          <SkeletonBox className="h-4 w-48 rounded-lg mb-1" />
                          <SkeletonBox className="h-4 w-40 rounded-lg" />
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <SkeletonBox className="h-6 w-16 rounded-lg mb-1" />
                        <SkeletonBox className="h-4 w-20 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonCard>

            {/* Coupon Card */}
            <SkeletonCard className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <SkeletonBox className="w-8 h-8 rounded-lg mr-3" />
                <SkeletonBox className="h-6 w-32 rounded-lg" />
              </div>
              
              <div className="flex space-x-3">
                <SkeletonBox className="h-12 flex-1 rounded-lg" />
                <SkeletonButton size="md" className="px-6" />
              </div>
            </SkeletonCard>

          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SkeletonCard className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Summary Header */}
              <div className="flex items-center mb-6">
                <SkeletonBox className="w-8 h-8 rounded-lg mr-3" />
                <SkeletonBox className="h-7 w-36 rounded-lg" />
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item} 
                    className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  >
                    {/* Product Image */}
                    <SkeletonBox className="w-16 h-16 rounded-xl flex-shrink-0" />
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <SkeletonBox className="h-5 w-32 rounded mb-2" />
                      <SkeletonBox className="h-4 w-20 rounded mb-2" />
                      <div className="flex space-x-2">
                        <SkeletonBox className="h-5 w-12 rounded" />
                        <SkeletonBox className="h-5 w-16 rounded" />
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
                        <SkeletonBox className="w-8 h-8 rounded-md" />
                        <SkeletonBox className="w-8 h-6 rounded" />
                        <SkeletonBox className="w-8 h-8 rounded-md" />
                      </div>
                      <SkeletonBox className="w-8 h-8 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <SkeletonBox className="h-5 w-16 rounded" />
                  <SkeletonBox className="h-5 w-20 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <SkeletonBox className="h-5 w-20 rounded" />
                  <SkeletonBox className="h-5 w-16 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <SkeletonBox className="h-5 w-18 rounded" />
                  <SkeletonBox className="h-5 w-20 rounded" />
                </div>
                
                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center">
                    <SkeletonBox className="h-6 w-12 rounded" />
                    <SkeletonBox className="h-6 w-24 rounded" />
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6">
                <SkeletonButton size="xl" fullWidth className="rounded-xl" />
              </div>
            </SkeletonCard>
          </div>
        </div>
      </div>
    </div>
  );
}
