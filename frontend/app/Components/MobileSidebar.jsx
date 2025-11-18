'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { 
  X, 
  ChevronRight, 
  ArrowLeft,
  Grid3X3,
  Tag
} from 'lucide-react';

const MobileSidebar = ({ isOpen, onClose, categories = [] }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug log when sidebar opens/closes
  useEffect(() => {
    console.log('MobileSidebar isOpen:', isOpen);
  }, [isOpen]);

  const isDark = mounted && theme === 'dark';

  // Handle category click - redirect to products with category filter
  const handleCategoryClick = (category) => {
    const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || '';
    router.push(`/products?category=${encodeURIComponent(categorySlug)}`);
    onClose();
  };

  // Handle arrow click - show subcategories
  const handleShowSubcategories = (category, e) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setSubcategories(category.subcategories || []);
    setShowSubcategories(true);
  };

  // Handle subcategory click - redirect to products with subcategory filter
  const handleSubcategoryClick = (subcategory) => {
    const categorySlug = selectedCategory?.slug || selectedCategory?.name?.toLowerCase().replace(/\s+/g, '-') || '';
    const subcategorySlug = subcategory.slug || subcategory.name?.toLowerCase().replace(/\s+/g, '-') || '';
    
    router.push(`/products?category=${encodeURIComponent(categorySlug)}&subcategory=${encodeURIComponent(subcategorySlug)}`);
    onClose();
  };

  // Handle back from subcategories
  const handleBackToCategories = () => {
    setShowSubcategories(false);
    setSelectedCategory(null);
    setSubcategories([]);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 md:hidden ${
              isDark 
                ? 'bg-gray-900/95 backdrop-blur-xl border-gray-700/50' 
                : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
            } border-l shadow-2xl flex flex-col rounded-l-2xl overflow-hidden`}
            style={{
              boxShadow: isDark 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } bg-gradient-to-r ${
              isDark 
                ? 'from-gray-900 via-gray-800 to-gray-900' 
                : 'from-white via-gray-50 to-white'
            }`}>
              <motion.h2 
                className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {showSubcategories 
                  ? selectedCategory?.name || 'Subcategories'
                  : 'Menu'
                }
              </motion.h2>
              <div className="flex items-center gap-2">
                {showSubcategories && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleBackToCategories}
                    className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isDark 
                        ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    } hover:scale-105 active:scale-95`}
                    aria-label="Back to categories"
                  >
                    <ArrowLeft size={20} />
                  </motion.button>
                )}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  onClick={onClose}
                  className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isDark 
                      ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  } hover:scale-105 active:scale-95`}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {!showSubcategories ? (
                  <motion.div
                    key="main-menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 space-y-6"
                  >
                    {/* Categories */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${
                          isDark ? 'from-green-400 to-blue-400' : 'from-green-500 to-blue-500'
                        }`} />
                        <Grid3X3 size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                        <h3 className={`text-sm font-semibold ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          CATEGORIES
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {categories.map((category, index) => (
                          <motion.div
                            key={category.id || category.slug || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                              isDark 
                                ? 'hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                            } hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
                          >
                            <div 
                              className="flex items-center gap-3 flex-1"
                              onClick={() => handleCategoryClick(category)}
                            >
                              {/* Category Image */}
                              {category.image_url || category.image ? (
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-300 dark:group-hover:ring-blue-500 transition-all duration-200">
                                  <Image 
                                    src={category.image_url || category.image} 
                                    alt={category.name || 'Category'} 
                                    fill 
                                    className="object-cover group-hover:scale-110 transition-transform duration-200" 
                                  />
                                </div>
                              ) : (
                                <div className={`w-10 h-10 rounded-xl ${
                                  isDark ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-200 group-hover:bg-gray-300'
                                } flex items-center justify-center transition-colors duration-200`}>
                                  <Tag size={18} className={`${
                                    isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                                  } transition-colors duration-200`} />
                                </div>
                              )}
                              
                              {/* Category Name */}
                              <span className={`font-medium transition-colors duration-200 ${
                                isDark ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                              }`}>
                                {category.name || category.title}
                              </span>
                            </div>

                            {/* Arrow Button for Subcategories */}
                            {category.subcategories && category.subcategories.length > 0 && (
                              <div className="flex items-center gap-1">
                                {/* Subcategory count badge */}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all duration-200 ${
                                  isDark 
                                    ? 'bg-blue-900/30 text-blue-300 group-hover:bg-blue-800/50 group-hover:text-blue-200' 
                                    : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-hover:text-blue-700'
                                }`}>
                                  {category.subcategories.length}
                                </span>
                                <button
                                  onClick={(e) => handleShowSubcategories(category, e)}
                                  className={`min-h-[44px] min-w-[44px] p-2 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                                    isDark 
                                      ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-300' 
                                      : 'hover:bg-gray-200 text-gray-500 hover:text-blue-600'
                                  }`}
                                  aria-label={`View ${category.subcategories.length} subcategories`}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Subcategories View
                  <motion.div
                    key="subcategories"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4"
                  >
                    {/* Category Info */}
                    <div className={`p-4 rounded-xl mb-4 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    } border`}>
                      <div className="flex items-center gap-3">
                        {selectedCategory?.image_url || selectedCategory?.image ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
                            <Image 
                              src={selectedCategory.image_url || selectedCategory.image} 
                              alt={selectedCategory.name || 'Category'} 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-lg ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          } flex items-center justify-center`}>
                            <Tag size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                          </div>
                        )}
                        <div>
                          <h3 className={`font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {selectedCategory?.name || selectedCategory?.title}
                          </h3>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {subcategories.length} subcategories
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subcategories List */}
                    <div className="space-y-1">
                      {subcategories.length === 0 ? (
                        <div className={`text-center py-8 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Tag size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No subcategories found</p>
                        </div>
                      ) : (
                        subcategories.map((subcategory, index) => (
                          <motion.button
                            key={subcategory.id || subcategory.slug || index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSubcategoryClick(subcategory)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                              isDark 
                                ? 'hover:bg-gray-800 text-gray-200' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {/* Subcategory Image */}
                            {subcategory.image_url || subcategory.image ? (
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
                                <Image 
                                  src={subcategory.image_url || subcategory.image} 
                                  alt={subcategory.name || 'Subcategory'} 
                                  fill 
                                  className="object-cover" 
                                />
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-lg ${
                                isDark ? 'bg-gray-700' : 'bg-gray-200'
                              } flex items-center justify-center`}>
                                <Tag size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                              </div>
                            )}
                            
                            {/* Subcategory Name */}
                            <span className="font-medium text-left">
                              {subcategory.name || subcategory.title}
                            </span>
                          </motion.button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
