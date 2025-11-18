"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { useModal } from "@/app/contexts/ModalContext";
import bkashLogo from "@/public/img/payment/bkash.png";
import nagadLogo from "@/public/img/payment/nagad.png";
import cardLogo from "@/public/img/payment/card.png";
import FormField from "../Common/FormField";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
  exit: { opacity: 0, y: 50, scale: 0.95 },
};

const PaymentModal = ({
  isOpen,
  onClose,
  paymentMethod,
  totalAmount,
  onConfirmPayment,
}) => {
  const [paymentDetails, setPaymentDetails] = useState({});
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [adminAccountNumber, setAdminAccountNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (paymentMethod === "bkash" || paymentMethod === "nagad") {
        setPaymentDetails({ transactionId: "", senderNumber: "" });
      } else if (paymentMethod === "card") {
        setPaymentDetails({
          cardName: "",
          cardNumber: "",
          expiryDate: "",
          cvc: "",
        });
      }
    }
  }, [isOpen, paymentMethod]);

  // Fetch payment accounts when modal opens
  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      if (!isOpen) return;
      
      setLoadingAccounts(true);
      try {
        const response = await fetch('/api/payment/accounts/');
        if (response.ok) {
          const accounts = await response.json();
          setPaymentAccounts(accounts);
          
          // Set the first admin account number as default
          if (accounts.length > 0 && accounts[0].account_number) {
            setAdminAccountNumber(accounts[0].account_number);
          }
        } else {
          console.error('Failed to fetch payment accounts:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching payment accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchPaymentAccounts();
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [id]: value }));
  };

  const renderModalContent = () => {
    switch (paymentMethod) {
      case "bkash":
      case "nagad":
        return (
          <>
            <Image
              src={paymentMethod === "bkash" ? bkashLogo : nagadLogo}
              alt={`${paymentMethod} Logo`}
              width={150}
              className="mx-auto mb-4"
            />
            <p className="text-center text-md text-[var(--color-text-secondary)] mb-4">
              Send money to{" "}
              <strong className="text-[var(--color-accent-orange)]">
                01973794507
              </strong>{" "}
              and provide the transaction details below.
            </p>
            <FormField
              id="transactionId"
              label="Transaction ID"
              placeholder="Enter TrxID"
              required
              value={paymentDetails.transactionId || ""}
              onChange={handleInputChange}
            />
            <FormField
              id="senderNumber"
              label="Your Number"
              placeholder="e.g., 01xxxxxxxxx"
              required
              value={paymentDetails.senderNumber || ""}
              onChange={handleInputChange}
            />
          </>
        );
      case "card":
        return (
          <>
            <Image
              src={cardLogo}
              alt="Credit Card Logos"
              width={150}
              className="mx-auto mb-4"
            />
            <FormField
              id="cardName"
              label="Name on Card"
              placeholder="John Doe"
              required
              value={paymentDetails.cardName || ""}
              onChange={handleInputChange}
            />
            <FormField
              id="cardNumber"
              label="Card Number"
              placeholder="**** **** **** ****"
              required
              value={paymentDetails.cardNumber || ""}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                id="expiryDate"
                label="Expiry Date"
                placeholder="MM/YY"
                required
                colSpan="sm:col-span-2"
                value={paymentDetails.expiryDate || ""}
                onChange={handleInputChange}
              />
              <FormField
                id="cvc"
                label="CVC"
                placeholder="123"
                required
                value={paymentDetails.cvc || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentDataWithAccount = {
      ...paymentDetails,
      admin_account_number: adminAccountNumber
    };
    onConfirmPayment(paymentDataWithAccount);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-[var(--color-surface)] rounded-lg max-w-md w-full shadow-2xl relative p-6 z-50"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-2">
              Confirm Payment
            </h2>
            <div className="text-center mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total to pay: <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  ৳ {(() => {
                    const total = parseFloat(totalAmount) || 0;
                    return total.toFixed(2);
                  })()}
                </span>
              </h3>
            </div>
            
            {/* Admin Account Number Display */}
            {adminAccountNumber && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Send Payment To
                  </label>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {adminAccountNumber}
                  </div>
                  {loadingAccounts && (
                    <div className="flex items-center justify-center mt-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-xs text-gray-500">Loading account...</span>
                    </div>
                  )}
                  {!loadingAccounts && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Official payment account
                    </div>
                  )}
                </div>
              </div>
            )}
            {renderModalContent()}
            <motion.button
              type="submit"
              className="w-full mt-4 bg-[var(--color-button-primary)] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
              whileTap={{ scale: 0.98 }}
            >
              Confirm & Place Order
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
