"use client";
import React, { useState, useCallback, useEffect } from "react";
import { VscSettings, VscChromeClose } from "react-icons/vsc";
import Link from "next/link";
import * as SliderPrimitive from "@radix-ui/react-slider";
import Tk_icon from "@/app/Components/Common/Tk_icon"; // Import Tk_icon

const ChevronDownIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const FilterSection = ({ categories = [], onFilterChange, theme = "light" }) => {
  const MAX_PRICE = 1000;
  const [filters, setFilters] = useState({
    priceRange: [0, MAX_PRICE],
    selectedCategory: "",
    sortOrder: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (onFilterChange) {
      // Transform filters to match FilterProducts expectations
      const transformedFilters = {
        category: filters.selectedCategory,
        priceRange: {
          min: filters.priceRange[0],
          max: filters.priceRange[1]
        },
        sort: filters.sortOrder,
      };
      onFilterChange(transformedFilters);
    }
  }, [filters, onFilterChange]);

  const handlePriceChange = (value) => {
    setFilters((prev) => ({ ...prev, priceRange: value }));
  };

  const toggleModal = useCallback(() => {
    if (!isModalOpen) {
      setIsModalOpen(true);
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setIsModalOpen(false);
        document.body.style.overflow = "";
      }, 300);
    }
  }, [isModalOpen]);

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleModal();
    }
  };

  const applyFilters = () => {
    toggleModal();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        toggleModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, toggleModal]);

  return (
    <>
      <section className="container mx-auto pt-8 md:pb-4">
        <div className="flex bg-[var(--card)] shadow-md py-4 px-5 rounded-lg flex-row md:flex-row justify-between items-start md:items-center align-center gap-6 mb-8">
          <div className="w-full">
            <Link href="/products">
              <h2 className="text-xl md:text-xl lg:text-3xl xl:text-4xl font-bold text-[var(--foreground)] w-full">
                Explore <span className="text-[var(--primary)]">Products</span>
              </h2>
            </Link>
          </div>
          <div className="justify-end flex md:hidden">
            <button
              onClick={toggleModal}
              className="p-1"
              aria-label="Open filters"
            >
              <VscSettings className="text-2xl text-[var(--foreground)]" />
            </button>
          </div>
          <div className="w-full hidden md:flex">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category Dropdown */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <select
                    id="category-select"
                    value={filters.selectedCategory}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedCategory: e.target.value,
                      }))
                    }
                    className={`w-full pl-4 pr-10 py-2.5 text-[var(--foreground)] bg-[var(--muted)] border border-[var(--color-border)] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all hover:bg-[var(--muted)]/80`}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3">
                {/* <h3 className={`text-lg font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Price Range</h3> */}
                <div className="pl-2 space-y-2">
                  <div className={`flex justify-between text-sm text-[var(--muted-foreground)]`}>
                    <span className="flex items-center gap-1">
                      <Tk_icon size={12} />
                      {filters.priceRange[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tk_icon size={12} />
                      {filters.priceRange[1]}
                    </span>
                  </div>
                  <SliderPrimitive.Root
                    min={0}
                    max={MAX_PRICE}
                    step={10}
                    value={filters.priceRange}
                    onValueChange={handlePriceChange}
                    className="relative flex w-full touch-none select-none items-center"
                  >
                    <SliderPrimitive.Track className={`relative h-2 w-full grow overflow-hidden rounded-full bg-[var(--muted)]`}>
                      <SliderPrimitive.Range className={`absolute h-full bg-[var(--primary)]`} />
                    </SliderPrimitive.Track>
                    <SliderPrimitive.Thumb className={`block h-5 w-5 rounded-full border-2 border-[var(--primary)] bg-[var(--card)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`} />
                    <SliderPrimitive.Thumb className={`block h-5 w-5 rounded-full border-2 border-[var(--primary)] bg-[var(--card)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`} />
                  </SliderPrimitive.Root>
                  
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
                <div className="relative">
                  <select
                    id="sort-order"
                    value={filters.sortOrder}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))
                    }
                    className={`w-full pl-4 pr-10 py-2.5 text-[var(--foreground)] bg-[var(--muted)] border border-[var(--color-border)] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all hover:bg-[var(--muted)]/80`}
                  >
                    <option value="">Relevance</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                    <option value="-name">Name: Z-A</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex w-52">
            <Link
              href="/products"
              className="text-blue-500 lato hover:text-blue-400 duration-200 w-full text-md underline"
            >
              All Products
            </Link>
          </div> */}
        </div>
      </section>

      {/* Mobile Modal Filters */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end transition-opacity duration-300"
          onClick={handleOutsideClick}
          style={{
            opacity: isAnimating ? 1 : 0,
            transition: "opacity 300ms ease-out",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className={`w-full bg-[var(--card)] rounded-t-4xl shadow-xl transform transition-transform duration-300 ${isAnimating ? "translate-y-0" : "translate-y-full"}`}
            style={{
              maxHeight: "70vh",
              marginBottom: "40px",
              paddingBottom: "25px",
            }}
          >
            <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--color-border)] px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Filter Products
              </h3>
              <button
                onClick={toggleModal}
                className="min-h-[44px] min-w-[44px] p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center"
                aria-label="Close filters"
              >
                <VscChromeClose className="text-2xl" />
              </button>
            </div>

            <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(70vh - 72px)" }}>
              {/* Mobile Filters */}
              {/* Category */}
              <div className="flex flex-col gap-3 mb-6">
                <label htmlFor="mobile-category-select" className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="mobile-category-select"
                    value={filters.selectedCategory}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedCategory: e.target.value,
                      }))
                    }
                    className="w-full pl-4 pr-10 py-3 text-[var(--foreground)] bg-[var(--muted)] border border-[var(--color-border)] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* Price Range Mobile */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="relative h-16 bg-[var(--muted)] px-2 py-5 mt-1 border border-[var(--color-border)] rounded-lg flex items-center">
                  <div className="relative w-full h-1.5 bg-[var(--color-border)] rounded-full">
                    <div
                      className="absolute h-1.5 bg-[var(--primary)] rounded-full"
                      style={{ left: `${(filters.priceRange[0] / MAX_PRICE) * 100}%`, right: `${100 - (filters.priceRange[1] / MAX_PRICE) * 100}%` }}
                    />
                  </div>
                  <div className="absolute top-0 left-0 right-0 flex justify-between px-2 pt-1">
                    <span className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">
                      <Tk_icon size={10} />
                      {filters.priceRange[0]}
                    </span>
                    <span className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">
                      <Tk_icon size={10} />
                      {filters.priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={MAX_PRICE}
                    step="10"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange([+e.target.value, filters.priceRange[1]])}
                    className="price-range-thumb"
                    aria-label="Minimum Price"
                  />
                  <input
                    type="range"
                    min="0"
                    max={MAX_PRICE}
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange([filters.priceRange[0], +e.target.value])}
                    className="price-range-thumb"
                    aria-label="Maximum Price"
                  />
                </div>
              </div>

              {/* Sort By Mobile */}
              <div className="flex flex-col gap-3 mb-8">
                <label htmlFor="mobile-sort-order" className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    id="mobile-sort-order"
                    value={filters.sortOrder}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))
                    }
                    className="w-full pl-4 pr-10 py-3 text-[var(--foreground)] bg-[var(--muted)] border border-[var(--color-border)] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  >
                    <option value="">Relevance</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                    <option value="-name">Name: Z-A</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full min-h-[44px] py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSection;
