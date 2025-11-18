"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiInfo, FiX, FiTruck, FiCheck } from "react-icons/fi";
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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiX size={20} />
            </button>

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

const CompactShippingMethodCard = ({ 
  shippingMethod, 
  onInfoClick, 
  onSelect, 
  isSelected = false, 
  selectable = false 
}) => {
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`
        border rounded-lg p-4 transition-all cursor-pointer
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${selectable ? 'hover:shadow-md' : ''}
      `}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={selectable ? () => onSelect(shippingMethod) : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {selectable && (
            <div className={`
              w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}
            `}>
              {isSelected && <FiCheck size={12} className="text-white" />}
            </div>
          )}
          
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <FiTruck className="text-gray-600 dark:text-gray-400" size={16} />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {shippingMethod.title || shippingMethod.name}
            </h4>
            <p className="text-blue-600 dark:text-blue-400 font-semibold flex items-center">
              <Tk_icon size={16} className="mr-1" />{shippingMethod.price}
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick(shippingMethod);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiInfo size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const CompactShippingMethods = ({ 
  className = "",
  onSelectionChange,
  selectedMethodId = null,
  selectable = false,
  title = "Shipping Options"
}) => {
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
        setError("Failed to load shipping methods.");
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

  const handleSelect = (method) => {
    if (onSelectionChange) {
      onSelectionChange(method);
    }
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
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1 w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {shippingMethods.map((method) => (
          <CompactShippingMethodCard
            key={method.id}
            shippingMethod={method}
            onInfoClick={handleInfoClick}
            onSelect={handleSelect}
            isSelected={selectable && selectedMethodId === method.id}
            selectable={selectable}
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

export default CompactShippingMethods;
