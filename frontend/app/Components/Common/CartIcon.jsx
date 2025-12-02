"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CiShoppingCart } from "react-icons/ci";
import { useEffect, useState } from "react";

const CartIcon = ({ cartCount, animationTrigger, className = "", iconClassName = "text-xl" }) => {
  const [showPulse, setShowPulse] = useState(false);

  // Trigger pulse animation when items are added
  useEffect(() => {
    if (animationTrigger > 0) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [animationTrigger]);

  return (
    <Link href="/cart">
      <motion.div
        whileHover={{ 
          scale: 1.1, 
          y: -2,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-colors ${className}`}
        animate={showPulse ? {
          scale: [1, 1.25, 1],
          rotate: [0, -10, 10, 0],
        } : {}}
        transition={{
          duration: 0.6,
          ease: "easeOut",
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      >
        {/* Cart Icon */}
        <motion.div
          animate={showPulse ? {
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CiShoppingCart className={`${iconClassName} text-[var(--foreground)]`} />
        </motion.div>
        
        {/* Cart Count Badge */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: showPulse ? [-2, 0] : 0
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
              style={{
                fontSize: '10px',
                lineHeight: '1',
                boxShadow: '0 2px 8px rgba(224, 39, 56, 0.3)'
              }}
            >
              <motion.span
                key={cartCount} // Animate when count changes
                initial={{ scale: 1.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 400,
                  damping: 20
                }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Ripple effect when item is added */}
        <AnimatePresence>
          {showPulse && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-[var(--primary)]"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ zIndex: -1 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-[#4ade80]"
                initial={{ scale: 0.6, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                style={{ zIndex: -1 }}
              />
            </>
          )}
        </AnimatePresence>
        
        {/* Success indicator */}
        <AnimatePresence>
          {showPulse && (
            <motion.div
              className="absolute top-0 right-0 w-3 h-3 bg-[#22c55e] rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.5)'
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

export default CartIcon;
