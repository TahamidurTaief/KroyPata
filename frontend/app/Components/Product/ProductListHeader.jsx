"use client";

import { useState, useEffect } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

const ProductListHeader = ({ 
  totalProducts, 
  currentPage, 
  totalPages, 
  onSortChange, 
  currentSort,
  onToggleMobileFilters,
  onSearch,
  searchQuery = ""
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "created_at", label: "Newest First" }
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6"
    >
      {/* Search Bar */}
      <div className="flex-1 relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10" size={18} />
        <input
          type="search"
          value={localSearchQuery}
          onChange={handleSearchChange}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent transition-all outline-none"
        />
      </div>

      {/* Sort Dropdown */}
      <select
        value={currentSort}
        onChange={(e) => onSortChange?.(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent transition-all outline-none cursor-pointer min-w-[160px]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Mobile Filter Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggleMobileFilters}
        className="xl:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg transition-colors font-medium"
      >
        <FiFilter size={18} />
        Filters
      </motion.button>
    </motion.div>
  );
};

export default ProductListHeader;
