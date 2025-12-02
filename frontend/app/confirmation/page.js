"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiCheckCircle, FiTruck, FiCreditCard, FiHome, FiPackage } from "react-icons/fi";
import ConfirmationSkeleton from "../Components/Skeletons/ConfirmationSkeleton";

export default function ConfirmationPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from sessionStorage
    const storedOrderData = sessionStorage.getItem('orderConfirmation');
    
    if (storedOrderData) {
      try {
        const parsedData = JSON.parse(storedOrderData);
        console.log('Confirmation page - Order data:', parsedData);
        setOrderData(parsedData);
        // Don't clear immediately - keep it for page refreshes
        // sessionStorage.removeItem('orderConfirmation');
      } catch (error) {
        console.error('Error parsing order data:', error);
        // Redirect to orders page instead of home if data is corrupted
        setTimeout(() => router.push('/orders'), 2000);
      }
    } else {
      console.log('No order confirmation data found');
      // Redirect to orders page instead of home
      setTimeout(() => router.push('/orders'), 2000);
    }
    
    setLoading(false);
  }, [router]);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'bkash':
      case 'nagad':
        return FiCreditCard;
      case 'card':
        return FiCreditCard;
      default:
        return FiCreditCard;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'bkash':
        return 'bKash';
      case 'nagad':
        return 'Nagad';
      case 'card':
        return 'Credit/Debit Card';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <ConfirmationSkeleton />
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <FiPackage className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Order Data Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The order confirmation data is not available. You'll be redirected to your orders page.
          </p>
          <button
            onClick={() => router.push('/orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const PaymentIcon = getPaymentMethodIcon(orderData.paymentMethod);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Success Header */}
            <motion.div variants={itemVariants} className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Order Confirmed! 🎉
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Thank you for your order! We've received your payment information and 
                your order is now being processed.
              </p>
            </motion.div>

          {/* Order Details Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Order Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Order Number:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {orderData.orderNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {orderData.paymentStatus || 'Confirmed'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <PaymentIcon className="mr-2" size={20} />
                  Payment Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {getPaymentMethodLabel(orderData.paymentMethod)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</span>
                    <p className="font-semibold text-gray-900 dark:text-white font-mono text-sm">
                      {orderData.transactionId || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Number</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {orderData.transactionNumber || 'N/A'}
                    </p>
                  </div>
                  {orderData.senderNumber && orderData.senderNumber !== orderData.transactionNumber && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Payment Number Used</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {orderData.senderNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Information */}
              {orderData.shippingMethod && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FiTruck className="mr-2" size={20} />
                    Shipping Information
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {orderData.shippingMethod.title || orderData.shippingMethod.name}
                        </p>
                        {orderData.shippingMethod.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {orderData.shippingMethod.description}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ৳ {parseFloat(orderData.shippingMethod.price || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Delivery Address */}
                    {orderData.userDetails && (
                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Delivery Address:
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {orderData.userDetails.name && <div>{orderData.userDetails.name}</div>}
                          {orderData.userDetails.address && <div>{orderData.userDetails.address}</div>}
                          {orderData.userDetails.city && orderData.userDetails.zip && (
                            <div>{orderData.userDetails.city}, {orderData.userDetails.zip}</div>
                          )}
                          {orderData.userDetails.phone && <div>Phone: {orderData.userDetails.phone}</div>}
                          {orderData.userDetails.email && <div>Email: {orderData.userDetails.email}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              {orderData.cartItems && orderData.cartItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FiPackage className="mr-2" size={20} />
                    Order Items ({orderData.cartItems.length})
                  </h3>
                  <div className="space-y-3">
                    {orderData.cartItems.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.name || `Product ${item.product_id || item.id}`}
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>Quantity: {item.quantity}</span>
                              <span className="mx-2">•</span>
                              <span>Unit Price: ৳ {parseFloat(item.price || item.unit_price || 0).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ৳ {(parseFloat(item.price || item.unit_price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Total Breakdown */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="space-y-3">
                  {orderData.cartSubtotal && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ৳ {parseFloat(orderData.cartSubtotal).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {orderData.shippingMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ৳ {parseFloat(orderData.shippingMethod.price || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ৳ {parseFloat(orderData.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiPackage className="mr-2" size={20} />
              What's Next?
            </h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Order Processing</p>
                  <p className="text-sm">We'll verify your payment and prepare your order for shipping.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Shipping Notification</p>
                  <p className="text-sm">You'll receive a tracking number once your order ships.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Delivery</p>
                  <p className="text-sm">Your order will be delivered according to your selected shipping method.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/orders')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <FiPackage className="mr-2" size={18} />
              View My Orders
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <FiHome className="mr-2" size={18} />
              Continue Shopping
            </button>
          </motion.div>

          {/* Support Information */}
          <motion.div 
            variants={itemVariants}
            className="text-center text-sm text-gray-600 dark:text-gray-400"
          >
            <p>
              Need help with your order? {" "}
              <a href="mailto:support@example.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                Contact our support team
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
