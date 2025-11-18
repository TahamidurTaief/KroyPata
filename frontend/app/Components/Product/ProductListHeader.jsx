"use client";

import { useState } from "react";
import { FiGrid, FiList, FiFilter, FiSearch } from "react-icons/fi";
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
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "created_at", label: "Newest First" }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(localSearchQuery);
  };

  // FIXED: Add real-time search on input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    // Trigger search immediately on input change
    onSearch?.(value);
  };

  const itemsPerPage = 10;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalProducts);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
      {/* Top Row - Search and Mobile Filter Button */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={localSearchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Mobile Filter Toggle */}
        <button
          onClick={onToggleMobileFilters}
          className="md:hidden flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <FiFilter size={18} />
          Filters
        </button>
      </div>

      {/* Bottom Row - Results Info, Sort, and View Mode */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        {/* Results Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalProducts > 0 ? (
            <>
              Showing <span className="font-medium text-gray-900 dark:text-gray-100">{startItem}-{endItem}</span> of{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">{totalProducts}</span> products
              {totalPages > 1 && (
                <> (Page {currentPage} of {totalPages})</>
              )}
            </>
          ) : (
            "No products found"
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              id="sort"
              value={currentSort}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="px-3 py-2 min-h-[44px] text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          {/* <div className="hidden sm:flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
              title="Grid View"
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
              title="List View"
            >
              <FiList size={16} />
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProductListHeader;
