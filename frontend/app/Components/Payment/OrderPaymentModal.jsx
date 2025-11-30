"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCreditCard, FiSmartphone, FiLoader, FiCheckCircle } from "react-icons/fi";
import { FaTruck } from "react-icons/fa";
import Tk_icon from "../Common/Tk_icon";
import { createOrderWithPayment } from "@/app/lib/api";
import { handleCheckoutSuccess } from "@/app/lib/checkoutUtils";
import { useAuth } from "@/app/contexts/AuthContext";

const PaymentMethodOption = ({ value, label, icon: Icon, selected, onChange, description }) => {
  return (
    <motion.label
      className={`
        relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
        ${selected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input
        type="radio"
        name="payment_method"
        value={value}
        checked={selected}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      
      <div className="flex items-center space-x-3 w-full">
        <div className={`
          p-2 rounded-lg
          ${selected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}
        `}>
          <Icon 
            size={20} 
            className={selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} 
          />
        </div>
        
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {label}
          </div>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>
        
        <div className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center
          ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}
        `}>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </div>
      </div>
    </motion.label>
  );
};

const FormField = ({ label, children, error, required = false }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

const OrderPaymentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  cartItems = [],
  totalAmount = 0,
  cartSubtotal = 0,
  shippingMethod = null,
  shippingAddress = null,
  userDetails = null,
  adminAccountNumber = null,
  redirectToConfirmation = true,
  paymentMethod = "bkash",
  codDetails = null,
  mobileBankingDetails = null
}) => {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [formData, setFormData] = useState({
    sender_number: '',
    transaction_id: '',
    payment_method: 'bkash'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [fetchedAdminAccountNumber, setFetchedAdminAccountNumber] = useState('');

  const paymentMethods = [
    {
      value: 'bkash',
      label: 'bKash',
      icon: FiSmartphone,
      description: 'Mobile payment via bKash'
    },
    {
      value: 'nagad',
      label: 'Nagad',
      icon: FiSmartphone,
      description: 'Mobile payment via Nagad'
    },
    {
      value: 'card',
      label: 'Credit/Debit Card',
      icon: FiCreditCard,
      description: 'Pay with your credit or debit card'
    }
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: { opacity: 0, y: 30, scale: 0.95 },
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        sender_number: '',
        transaction_id: '',
        payment_method: 'bkash'
      });
      setErrors({});
      setIsSubmitting(false);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  // Fetch payment accounts when modal opens
  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      if (!isOpen) return;
      
      setLoadingAccounts(true);
      try {
        // Use the correct backend API URL
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const response = await fetch(`${API_BASE_URL}/api/payment/accounts/`);
        if (response.ok) {
          const data = await response.json();
          console.log('🏦 Payment accounts loaded:', data);
          
          // Extract accounts array from response
          const accounts = data.accounts || [];
          setPaymentAccounts(accounts);
          
          // Set the first admin account number as default
          if (accounts.length > 0 && accounts[0].number) {
            setFetchedAdminAccountNumber(accounts[0].number);
            console.log('✅ Admin account number set:', accounts[0].number);
          }
        } else {
          console.error('Failed to fetch payment accounts:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching payment accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchPaymentAccounts();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Skip form validation for COD and mobile banking as they're handled in checkout page
    if (paymentMethod === "cod") {
      // COD validation already handled in checkout page
      return true;
    } else if (paymentMethod === "mobile") {
      // Mobile banking validation already handled in checkout page
      return true;
    } else {
      // Validate payment fields for other methods (if any)
      if (!formData.sender_number.trim()) {
        newErrors.sender_number = 'Sender number is required';
      } else if (!/^[0-9+\-\s]+$/.test(formData.sender_number)) {
        newErrors.sender_number = 'Please enter a valid phone number';
      }
      
      if (!formData.transaction_id.trim()) {
        newErrors.transaction_id = 'Transaction ID is required';
      } else if (formData.transaction_id.length < 3) {
        newErrors.transaction_id = 'Transaction ID must be at least 3 characters';
      }
      
      if (!formData.payment_method) {
        newErrors.payment_method = 'Please select a payment method';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Payment submission started...');
    console.log('📝 Form data:', formData);
    console.log('🔐 Is authenticated:', isAuthenticated);
    console.log('🏦 Admin account number:', fetchedAdminAccountNumber);
    
    // Check authentication first
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, opening login modal');
      // Store context that user was trying to confirm payment
      localStorage.setItem('pendingPaymentAction', 'true');
      
      // Close payment modal and open login modal directly
      onClose();
      openAuthModal('login');
      return;
    }
    
    console.log('🔍 Starting form validation...');
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    console.log('✅ Form validation passed');

    setIsSubmitting(true);
    console.log('⏳ Setting isSubmitting to true');
    
    try {
      // Calculate cart subtotal if not provided
      const calculatedSubtotal = cartSubtotal || cartItems.reduce(
        (sum, item) => sum + ((item.price || item.unit_price) * item.quantity), 0
      );
      
      console.log('📦 Preparing order data...');
      console.log('🛒 Cart items:', cartItems);
      console.log('🏠 Shipping address:', shippingAddress);
      console.log('🚚 Shipping method:', shippingMethod);
      console.log('💰 Total amount:', totalAmount);
      console.log('💵 Calculated subtotal:', calculatedSubtotal);
      
      const orderData = {
        total_amount: totalAmount,
        cart_subtotal: calculatedSubtotal,
        shipping_address: shippingAddress?.id,
        shipping_method: shippingMethod?.id,
        items: cartItems.map(item => ({
          product: item.product_id || item.id,
          color: item.color_id,
          size: item.size_id,
          quantity: item.quantity,
          unit_price: item.price || item.unit_price
        }))
      };

      // Handle payment method specific fields
      if (paymentMethod === "cod") {
        // For Cash on Delivery
        orderData.payment_method = "cod";
        if (codDetails) {
          orderData.cod_details = {
            customer_full_name: codDetails.fullName,
            alternative_phone: codDetails.alternativePhone,
            special_instructions: codDetails.notes
          };
        }
      } else if (paymentMethod === "mobile" && mobileBankingDetails) {
        // For mobile banking payments
        orderData.sender_number = mobileBankingDetails.senderNumber;
        orderData.transaction_id = mobileBankingDetails.transactionId;
        orderData.payment_method = mobileBankingDetails.paymentMethod;
        
        // Set admin account number based on payment method
        if (mobileBankingDetails.paymentMethod === "bkash") {
          orderData.admin_account_number = "01700000000";
        } else if (mobileBankingDetails.paymentMethod === "nagad") {
          orderData.admin_account_number = "01800000000";
        } else if (mobileBankingDetails.paymentMethod === "rocket") {
          orderData.admin_account_number = "01900000000";
        }
        
        // Create payment data for the order
        orderData.payment = {
          sender_number: mobileBankingDetails.senderNumber,
          transaction_id: mobileBankingDetails.transactionId,
          payment_method: mobileBankingDetails.paymentMethod,
          admin_account_number: orderData.admin_account_number
        };
      } else {
        // For other payments (fallback)
        orderData.sender_number = formData.sender_number;
        orderData.transaction_id = formData.transaction_id;
        orderData.payment_method = formData.payment_method;
        orderData.admin_account_number = fetchedAdminAccountNumber || adminAccountNumber;
      }

      // Ensure required Order model fields are provided
      // Use userDetails if available, otherwise use reasonable defaults
      orderData.customer_name = userDetails?.name?.trim() || 'Valued Customer';
      orderData.customer_email = userDetails?.email?.trim() || 'customer@temp.com';
      orderData.customer_phone = userDetails?.phone?.trim() || '+1234567890';
      
      // Generate a tracking number (required field)
      // In a real system, this would come from the shipping provider
      orderData.tracking_number = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log('🚀 Creating order with payload:', {
        ...orderData,
        shipping_method_details: shippingMethod,
        calculated_subtotal: calculatedSubtotal,
        expected_total: calculatedSubtotal + (shippingMethod?.price ? parseFloat(shippingMethod.price) : 0)
      });

      const response = await createOrderWithPayment(orderData);
      
      if (response.error) {
        // Check if it's an authentication error
        if (response.error.includes('Authentication required') || response.error.includes('login')) {
          // Store context that user was trying to confirm payment
          localStorage.setItem('pendingPaymentAction', 'true');
          
          // Close payment modal and open login modal directly
          onClose();
          openAuthModal('login');
          return;
        } else {
          throw new Error(response.error);
        }
      }
      
      // Handle validation errors specifically
      if (response.success === false && response.errors) {
        console.error('❌ Order validation failed:', response.errors);
        
        // Convert API validation errors to user-friendly messages
        let errorMessage = 'Order validation failed:\n';
        
        if (response.errors.shipping_address) {
          errorMessage += '• Please select a valid shipping address\n';
        }
        if (response.errors.shipping_method) {
          errorMessage += '• Please select a valid shipping method\n';
        }
        if (response.errors.items) {
          errorMessage += '• There was an issue with your cart items\n';
        }
        if (response.errors.customer_name) {
          errorMessage += '• Customer name is required\n';
        }
        if (response.errors.customer_email) {
          errorMessage += '• Customer email is required\n';
        }
        if (response.errors.customer_phone) {
          errorMessage += '• Customer phone is required\n';
        }
        
        setErrors({
          submit: errorMessage.trim()
        });
        return;
      }

      setSubmitSuccess(true);
      
      // Handle checkout success - this will clear the cart and perform cleanup
      await handleCheckoutSuccess(response, {
        clearCart: true,
        showNotification: false // Modal already shows success state
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Show success animation briefly, then redirect
      setTimeout(() => {
        if (redirectToConfirmation) {
          // Store complete order data in sessionStorage for the confirmation page
          sessionStorage.setItem('orderConfirmation', JSON.stringify({
            orderId: response.order_id,
            orderNumber: response.order_number,
            totalAmount,
            cartSubtotal: calculatedSubtotal,
            shippingMethod,
            paymentMethod: formData.payment_method,
            transactionId: formData.transaction_id,
            senderNumber: formData.sender_number,
            cartItems: cartItems || [],
            userDetails: userDetails || {},
            createdAt: new Date().toISOString()
          }));
          
          // Navigate to confirmation page
          router.push('/confirmation');
        } else {
          // Just close the modal if redirection is disabled
          onClose();
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('Authentication required')) {
          errorMessage = 'Session expired. Please login again.';
          // Trigger login modal
          localStorage.setItem('pendingPaymentAction', 'true');
          onClose();
          openAuthModal('login');
          return;
        } else if (error.message.includes('Server returned HTML')) {
          errorMessage = 'Server configuration error. The payment service is temporarily unavailable. Please contact support.';
        } else if (error.message.includes('Resource not found')) {
          errorMessage = 'Payment service not found. Please contact support or try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('🚨 Setting error message:', errorMessage);
      setErrors({
        submit: errorMessage
      });
    } finally {
      console.log('🏁 Payment submission completed, setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-[var(--color-surface)] rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col z-50"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {paymentMethod === "cod" ? "Order Confirmation" : 
                 paymentMethod === "mobile" ? "Payment Confirmation" : 
                 "Payment Information"}
              </h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Success State */}
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Order Created Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your order has been submitted and is being processed.
                  </p>
                </motion.div>
              )}

              {/* Form Content - No longer a form tag here */}
              {!submitSuccess && (
                <div className="p-6 space-y-6">
                  {/* COD Confirmation */}
                  {paymentMethod === "cod" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-300 mb-2">
                          <FaTruck className="w-4 h-4" />
                          <span className="font-medium">Cash on Delivery Selected</span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          You will pay ৳{totalAmount} in cash when your order is delivered to your doorstep.
                        </p>
                      </div>
                      
                      {codDetails && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Delivery Contact Details:</h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Full Name: </span>
                              <span className="text-gray-900 dark:text-white">{codDetails.fullName}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Alternative Phone: </span>
                              <span className="text-gray-900 dark:text-white">{codDetails.alternativePhone}</span>
                            </div>
                            {codDetails.notes && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Special Instructions: </span>
                                <span className="text-gray-900 dark:text-white">{codDetails.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Banking Confirmation */}
                  {paymentMethod === "mobile" && mobileBankingDetails && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                          <FiSmartphone className="w-4 h-4" />
                          <span className="font-medium">
                            {mobileBankingDetails.paymentMethod.charAt(0).toUpperCase() + mobileBankingDetails.paymentMethod.slice(1)} Payment Confirmed
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Your payment of ৳{totalAmount} via {mobileBankingDetails.paymentMethod.toUpperCase()} is being processed.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Details:</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Payment Method: </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {mobileBankingDetails.paymentMethod.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Your Number: </span>
                            <span className="text-gray-900 dark:text-white">{mobileBankingDetails.senderNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Transaction ID: </span>
                            <span className="text-gray-900 dark:text-white font-mono">{mobileBankingDetails.transactionId}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Sent To: </span>
                            <span className="text-gray-900 dark:text-white">
                              {mobileBankingDetails.paymentMethod === "bkash" ? "01700000000" : 
                               mobileBankingDetails.paymentMethod === "nagad" ? "01800000000" : 
                               "01900000000"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Form for non-COD methods */}
                  {paymentMethod !== "cod" && (
                    <>
                      {/* Admin Account Number (Read-only) */}
                      {(fetchedAdminAccountNumber || adminAccountNumber) && (
                    <FormField label="Send Payment To">
                      <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Tk_icon className="text-blue-600 dark:text-blue-400 mr-2" size={16} />
                        <div className="flex-1">
                          <span className="text-gray-900 dark:text-white font-medium text-lg">
                            {fetchedAdminAccountNumber || adminAccountNumber}
                          </span>
                          {loadingAccounts && (
                            <div className="flex items-center mt-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-xs text-gray-500">Loading account...</span>
                            </div>
                          )}
                          {!loadingAccounts && fetchedAdminAccountNumber && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Official payment account
                            </div>
                          )}
                        </div>
                      </div>
                    </FormField>
                  )}

                  {/* Sender Number */}
                  <FormField 
                    label="Your Payment Number" 
                    error={errors.sender_number}
                    required
                  >
                    <input
                      type="tel"
                      value={formData.sender_number}
                      onChange={(e) => handleInputChange('sender_number', e.target.value)}
                      placeholder="e.g., 01712345678"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  {/* Transaction ID */}
                  <FormField 
                    label="Transaction ID" 
                    error={errors.transaction_id}
                    required
                  >
                    <input
                      type="text"
                      value={formData.transaction_id}
                      onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                      placeholder="e.g., TXN123456789"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={isSubmitting}
                    />
                  </FormField>

                  {/* Payment Method */}
                  <FormField 
                    label="Payment Method" 
                    error={errors.payment_method}
                    required
                  >
                    <div className="space-y-3">
                      {paymentMethods.map(method => (
                        <PaymentMethodOption
                          key={method.value}
                          value={method.value}
                          label={method.label}
                          icon={method.icon}
                          description={method.description}
                          selected={formData.payment_method === method.value}
                          onChange={(value) => handleInputChange('payment_method', value)}
                        />
                      ))}
                    </div>
                  </FormField>

                    </>
                  )}

                  {/* Order Summary */}
                  {(totalAmount > 0 || shippingMethod) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                        Order Summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        {totalAmount > 0 && (
                          <div className="flex justify-between items-center mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total to pay:</span>
                            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                              ৳ {(() => {
                                const total = parseFloat(totalAmount) || 0;
                                return total.toFixed(2);
                              })()}
                            </span>
                          </div>
                        )}
                        {shippingMethod && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                            <span className="font-medium text-gray-900 dark:text-white flex items-center">
                              {shippingMethod.name} - <Tk_icon size={14} className="mx-1" />{shippingMethod.price}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Error */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.submit}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Footer with Actions */}
            {!submitSuccess && (
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit}>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <FiLoader className="animate-spin" size={16} />
                          <span>
                            {paymentMethod === "cod" ? "Placing Order..." : 
                             paymentMethod === "mobile" ? "Confirming Payment..." : 
                             "Processing..."}
                          </span>
                        </>
                      ) : (
                        <span>
                          {paymentMethod === "cod" ? "Place Order" : 
                           paymentMethod === "mobile" ? "Confirm Order" : 
                           "Submit Payment"}
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderPaymentModal;
