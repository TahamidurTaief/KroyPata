'use client';

import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function SplitShippingAlert({ 
  hasShippingConflict, 
  conflictDetails, 
  onDismiss 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasShippingConflict) {
      setIsVisible(true);
    }
  }, [hasShippingConflict]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !hasShippingConflict) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-800">
              Split Shipping Required
            </h3>
            <button
              onClick={handleDismiss}
              className="text-amber-500 hover:text-amber-600 transition-colors md:hidden"
              aria-label="Dismiss alert"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-2 text-sm text-amber-700">
            <p className="mb-2">
              Items in your cart require different shipping methods and cannot be shipped together.
            </p>
            
            {conflictDetails && (
              <div className="space-y-2">
                {conflictDetails.groups?.map((group, index) => (
                  <div key={index} className="bg-white bg-opacity-60 rounded px-3 py-2">
                    <div className="font-medium text-amber-800 mb-1">
                      Shipment {index + 1}:
                    </div>
                    <ul className="text-xs space-y-1">
                      {group.items?.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex justify-between">
                          <span>{item.name || `Product ${item.product_id}`}</span>
                          <span className="text-amber-600">
                            {group.shipping_methods?.join(', ') || 'Standard'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            
            <p className="mt-2 text-xs">
              Additional shipping charges may apply for multiple shipments.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="ml-4 text-amber-500 hover:text-amber-600 transition-colors hidden md:block"
          aria-label="Dismiss alert"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
