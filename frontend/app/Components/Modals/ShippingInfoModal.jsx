'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTruck, FiClock, FiShield, FiMapPin, FiDollarSign, FiInfo, FiCheck } from 'react-icons/fi';
import { useEffect, useRef } from 'react';
import Tk_icon from '../Common/Tk_icon';

const ShippingInfoModal = ({ isOpen, onClose, selectedMethod = null, shippingMethods = [] }) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  // Close modal on ESC key and manage focus trap
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    
    const handleTabKey = (e) => {
      if (!modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc, false);
      document.addEventListener('keydown', handleTabKey, false);
      document.body.style.overflow = 'hidden';
      
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc, false);
      document.removeEventListener('keydown', handleTabKey, false);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentMethod = selectedMethod ? shippingMethods.find(m => m.id.toString() === selectedMethod.toString()) : null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-modal-title"
      >
        <motion.div
          ref={modalRef}
          className="bg-[var(--color-second-bg)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <FiTruck className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h2 id="shipping-modal-title" className="text-2xl font-bold text-foreground">Shipping Information</h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
              aria-label="Close shipping information modal"
            >
              <FiX className="w-5 h-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Current Selected Method */}
            {currentMethod && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">Your Selected Shipping Method</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{currentMethod.name}</h4>
                    <p className="text-blue-700 dark:text-blue-300 mb-2">{currentMethod.description}</p>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">{currentMethod.delivery_estimated_time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 flex items-center justify-end">
                      {currentMethod.price === 0 || currentMethod.price === '0.00' ? 'FREE' : <><Tk_icon size={24} className="mr-2" />{currentMethod.price}</>}
                    </div>
                    {currentMethod.tracking_available && (
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <FiShield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Tracking Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* General Shipping Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipping Methods Overview */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FiTruck className="w-5 h-5 text-blue-600" />
                  Available Shipping Methods
                </h3>
                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <div key={method.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{method.name}</h4>
                        <span className="font-bold text-lg text-foreground flex items-center">
                          {method.price === 0 || method.price === '0.00' ? 'FREE' : <><Tk_icon size={18} className="mr-1" />{method.price}</>}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-secondary)] text-sm mb-2">{method.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                          <span className="text-[var(--color-text-secondary)]">{method.delivery_estimated_time}</span>
                        </div>
                        {method.tracking_available && (
                          <div className="flex items-center gap-1">
                            <FiShield className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Tracking Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Policies */}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                  Shipping Policies & Information
                </h3>
                
                <div className="space-y-6">
                  {/* Delivery Areas */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-green-600" />
                      Delivery Areas
                    </h4>
                    <ul className="text-[var(--color-text-secondary)] space-y-1 ml-6">
                      <li>• ঢাকা শহরের মধ্যে: ১-২ কর্মদিবস</li>
                      <li>• ঢাকার বাইরে: ৩-৫ কর্মদিবস</li>
                      <li>• দূরবর্তী এলাকা: ৫-৭ কর্মদিবস</li>
                      <li>• পার্বত্য এলাকা: ৭-১০ কর্মদিবস</li>
                    </ul>
                  </div>

                  {/* Free Shipping */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4 text-green-600" />
                      Free Shipping Policy
                    </h4>
                    <div className="text-[var(--color-text-secondary)] space-y-2">
                      <p>• ৳১০০০ বা তার বেশি অর্ডারে বিনামূল্যে ডেলিভারি</p>
                      <p>• কিছু নির্দিষ্ট পণ্যের জন্য বিশেষ অফার</p>
                      <p>• প্রিমিয়াম সদস্যদের জন্য সর্বদা ফ্রি শিপিং</p>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FiShield className="w-4 h-4 text-orange-600" />
                      Important Notes
                    </h4>
                    <div className="text-[var(--color-text-secondary)] space-y-2">
                      <p>• ডেলিভারি সময় আবহাওয়া ও পরিবহন ব্যবস্থার উপর নির্ভর করে</p>
                      <p>• ঈদ ও অন্যান্য বিশেষ ছুটির দিনে বিলম্ব হতে পারে</p>
                      <p>• ভাঙ্গুর পণ্যের জন্য বিশেষ প্যাকেজিং করা হয়</p>
                      <p>• ডেলিভারির সময় অবশ্যই গ্রাহককে উপস্থিত থাকতে হবে</p>
                    </div>
                  </div>

                  {/* Contact for Support */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Need Help with Shipping?
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                      আপনার শিপিং সংক্রান্ত কোনো প্রশ্ন থাকলে আমাদের কাস্টমার সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                    </p>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <p>📞 হটলাইন: +৮৮০ ১৭XXXXXXXX</p>
                      <p>📧 ইমেইল: support@icommerce.com</p>
                      <p>⏰ সেবা সময়: সকাল ৯টা - রাত ৯টা (সাত দিন)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6">
            <div className="flex items-center justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                aria-label="Close modal and return"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShippingInfoModal;
