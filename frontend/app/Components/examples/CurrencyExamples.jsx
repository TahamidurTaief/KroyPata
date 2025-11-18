// Example component showing how to use the new currency system with SVG icons
// This replaces text-based currency symbols with professional SVG Taka icons

import React from 'react';
import { 
  formatBDTWithIcon, 
  ProductPrice, 
  CartTotal, 
  CompactPrice,
  formatDiscountWithIcon,
  formatShippingWithIcon,
  checkFreeShippingEligibility
} from '../utils/currencyWithIcon';

const CurrencyExamples = () => {
  // Sample data - all amounts are already in BDT (no conversion needed)
  const sampleProduct = {
    price: 2500,        // ৳2,500.00
    originalPrice: 3000, // ৳3,000.00
    discount: 500       // ৳500.00 discount
  };

  const cartData = {
    subtotal: 15000,    // ৳15,000.00
    shipping: 150,      // ৳150.00
    total: 15150       // ৳15,150.00
  };

  const freeShippingThreshold = 20000; // ৳20,000.00

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Currency Display Examples</h2>
      
      {/* Basic price display with SVG icon */}
      <div className="space-y-2">
        <h3 className="font-semibold">Basic Price Display</h3>
        <div className="flex gap-4 items-center">
          <span>Regular price: </span>
          {formatBDTWithIcon(sampleProduct.price)}
        </div>
        <div className="flex gap-4 items-center">
          <span>Large price: </span>
          {formatBDTWithIcon(sampleProduct.price, true, { iconSize: 24, className: 'text-lg font-bold' })}
        </div>
      </div>

      {/* Product pricing component */}
      <div className="space-y-2">
        <h3 className="font-semibold">Product Price Component</h3>
        <ProductPrice 
          price={sampleProduct.price}
          originalPrice={sampleProduct.originalPrice}
          options={{ iconSize: 18, className: 'text-green-600' }}
        />
      </div>

      {/* Discount display */}
      <div className="space-y-2">
        <h3 className="font-semibold">Discount Display</h3>
        <div className="flex gap-4 items-center">
          <span>You save: </span>
          {formatDiscountWithIcon(sampleProduct.discount)}
        </div>
      </div>

      {/* Shipping cost display */}
      <div className="space-y-2">
        <h3 className="font-semibold">Shipping Cost</h3>
        <div className="flex gap-4 items-center">
          <span>Shipping: </span>
          {formatShippingWithIcon(cartData.shipping)}
        </div>
        <div className="flex gap-4 items-center">
          <span>Free shipping: </span>
          {formatShippingWithIcon(0, true)}
        </div>
      </div>

      {/* Cart totals */}
      <div className="space-y-2">
        <h3 className="font-semibold">Cart Totals</h3>
        <div className="border rounded p-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            {formatBDTWithIcon(cartData.subtotal, true, { iconSize: 16 })}
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            {formatShippingWithIcon(cartData.shipping)}
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Total:</span>
            <CartTotal amount={cartData.total} className="text-green-600" />
          </div>
        </div>
      </div>

      {/* Free shipping eligibility */}
      <div className="space-y-2">
        <h3 className="font-semibold">Free Shipping Status</h3>
        {(() => {
          const eligibility = checkFreeShippingEligibility(cartData.subtotal, freeShippingThreshold);
          
          return (
            <div className="border rounded p-4">
              {eligibility.isEligible ? (
                <p className="text-green-600 font-medium">
                  🎉 You qualify for free shipping!
                </p>
              ) : (
                <p className="text-blue-600">
                  Add {eligibility.formattedAmountNeeded} more to qualify for free shipping
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Free shipping threshold: {eligibility.formattedThreshold}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Compact displays for mobile */}
      <div className="space-y-2">
        <h3 className="font-semibold">Compact Display (Mobile)</h3>
        <div className="flex gap-4 items-center text-sm">
          <CompactPrice amount={sampleProduct.price} className="text-blue-600" />
          <CompactPrice amount={sampleProduct.originalPrice} className="text-gray-500 line-through" />
        </div>
      </div>

      {/* Color customization examples */}
      <div className="space-y-2">
        <h3 className="font-semibold">Color Customization</h3>
        <div className="space-y-2">
          <div className="flex gap-4 items-center">
            <span>Success color: </span>
            {formatBDTWithIcon(sampleProduct.price, true, { 
              iconSize: 16, 
              iconColor: '#10b981', 
              className: 'text-green-500' 
            })}
          </div>
          <div className="flex gap-4 items-center">
            <span>Warning color: </span>
            {formatBDTWithIcon(sampleProduct.price, true, { 
              iconSize: 16, 
              iconColor: '#f59e0b', 
              className: 'text-yellow-500' 
            })}
          </div>
          <div className="flex gap-4 items-center">
            <span>Error color: </span>
            {formatBDTWithIcon(sampleProduct.price, true, { 
              iconSize: 16, 
              iconColor: '#ef4444', 
              className: 'text-red-500' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExamples;
