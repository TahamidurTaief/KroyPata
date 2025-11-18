'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHome, FiShoppingBag, FiShoppingCart, FiUser, FiPackage, FiGrid, FiPercent } from 'react-icons/fi';
import { CiShop } from 'react-icons/ci';
import { IoBagCheckOutline } from 'react-icons/io5';
import Link from 'next/link';
import { useEffect, memo, useRef } from 'react';

const MobileMenuModal = ({ isOpen, onClose, isAuthenticated, user, openAuthModal, logout, categories = [], offerCategories = [], offersLoading = false }) => {
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

  // Helper function to normalize URLs
  const normalizeUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `https://${url}`;
  };

  // Helper function to check if URL is external
  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || (!url.startsWith('/') && url.includes('.'));
  };

  const mainMenuItems = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Products", href: "/products", icon: FiShoppingBag },
    { name: "Categories", href: "/categories", icon: FiGrid },
    { name: "Cart", href: "/cart", icon: FiShoppingCart },
    { name: "Checkout", href: "/checkout", icon: FiShoppingCart },
    { name: "Orders", href: "/orders", icon: IoBagCheckOutline },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center mobile-menu-modal md:hidden"
        style={{ zIndex: 9999 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <motion.div
          ref={modalRef}
          className="bg-[var(--color-surface)] rounded-t-3xl shadow-2xl w-full max-h-[90vh] overflow-hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            type: 'spring', 
            damping: 30, 
            stiffness: 400,
            mass: 0.8
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-[var(--color-border)] rounded-full" aria-hidden="true"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h2 id="mobile-menu-title" className="text-xl font-bold text-[var(--color-text-primary)]">Menu</h2>
            <motion.button
              ref={closeButtonRef}
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 hover:bg-[var(--color-muted-bg)] rounded-full transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close mobile menu"
            >
              <FiX className="w-6 h-6 text-[var(--color-text-secondary)]" aria-hidden="true" />
            </motion.button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] mobile-menu-scroll">
            <div className="px-6 py-4 space-y-6">
              {/* User Section */}
              {isAuthenticated && user ? (
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FiUser className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <p className="font-bold text-[var(--color-text-primary)] text-lg">
                        {user.name || 'User'}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      href="/profile"
                      className="flex-1 text-center min-h-[44px] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                      onClick={onClose}
                    >
                      View Profile
                    </Link>
                    <motion.button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="flex-1 text-center min-h-[44px] py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Logout from your account"
                    >
                      Logout
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FiUser className="w-8 h-8 text-white" />
                    </motion.div>
                    <p className="text-[var(--color-text-secondary)] mb-4 font-medium">
                      Join iCommerce to unlock exclusive features
                    </p>
                    <motion.button
                      onClick={() => {
                        openAuthModal('login');
                        onClose();
                      }}
                      className="w-full min-h-[44px] py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Login or Sign up to your account"
                    >
                      Login / Sign Up
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Main Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-widest">
                  Navigation
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {mainMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 min-h-[44px] p-4 rounded-2xl bg-[var(--color-muted-bg)] hover:bg-[var(--color-border)] transition-all duration-200 hover:shadow-md"
                          onClick={onClose}
                        >
                          <div className="p-2 bg-[var(--color-surface)] rounded-xl shadow-sm">
                            <Icon className="w-5 h-5 text-[var(--color-button-primary)]" />
                          </div>
                          <span className="font-semibold text-[var(--color-text-primary)]">
                            {item.name}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Categories */}
              {categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-widest">
                    Categories
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.slice(0, 6).map((cat, index) => (
                      <motion.div
                        key={cat.id || cat.slug || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <Link
                          href={`/categories?category=${encodeURIComponent(cat.slug || cat.name || '')}`}
                          className="flex items-center gap-3 min-h-[44px] p-4 bg-[var(--color-muted-bg)] rounded-2xl hover:bg-[var(--color-border)] transition-all duration-200 hover:shadow-md"
                          onClick={onClose}
                        >
                          {cat.image_url || cat.image ? (
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                              <Image
                                src={cat.image_url || cat.image}
                                alt={cat.name || 'Category'}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                              <FiGrid className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {cat.name || cat.title}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  
                  {categories.length > 6 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Link
                        href="/categories"
                        className="block mt-4 text-center py-3 text-blue-600 dark:text-blue-400 font-semibold text-sm bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={onClose}
                      >
                        View All Categories ({categories.length} total)
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Special Offers - Dynamic */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)] mb-4 uppercase tracking-widest">
                  Special Offers
                </h3>
                
                {offersLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-muted-bg)] animate-pulse">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                        <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : offerCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <FiPercent className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      No special offers available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {offerCategories.map((offer, index) => {
                      const offerUrl = normalizeUrl(offer.link);
                      const isExternal = isExternalUrl(offer.link);
                      
                      // Get badge color classes
                      const getBadgeColor = (color) => {
                        const colorMap = {
                          'red': 'text-red-500 bg-red-100 dark:bg-red-900/30',
                          'blue': 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
                          'green': 'text-green-500 bg-green-100 dark:bg-green-900/30',
                          'orange': 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
                        };
                        return colorMap[color] || 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
                      };
                      
                      return (
                        <motion.div
                          key={offer.id || offer.slug || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          {isExternal ? (
                            <a
                              href={offerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--color-muted-bg)] transition-all duration-200 hover:shadow-md group"
                              onClick={onClose}
                            >
                              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200">
                                <FiPercent className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-button-primary)] transition-colors block truncate">
                                  {offer.title}
                                </span>
                                {offer.category_name && (
                                  <span className="text-xs text-[var(--color-text-secondary)]">
                                    {offer.category_name}
                                  </span>
                                )}
                              </div>
                              {offer.badge_text && (
                                <div className="ml-auto flex-shrink-0">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getBadgeColor(offer.badge_color)}`}>
                                    {offer.badge_text}
                                  </span>
                                </div>
                              )}
                            </a>
                          ) : (
                            <Link
                              href={offerUrl}
                              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--color-muted-bg)] transition-all duration-200 hover:shadow-md group"
                              onClick={onClose}
                            >
                              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200">
                                <FiPercent className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-button-primary)] transition-colors block truncate">
                                  {offer.title}
                                </span>
                                {offer.category_name && (
                                  <span className="text-xs text-[var(--color-text-secondary)]">
                                    {offer.category_name}
                                  </span>
                                )}
                              </div>
                              {offer.badge_text && (
                                <div className="ml-auto flex-shrink-0">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getBadgeColor(offer.badge_color)}`}>
                                    {offer.badge_text}
                                  </span>
                                </div>
                              )}
                            </Link>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div 
              className="p-6 border-t border-[var(--color-border)] bg-gradient-to-r from-[var(--color-muted-bg)] to-[var(--color-surface)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-center text-sm text-[var(--color-text-secondary)] font-medium">
                iCommerce - Your trusted shopping partner 🛍️
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Memoize the component to prevent unnecessary re-renders and fix blinking
export default memo(MobileMenuModal, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.isAuthenticated === nextProps.isAuthenticated &&
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.categories.length === nextProps.categories.length &&
    prevProps.offerCategories.length === nextProps.offerCategories.length &&
    prevProps.offersLoading === nextProps.offersLoading
  );
});
