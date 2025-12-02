"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiCheckCircle, FiX } from "react-icons/fi";

const SuccessModal = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-[var(--card)] rounded-xl max-w-sm w-full shadow-2xl relative p-8 text-center"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>

            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <FiCheckCircle className="text-green-500 text-6xl mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Success!
              </h2>
              <p className="text-[var(--muted-foreground)] mb-6">
                Your item has been added to the cart.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link href="/products" passHref legacyBehavior>
                  <a
                    onClick={onClose}
                    className="w-full text-center px-6 py-3 bg-[var(--color-border)] text-[var(--foreground)] font-bold rounded-lg hover:opacity-80 transition-opacity"
                  >
                    Shopping
                  </a>
                </Link>
                <Link href="/cart" passHref legacyBehavior>
                  <a
                    onClick={onClose}
                    className="w-full text-center px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Checkout
                  </a>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
