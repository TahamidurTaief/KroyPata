"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiInfo, FiX, FiTruck } from "react-icons/fi";
import { getShippingMethods } from "@/app/lib/api";
import Tk_icon from "../Common/Tk_icon";

const ShippingMethodModal = ({ isOpen, onClose, shippingMethod }) => {
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

  if (!isOpen || !shippingMethod) return null;

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
            className="bg-[var(--color-surface)] rounded-lg p-6 max-w-md w-full mx-4 relative z-50"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiX size={20} />
            </button>

            {/* Modal Content */}
            <div className="pr-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiTruck className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {shippingMethod.title || shippingMethod.name}
                  </h3>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                    <Tk_icon size={16} className="mr-1" />{shippingMethod.price}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Description
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {shippingMethod.description || "No description available for this shipping method."}
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ShippingMethodCard = ({ shippingMethod, onInfoClick }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: { 
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FiTruck className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {shippingMethod.title || shippingMethod.name}
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
              <Tk_icon size={20} className="mr-1" />{shippingMethod.price}
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={() => onInfoClick(shippingMethod)}
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiInfo size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const ShippingMethods = ({ className = "" }) => {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        setLoading(true);
        const data = await getShippingMethods();
        setShippingMethods(data || []);
      } catch (err) {
        console.error("Error fetching shipping methods:", err);
        setError("Failed to load shipping methods. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShippingMethods();
  }, []);

  const handleInfoClick = (method) => {
    setSelectedMethod(method);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMethod(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Shipping Methods
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 dark:text-red-400 mb-4">
          <FiTruck size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!shippingMethods.length) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FiTruck size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No shipping methods available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Shipping Methods
      </h2>
      
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {shippingMethods.map((method) => (
          <ShippingMethodCard
            key={method.id}
            shippingMethod={method}
            onInfoClick={handleInfoClick}
          />
        ))}
      </motion.div>

      <ShippingMethodModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shippingMethod={selectedMethod}
      />
    </div>
  );
};

export default ShippingMethods;
