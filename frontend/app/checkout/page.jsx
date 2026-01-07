// app/checkout/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutProvider, useCheckout } from "@/app/contexts/CheckoutContext";
import { useModal } from "@/app/contexts/ModalContext";
import { useAuth } from "@/app/contexts/AuthContext";
import ProtectedRoute from "@/app/Components/Auth/ProtectedRoute";
import CheckoutForm from "@/app/Components/Cart/CheckoutForm";
import OrderSummaryCard from "@/app/Components/Checkout/OrderSummaryCard";
import PaymentSection from "@/app/Components/Checkout/PaymentSection";
import ContextShippingMethodSelector from "@/app/Components/Checkout/ContextShippingMethodSelector";
import { createOrderWithPayment, clearCart, API_BASE_URL } from "@/app/lib/api";

// Wrapper component to use the context
const CheckoutContent = () => {
  const searchParams = useSearchParams();
  const isPreorderMode = searchParams.get('mode') === 'preorder';
  const preorderProductId = searchParams.get('product');
  const preorderVariantId = searchParams.get('variant');
  const preorderQuantity = parseInt(searchParams.get('quantity')) || 1;
  
  const { 
    userDetails, 
    updateUserDetails, 
    cartItems, 
    orderTotals, 
    selectedShippingMethod,
    setSelectedPaymentMethod,
    isBuyNowMode
  } = useCheckout();
  
  const { showModal } = useModal();
  const { user } = useAuth();
  const router = useRouter();
  const [paymentMethodView, setPaymentMethodView] = useState("cod"); // Default to Cash on Delivery
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [preorderProduct, setPreorderProduct] = useState(null);
  const [preorderVariant, setPreorderVariant] = useState(null);
  const [codDetails, setCodDetails] = useState({
    fullName: "",
    alternativePhone: "",
    notes: ""
  });
  const [mobileBankingDetails, setMobileBankingDetails] = useState({
    paymentMethod: "bkash",
    transactionId: "",
    senderNumber: "",
    adminAccountNumber: ""
  });

  // Auto-fill user details from auth context on mount
  useEffect(() => {
    if (user) {
      updateUserDetails({
        name: user.name || user.username || '',
        email: user.email || '',
        phone: user.phone || user.phone_number || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zip_code || user.zipCode || '',
        country: user.country || 'Bangladesh'
      });
    }
  }, [user]);

  // Fetch preorder product details if in preorder mode
  useEffect(() => {
    const fetchPreorderProduct = async () => {
      if (isPreorderMode && preorderProductId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/products/products/${preorderProductId}/`);
          if (response.ok) {
            const product = await response.json();
            setPreorderProduct(product);
            
            // Find variant if specified
            if (preorderVariantId && product.variants) {
              const variant = product.variants.find(v => v.id === preorderVariantId);
              if (variant) {
                setPreorderVariant(variant);
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch preorder product:', error);
        }
      }
    };
    
    fetchPreorderProduct();
  }, [isPreorderMode, preorderProductId, preorderVariantId]);

  // Update selected payment method when mobile banking method changes
  useEffect(() => {
    if (paymentMethodView === "mobile") {
      setSelectedPaymentMethod(mobileBankingDetails.paymentMethod);
    }
  }, [mobileBankingDetails.paymentMethod, paymentMethodView, setSelectedPaymentMethod]);

  // Sync visual selection with logic
  const handlePaymentMethodSelect = (method) => {
    setPaymentMethodView(method);
    // Map visual choice to backend values
    if (method === "mobile") {
      setSelectedPaymentMethod(mobileBankingDetails.paymentMethod);
    } else if (method === "cod") {
      setSelectedPaymentMethod("cod");
    } else {
      setSelectedPaymentMethod("card");
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate user details
    if (!userDetails.name?.trim()) errors.name = "Name is required";
    if (!userDetails.email?.trim()) errors.email = "Email is required";
    if (!userDetails.phone?.trim()) errors.phone = "Phone is required";
    if (!userDetails.address?.trim()) errors.address = "Address is required";
    if (!userDetails.city?.trim()) errors.city = "City is required";
    if (!userDetails.state?.trim()) errors.state = "State is required";
    if (!userDetails.zipCode?.trim()) errors.zipCode = "Zip code is required";
    
    // Validate shipping method
    if (!selectedShippingMethod) errors.shippingMethod = "Please select a shipping method";
    
    // Validate payment method
    if (!paymentMethodView) errors.paymentMethod = "Please select a payment method";
    
    // Validate payment method specific fields
    if (paymentMethodView === "cod") {
      if (!codDetails.fullName?.trim()) errors.codFullName = "Full name is required for COD";
      if (!codDetails.alternativePhone?.trim()) errors.codPhone = "Alternative phone is required for COD";
    } else if (paymentMethodView === "mobile") {
      if (!mobileBankingDetails.senderNumber?.trim()) errors.senderNumber = "Your mobile number is required";
      if (!mobileBankingDetails.transactionId?.trim()) errors.transactionId = "Transaction ID is required";
      if (mobileBankingDetails.senderNumber && !/^01[0-9]{9}$/.test(mobileBankingDetails.senderNumber.replace(/\s+/g, ''))) {
        errors.senderNumber = "Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrderClick = async () => {
    if (!validateForm()) {
      showModal({
        status: 'error',
        title: 'Form Validation Failed',
        message: 'Please fill in all required fields.',
        primaryActionText: 'OK'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle preorder submission
      if (isPreorderMode && preorderProduct) {
        // Safety check: ensure variant has stock === 0 if specified
        if (preorderVariantId && preorderVariant) {
          const variantStock = preorderVariant.stock || 0;
          if (variantStock > 0) {
            showModal({
              status: 'error',
              title: 'Invalid Preorder',
              message: 'This product is available for regular order. Please use the normal checkout process.',
              primaryActionText: 'OK'
            });
            setIsSubmitting(false);
            return;
          }
        }
        
        const effectiveProduct = preorderVariant || preorderProduct;
        const unitPrice = parseFloat(effectiveProduct.discount_price || effectiveProduct.price || 0);
        const shippingCost = selectedShippingMethod?.price ? parseFloat(selectedShippingMethod.price) : 0;
        const totalPrice = (unitPrice * preorderQuantity) + shippingCost;
        
        const preorderData = {
          product: preorderProductId,
          variant: preorderVariantId || null,
          quantity: preorderQuantity,
          shipping_method: selectedShippingMethod?.id || null,
          shipping_charge: shippingCost,
          unit_price: unitPrice,
          total_price: totalPrice,
          full_name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
          detailed_address: `${userDetails.address}, ${userDetails.city}, ${userDetails.state}, ${userDetails.zipCode}, ${userDetails.country || 'Bangladesh'}`,
          preorder_note: codDetails.notes || '',
          expected_delivery_days: '25–30 days'
        };
        
        const response = await fetch(`${API_BASE_URL}/api/orders/preorders/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preorderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Preorder submission failed');
        }
        
        const result = await response.json();
        
        // Store preorder confirmation data
        sessionStorage.setItem('preorderConfirmation', JSON.stringify({
          orderNumber: result.order_number,
          productName: preorderProduct.name,
          quantity: preorderQuantity,
          totalAmount: totalPrice,
          shippingCharge: shippingCost,
          expectedDelivery: '25–30 days',
          createdAt: new Date().toISOString()
        }));
        
        // Show success modal
        showModal({
          status: 'success',
          title: 'Preorder Confirmed!',
          message: `Your preorder has been successfully placed. Order number: ${result.order_number}. This item will be delivered within 25–30 days.`,
          primaryActionText: 'View Orders',
          onPrimaryAction: () => { router.push('/orders'); },
          secondaryActionText: 'Continue Shopping',
          onSecondaryAction: () => { router.push('/'); }
        });
        
        // Redirect to home or orders page
        setTimeout(() => router.push('/'), 2000);
        return;
      }
      
      // Regular order submission
      const cartSubtotal = orderTotals.subtotal;
      const shippingCost = selectedShippingMethod?.price ? parseFloat(selectedShippingMethod.price) : 0;
      const totalAmount = cartSubtotal + shippingCost;
      
      const orderData = {
        total_amount: totalAmount,
        cart_subtotal: cartSubtotal,
        shipping_address: {
          street_address: userDetails.address,
          city: userDetails.city,
          state: userDetails.state,
          zip_code: userDetails.zipCode,
          country: userDetails.country || 'Bangladesh'
        },
        delivery_address: {
          street_address: userDetails.address,
          city: userDetails.city,
          state: userDetails.state,
          zip_code: userDetails.zipCode,
          country: userDetails.country || 'Bangladesh'
        },
        shipping_method: selectedShippingMethod?.id ? (typeof selectedShippingMethod.id === 'string' && selectedShippingMethod.id !== 'free' ? parseInt(selectedShippingMethod.id) : selectedShippingMethod.id) : null,
        customer_name: userDetails.name,
        customer_email: userDetails.email,
        customer_phone: userDetails.phone,
        items: cartItems.map(item => {
          // Get the product ID - it could be stored in multiple fields
          const productId = item.product_id || item.productId || item.product?.id || item.id;
          const variantId = item.variant_id || null;
          
          return {
            product: productId,
            variant: variantId,
            color: item.color_id || item.selectedColor?.id || null,
            size: item.size_id || item.selectedSize?.id || null,
            quantity: parseInt(item.quantity) || 1,
            unit_price: parseFloat(item.price || item.unit_price || 0)
          };
        }),
        tracking_number: `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      // Handle payment method specific data
      if (paymentMethodView === "cod") {
        orderData.payment_method = "cod";
        orderData.cod_details = {
          customer_full_name: codDetails.fullName,
          alternative_phone: codDetails.alternativePhone,
          special_instructions: codDetails.notes
        };
      } else if (paymentMethodView === "mobile") {
        orderData.payment_method = mobileBankingDetails.paymentMethod;
        orderData.sender_number = mobileBankingDetails.senderNumber;
        orderData.transaction_id = mobileBankingDetails.transactionId;
        
        if (mobileBankingDetails.paymentMethod === "bkash") {
          orderData.admin_account_number = "01700000000";
        } else if (mobileBankingDetails.paymentMethod === "nagad") {
          orderData.admin_account_number = "01800000000";
        } else if (mobileBankingDetails.paymentMethod === "rocket") {
          orderData.admin_account_number = "01900000000";
        }
        
        orderData.payment = {
          sender_number: mobileBankingDetails.senderNumber,
          transaction_id: mobileBankingDetails.transactionId,
          payment_method: mobileBankingDetails.paymentMethod,
          admin_account_number: orderData.admin_account_number
        };
      }

      const response = await createOrderWithPayment(orderData);
      
      if (response.error) {
        showModal({
          status: 'error',
          title: 'Order Failed',
          message: response.error,
          primaryActionText: 'OK'
        });
        return;
      }
      
      // Clear cart
      await clearCart();
      
      // Clear Buy Now item if in Buy Now mode
      if (isBuyNowMode) {
        sessionStorage.removeItem('buyNowItem');
      }
      
      // Store order data in sessionStorage for confirmation page
      sessionStorage.setItem('orderConfirmation', JSON.stringify({
        orderId: response.order_id,
        orderNumber: response.order_number,
        totalAmount,
        cartSubtotal,
        shippingMethod: selectedShippingMethod,
        paymentMethod: paymentMethodView,
        codDetails: paymentMethodView === "cod" ? codDetails : null,
        mobileBankingDetails: paymentMethodView === "mobile" ? mobileBankingDetails : null,
        cartItems,
        userDetails,
        createdAt: new Date().toISOString()
      }));
      
      // Redirect to confirmation page
      router.push('/confirmation');
      
    } catch (error) {
      showModal({
        status: 'error',
        title: 'Order Failed',
        message: 'Order submission failed. Please try again.',
        primaryActionText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cart-bg)] py-12 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Preorder Hero Section */}
        {isPreorderMode && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-600 rounded-lg p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                  📦 Preorder Notice
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  This product will be delivered within <strong>25–30 days</strong> as it is imported from China. 
                  Your order will be confirmed once we receive your details, and we'll keep you updated throughout the shipping process.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                    ✅ Safe & Secure
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                    🚚 Direct Import
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                    📞 Customer Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            {isPreorderMode ? 'Preorder Checkout' : 'Checkout'}
          </h1>
          <p className="text-text-secondary">
            {isPreorderMode ? 'Complete your preorder details below' : 'Complete your order details below'}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (Step 1, 2, 3) - Spans 7/12 */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1 & 2: Forms */}
            <CheckoutForm 
              formData={userDetails} 
              onFormChange={updateUserDetails}
              validationErrors={validationErrors}
            />

            {/* Step 3: Shipping Method Selector (Compact) */}
            <ContextShippingMethodSelector 
              validationErrors={validationErrors}
              compact={true}
            />

            {/* Step 4: Payment Visuals */}
            <PaymentSection 
              selectedMethod={paymentMethodView}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              onPay={handlePlaceOrderClick}
              codDetails={codDetails}
              onCodDetailsChange={setCodDetails}
              mobileBankingDetails={mobileBankingDetails}
              onMobileBankingDetailsChange={setMobileBankingDetails}
              validationErrors={validationErrors}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* RIGHT COLUMN (Summary) - Spans 5/12 */}
          <div className="lg:col-span-5">
            <OrderSummaryCard />
          </div>

        </div>
      </div>


    </div>
  );
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute pageName="Checkout">
      <CheckoutProvider>
        <CheckoutContent />
      </CheckoutProvider>
    </ProtectedRoute>
  );
}