// app/Components/Checkout/PaymentSection.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaTruck, FaMobileAlt } from "react-icons/fa";

const PaymentSection = ({ onPaymentMethodSelect, selectedMethod = "cod", onPay, codDetails, onCodDetailsChange, mobileBankingDetails, onMobileBankingDetailsChange, validationErrors = {}, isSubmitting = false }) => {
  // Use external COD details state or fallback to local state
  const localCodDetails = codDetails || {
    fullName: "",
    alternativePhone: "",
    notes: ""
  };
  
  // Use external mobile banking details or fallback to local state
  const localMobileBankingDetails = mobileBankingDetails || {
    paymentMethod: "bkash",
    transactionId: "",
    senderNumber: "",
    adminAccountNumber: ""
  };
  
  const handleCodDetailsChange = (newDetails) => {
    if (onCodDetailsChange) {
      onCodDetailsChange(newDetails);
    }
  };

  const handleMobileBankingDetailsChange = (newDetails) => {
    // Auto-set admin account number based on payment method
    if (newDetails.paymentMethod) {
      if (newDetails.paymentMethod === "bkash") {
        newDetails.adminAccountNumber = "01700000000";
      } else if (newDetails.paymentMethod === "nagad") {
        newDetails.adminAccountNumber = "01800000000";
      } else if (newDetails.paymentMethod === "rocket") {
        newDetails.adminAccountNumber = "01900000000";
      }
    }
    
    if (onMobileBankingDetailsChange) {
      onMobileBankingDetailsChange(newDetails);
    }
  };

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-sm font-bold mb-3" 
        style={{ color: 'var(--foreground)' }}
      >
        4. Payment Details
      </motion.h3>

      {/* Payment Method Toggle */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => onPaymentMethodSelect("cod")}
          className={`flex items-center px-3 py-1.5 rounded text-xs font-medium transition-all ${
            selectedMethod === "cod"
              ? "bg-[#f0fdf4] text-[#16a34a] ring-1 ring-[#bbf7d0]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
             selectedMethod === "cod" ? "border-[#16a34a]" : "border-[var(--muted-foreground)]"
          }`}>
            {selectedMethod === "cod" && <div className="w-2 h-2 bg-[#16a34a] rounded-full" />}
          </div>
          <FaTruck className="w-4 h-4 mr-1" />
          Cash on Delivery
        </button>

        <button
          onClick={() => onPaymentMethodSelect("mobile")}
          className={`flex items-center px-3 py-1.5 rounded text-xs font-medium transition-all ${
            selectedMethod === "mobile"
              ? "bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/20"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
             selectedMethod === "mobile" ? "border-[var(--primary)]" : "border-[var(--muted-foreground)]"
          }`}>
            {selectedMethod === "mobile" && <div className="w-2 h-2 bg-[var(--primary)] rounded-full" />}
          </div>
          <FaMobileAlt className="w-4 h-4 mr-1" />
          Mobile Banking
        </button>
      </div>

      {/* Cash on Delivery Form */}
      {selectedMethod === "cod" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3 rounded" style={{ backgroundColor: 'var(--primary-10)', border: '1px solid var(--primary)' }}>
            <p className="text-xs" style={{ color: 'var(--primary)' }}>
              Pay with cash when your order is delivered. No advance payment required.
            </p>
          </div>

          <div>
            <input
              type="text"
              placeholder="Full Name *"
              value={localCodDetails.fullName}
              className={`px-3 py-2 text-sm rounded outline-none transition-colors w-full ${
                validationErrors.codFullName ? 'border-red-500' : ''
              }`}
              style={{ 
                backgroundColor: 'var(--background)', 
                color: 'var(--foreground)',
                border: validationErrors.codFullName ? '1px solid #ef4444' : '1px solid var(--border)'
              }}
              onChange={(e) => handleCodDetailsChange({...localCodDetails, fullName: e.target.value})}
              required
            />
            {validationErrors.codFullName && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.codFullName}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Alternative Phone Number *"
              value={localCodDetails.alternativePhone}
              className={`px-3 py-2 text-sm rounded outline-none transition-colors w-full ${
                validationErrors.codPhone ? 'border-red-500' : ''
              }`}
              style={{ 
                backgroundColor: 'var(--background)', 
                color: 'var(--foreground)',
                border: validationErrors.codPhone ? '1px solid #ef4444' : '1px solid var(--border)'
              }}
              onChange={(e) => handleCodDetailsChange({...localCodDetails, alternativePhone: e.target.value})}
              required
            />
            {validationErrors.codPhone && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.codPhone}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Special Instructions (Optional)"
              value={localCodDetails.notes}
              rows={2}
              className="px-3 py-2 text-sm rounded outline-none transition-colors w-full resize-none"
              style={{ 
                backgroundColor: 'var(--background)', 
                color: 'var(--foreground)',
                border: '1px solid var(--border)'
              }}
              onChange={(e) => handleCodDetailsChange({...localCodDetails, notes: e.target.value})}
            />
          </div>
        </div>
      )}

      {/* Mobile Banking Form */}
      {selectedMethod === "mobile" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Banking Method Selection */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Banking Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "bkash", label: "bKash", color: "bg-pink-100 border-pink-300 text-pink-800" },
                { value: "nagad", label: "Nagad", color: "bg-orange-100 border-orange-300 text-orange-800" },
                { value: "rocket", label: "Rocket", color: "bg-purple-100 border-purple-300 text-purple-800" }
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => handleMobileBankingDetailsChange({...localMobileBankingDetails, paymentMethod: method.value})}
                  className={`p-2 border rounded text-xs font-medium transition-all ${
                    localMobileBankingDetails.paymentMethod === method.value
                      ? method.color
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="p-3 rounded" style={{ backgroundColor: 'var(--primary-10)', border: '1px solid var(--primary)' }}>
            <div className="text-xs" style={{ color: 'var(--primary)' }}>
              <p>1. Send money to our {localMobileBankingDetails.paymentMethod.toUpperCase()} number</p>
              <p>2. Copy transaction ID and enter below</p>
            </div>
          </div>

          {/* Admin Account Number Display */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-2">
              Send Money To
            </label>
            <div className="flex items-center p-2 rounded" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <div className="flex-1">
                <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                  {localMobileBankingDetails.paymentMethod === "bkash" ? "01700000000" : 
                   localMobileBankingDetails.paymentMethod === "nagad" ? "01800000000" : 
                   "01900000000"}
                </span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {localMobileBankingDetails.paymentMethod.charAt(0).toUpperCase() + localMobileBankingDetails.paymentMethod.slice(1)} Account
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const number = localMobileBankingDetails.paymentMethod === "bkash" ? "01700000000" : 
                                localMobileBankingDetails.paymentMethod === "nagad" ? "01800000000" : 
                                "01900000000";
                  navigator.clipboard.writeText(number);
                }}
                className="px-3 py-1 text-xs bg-[var(--muted)] text-[var(--foreground)] rounded hover:bg-[var(--muted)]/80 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <input
                type="tel"
                placeholder="Your Mobile Number *"
                value={localMobileBankingDetails.senderNumber}
                className={`px-3 py-2 text-sm rounded outline-none transition-colors w-full ${
                  validationErrors.senderNumber ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: 'var(--background)', 
                  color: 'var(--foreground)',
                  border: validationErrors.senderNumber ? '1px solid #ef4444' : '1px solid var(--border)'
                }}
                onChange={(e) => handleMobileBankingDetailsChange({...localMobileBankingDetails, senderNumber: e.target.value})}
                required
              />
              {validationErrors.senderNumber && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.senderNumber}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Transaction ID *"
                value={localMobileBankingDetails.transactionId}
                className={`px-3 py-2 text-sm rounded outline-none transition-colors w-full ${
                  validationErrors.transactionId ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: 'var(--background)', 
                  color: 'var(--foreground)',
                  border: validationErrors.transactionId ? '1px solid #ef4444' : '1px solid var(--border)'
                }}
                onChange={(e) => handleMobileBankingDetailsChange({...localMobileBankingDetails, transactionId: e.target.value})}
                required
              />
              {validationErrors.transactionId && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.transactionId}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Place Order Button - Aligned with the flow */}
      <div className="mt-6">
        <motion.button
          className={`w-full py-3 font-medium rounded-lg transition-all ${
            isSubmitting 
              ? 'bg-[var(--muted)] cursor-not-allowed text-[var(--muted-foreground)]' 
              : 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white'
          }`}
          whileTap={isSubmitting ? {} : { scale: 0.98 }}
          onClick={onPay}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </motion.button>
        {validationErrors.submit && (
          <p className="text-sm text-red-500 mt-2">{validationErrors.submit}</p>
        )}
      </div>
    </div>
  );
};

export default PaymentSection;