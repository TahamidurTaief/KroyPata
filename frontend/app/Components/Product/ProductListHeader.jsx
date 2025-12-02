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
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none z-10" size={18} />
        <input
          type="search"
          value={localSearchQuery}
          onChange={handleSearchChange}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all outline-none"
        />
      </div>

      {/* Sort Dropdown */}
      <select
        value={currentSort}
        onChange={(e) => onSortChange?.(e.target.value)}
        className="px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all outline-none cursor-pointer min-w-[160px]"
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
        className="xl:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg transition-colors font-medium"
      >
        <FiFilter size={18} />
        Filters
      </motion.button>
    </motion.div>
  );
};

export default ProductListHeader;
