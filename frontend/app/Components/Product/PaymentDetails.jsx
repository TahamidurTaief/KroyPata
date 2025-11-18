"use client";
import { Plus, Minus } from "lucide-react";
import Tk_icon from "../Common/Tk_icon";
import { useWholesalePricingLogic, validateMinimumPurchase } from "../Common/WholesalePricingNew";
import { useAuth } from "@/app/contexts/AuthContext";
import { FaStore } from 'react-icons/fa';

// This component provides the order action panel. It now focuses on quantity
// and the primary add-to-cart action, with shipping removed for a cleaner flow.
export default function PaymentDetails({ 
  product, 
  quantity, 
  setQuantity, 
  isInCart, 
  handleAddToCart, 
  handleRemoveFromCart 
}) {
  const { user } = useAuth();
  const { isUsingWholesalePrice, minimumPurchase } = useWholesalePricingLogic(product);
  const inStock = product.stock > 0 && product.is_active;
  
  // Use wholesale price if available and user is wholesaler
  const price = isUsingWholesalePrice 
    ? parseFloat(product.wholesale_price) 
    : parseFloat(product.discount_price) || parseFloat(product.price) || 0;
  const subtotal = price * quantity;
  
  // Validate minimum purchase requirements
  const minimumPurchaseValidation = validateMinimumPurchase(product, quantity, user);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const minQuantity = isUsingWholesalePrice ? minimumPurchase : 1;
    if (newQuantity >= minQuantity && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-[var(--color-second-bg)] p-6 rounded-xl shadow-lg sticky top-24">
      <div className="space-y-4">
        {/* Availability Status */}
        <div className={`text-sm font-bold py-2 px-3 rounded-md text-center ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
        </div>

        {/* Quantity Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-md">Quantity:</h3>
            {isUsingWholesalePrice && minimumPurchase > 1 && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Min: {minimumPurchase}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg p-2">
            <button 
              onClick={() => handleQuantityChange(-1)} 
              className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={quantity <= (isUsingWholesalePrice ? minimumPurchase : 1)}
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-lg w-12 text-center">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(1)} 
              className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={quantity >= (product.stock || 99)}
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Show minimum purchase validation */}
          {isUsingWholesalePrice && !minimumPurchaseValidation.isValid && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {minimumPurchaseValidation.message}
            </div>
          )}
        </div>
      </div>

      <div className="my-5"></div>

      {/* Simplified Order Summary */}
      <div className="space-y-2 text-md">
        <div className="flex justify-between font-bold text-xl text-foreground">
          <span>Subtotal</span>
          <span className={`flex items-baseline gap-1 ${isUsingWholesalePrice ? 'text-blue-600 dark:text-blue-400' : 'text-primary'}`}>
            <Tk_icon size={20} className={isUsingWholesalePrice ? 'text-blue-600 dark:text-blue-400' : 'text-primary'} />
            {subtotal.toFixed(2)}
          </span>
        </div>
        
        {/* Show pricing type badge */}
        {isUsingWholesalePrice && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Price Type:</span>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <FaStore size={10} />
              Wholesale
            </span>
          </div>
        )}
      </div>
      
      {/* Action Button */}
      <button 
        onClick={isInCart ? handleRemoveFromCart : handleAddToCart} 
        disabled={!inStock || (isUsingWholesalePrice && !minimumPurchaseValidation.isValid)} 
        className={`mt-6 w-full font-semibold py-2 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          ${isInCart 
            ? 'bg-red-500 text-white hover:bg-red-500' 
            : 'bg-[var(--color-button-primary)] text-white hover:bg-[var(--color-button-primary)]/90'
          }`}
      >
        {!inStock 
          ? 'Out of Stock'
          : (isUsingWholesalePrice && !minimumPurchaseValidation.isValid)
            ? `Need ${minimumPurchaseValidation.shortage} More Units`
            : (isInCart ? 'Remove from Cart' : 'Add to Cart')
        }
      </button>
    </div>
  );
}
