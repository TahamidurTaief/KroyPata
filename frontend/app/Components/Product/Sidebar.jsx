"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, X, Filter } from "lucide-react";
import { getCategories, getColors, getShippingCategories, getBrands, getSubCategories } from "@/app/lib/api";

const Sidebar = ({ filters, onFilterChange, onClearFilters, theme }) => {
  // Enhanced theme handling with proper fallbacks and state management
  const [mounted, setMounted] = useState(false);
  
  // Handle theme changes and mount state
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [shippingCategories, setShippingCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllShippingCategories, setShowAllShippingCategories] = useState(false);

  // Fetch all data for filters when the component mounts
  useEffect(() => {
    if (!mounted) return; // Don't fetch until mounted to prevent hydration issues
    
    const fetchSidebarData = async () => {
      try {
        console.log('🔄 Fetching sidebar data with category:', filters.category);
        const [categoriesData, brandsData, colorsData, shippingCategoriesData] = await Promise.all([
          getCategories(),
          getBrands(filters.category), // Pass category filter if available
          getColors(filters.category), // Pass category filter if available
          getShippingCategories(),
        ]);
        console.log('✅ Sidebar data received:', {
          categories: categoriesData?.length,
          brands: brandsData?.length,
          colors: colorsData?.length,
          shippingCategories: shippingCategoriesData?.length,
          categoryFilter: filters.category
        });
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (Array.isArray(brandsData)) {
          console.log('🏷️ Setting brands:', brandsData.map(b => b.name));
          setBrands(brandsData);
        }
        if (Array.isArray(colorsData)) {
          console.log('🎨 Setting colors:', colorsData.map(c => c.name));
          setColors(colorsData);
        }
        if (Array.isArray(shippingCategoriesData)) setShippingCategories(shippingCategoriesData);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };
    fetchSidebarData();
  }, [mounted, filters.category]); // Re-fetch when category changes

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (!mounted) return; // Don't fetch until mounted
    
    const fetchSubcategories = async () => {
      if (filters.category) {
        try {
          console.log('🔄 Fetching subcategories for category:', filters.category);
          const subcategoriesData = await getSubCategories(filters.category);
          if (Array.isArray(subcategoriesData)) {
            console.log('✅ Subcategories received:', subcategoriesData.length);
            setSubcategories(subcategoriesData);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      } else {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [mounted, filters.category]);

  const handleBrandChange = (slug) => {
    console.log('🔄 Brand change:', { slug, currentBrands: filters.brands, currentBrand: filters.brand });
    
    // If we already have multiple brands selected, toggle this one
    if (filters.brands && filters.brands.length > 0) {
      const newBrands = filters.brands.includes(slug)
        ? filters.brands.filter(b => b !== slug)
        : [...filters.brands, slug];
      console.log('📝 Multiple brand selection:', newBrands);
      onFilterChange({ brands: newBrands, brand: "" });
    } else {
      // If only single brand was selected, switch to multiple selection
      const newBrands = filters.brand === slug ? [] : [slug];
      console.log('📝 Single to multiple brand selection:', newBrands);
      onFilterChange({ brands: newBrands, brand: "" });
    }
  };

  const handleCategoryChange = (slug) => {
    const newCategory = filters.category === slug ? "" : slug;
    console.log('🔄 Category change:', { oldCategory: filters.category, newCategory });
    onFilterChange({ 
      category: newCategory, 
      subcategory: "", 
      subcategories: [] // Clear subcategories when category changes
    }); 
  };

  const handleSubcategoryChange = (slug) => {
    // Support multiple subcategory selection
    if (filters.subcategories && filters.subcategories.length > 0) {
      const newSubcategories = filters.subcategories.includes(slug)
        ? filters.subcategories.filter(s => s !== slug)
        : [...filters.subcategories, slug];
      onFilterChange({ subcategories: newSubcategories, subcategory: "" });
    } else {
      // If only single subcategory was selected, switch to multiple selection
      onFilterChange({ 
        subcategories: filters.subcategory === slug ? [] : [slug], 
        subcategory: "" 
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(price);
  };

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  const handleSortChange = (value) => onFilterChange({ sort: value });
  const handlePriceChange = (values) => onFilterChange({ priceRange: values });

  const handleColorChange = (name) => {
    console.log('🔄 Color change:', { name, currentColors: filters.colors });
    
    const newColors = filters.colors.includes(name)
      ? filters.colors.filter((c) => c !== name)
      : [...filters.colors, name];
    
    console.log('📝 Color selection updated:', newColors);
    onFilterChange({ colors: newColors });
  };
  
  const handleShippingCategoryChange = (id) => {
    const newShippingCategories = (filters.shipping_categories || []).includes(id)
      ? (filters.shipping_categories || []).filter((c) => c !== id)
      : [...(filters.shipping_categories || []), id];
    onFilterChange({ shipping_categories: newShippingCategories });
  };

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5);
  const displayedSubcategories = showAllSubcategories ? subcategories : subcategories.slice(0, 5);
  const displayedBrands = showAllBrands ? brands : brands.slice(0, 5);
  const displayedColors = showAllColors ? colors : colors.slice(0, 6);
  const displayedShippingCategories = showAllShippingCategories ? shippingCategories : shippingCategories.slice(0, 5);

  // Prevent hydration mismatch with enhanced loading state
  if (!mounted) {
    return (
      <div className="w-full md:w-72 rounded-xl shadow-sm border bg-[var(--card)] border-[var(--border)] transition-all duration-300">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)] rounded-t-xl">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h2 className="text-xl font-raleway font-bold text-[var(--foreground)] tracking-wide">Filters</h2>
          </div>
          <div className="w-16 h-6 bg-[var(--muted)] rounded animate-pulse" />
        </div>
        <div className="overflow-y-auto px-6 py-6 space-y-8 flex-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-[var(--muted)] rounded w-24 animate-pulse" />
              <div className="space-y-3 pl-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-[var(--muted)] rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-72 xl:w-80 rounded-xl border transition-all duration-300 bg-[var(--card)] border-[var(--border)] shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b transition-all duration-300 border-[var(--border)] bg-[var(--muted)] rounded-t-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 text-[var(--primary)]" />
          <h2 className="text-lg sm:text-xl font-raleway font-bold tracking-wide transition-colors duration-300 text-[var(--foreground)]">
            Filters
          </h2>
        </div>
        <button 
          onClick={onClearFilters} 
          className="text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-all duration-200 text-red-500 hover:text-red-600 hover:bg-red-500/10 active:bg-red-500/20"
        >
          <X size={12} className="sm:w-3.5 sm:h-3.5" /> 
          <span className="hidden sm:inline">Clear all</span>
          <span className="sm:hidden">Clear</span>
        </button>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 flex-1 transition-all duration-300">
        {/* Sort By Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold transition-colors duration-300 text-[var(--foreground)]">
            Sort By
          </h3>
          <div className="space-y-1.5 pl-1">
            {sortOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <button 
                  onClick={() => handleSortChange(option.value)} 
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    filters.sort === option.value 
                      ? "bg-[var(--primary)] border-[var(--primary)]" 
                      : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                  }`}
                >
                  {filters.sort === option.value && <Check size={10} className="text-white" />}
                </button>
                <span className="text-xs font-medium transition-colors duration-200 text-[var(--muted-foreground)]">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold transition-colors duration-300 text-[var(--foreground)]">
            Price Range
          </h3>
          <div className="pl-1 space-y-3">
            <div className="relative">
              <div className="relative h-6 flex items-center">
                {/* Track */}
                <div className="absolute w-full h-2 rounded-lg transition-colors duration-300 bg-[var(--muted)]"></div>
                
                {/* Active Range */}
                <div 
                  className="absolute h-2 bg-[var(--primary)] rounded-lg shadow-sm"
                  style={{
                    left: `${(filters.priceRange[0] / 1000) * 100}%`,
                    width: `${((filters.priceRange[1] - filters.priceRange[0]) / 1000) * 100}%`
                  }}
                ></div>
                
                {/* Min Range Input */}
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={10}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value <= filters.priceRange[1]) {
                      handlePriceChange([value, filters.priceRange[1]]);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
                  style={{
                    background: 'transparent',
                    pointerEvents: 'all',
                    zIndex: 1
                  }}
                />
                
                {/* Max Range Input */}
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={10}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= filters.priceRange[0]) {
                      handlePriceChange([filters.priceRange[0], value]);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
                  style={{
                    background: 'transparent',
                    pointerEvents: 'all',
                    zIndex: 2
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm font-semibold transition-colors duration-300 text-[var(--muted-foreground)]">
              <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                {formatPrice(filters.priceRange[0])}
              </span>
              <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                {formatPrice(filters.priceRange[1])}
              </span>
            </div>
          </div>
        </div>

        {/* Categories/Subcategories Section */}
        {filters.category ? (
          // Show subcategories when category is selected
          <div className="space-y-2">
            <div className="flex flex-col items-start justify-between gap-2">
              <button
                onClick={() => onFilterChange({ category: "", subcategory: "", subcategories: [] })}
                className="text-xs px-2 py-1 rounded-md font-medium transition-all duration-200 text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20"
              >
                ← Back to Categories
              </button>
              <h3 className="text-sm font-semibold transition-colors duration-300 text-[var(--foreground)]">
                Subcategories
              </h3>
            </div>
            <div className="space-y-2 pl-1">
              {displayedSubcategories.map((subcat) => {
                const isSelected = filters.subcategories?.includes(subcat.slug) || filters.subcategory === subcat.slug;
                return (
                  <div 
                    key={subcat.id} 
                    onClick={() => handleSubcategoryChange(subcat.slug)} 
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                      isSelected 
                        ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                        : "hover:bg-[var(--muted)] border-transparent"
                    }`}
                  >
                    {subcat.image && (
                      <div className="relative w-8 h-8 rounded-md overflow-hidden">
                        <Image src={subcat.image} alt={subcat.name} fill className="object-cover" />
                      </div>
                    )}
                    <span className="flex-1 text-xs font-medium transition-colors duration-200 text-[var(--foreground)]">
                      {subcat.name}
                    </span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected 
                        ? "bg-[var(--primary)] border-[var(--primary)]" 
                        : "border-[var(--border)]"
                    }`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                  </div>
                );
              })}
              {subcategories.length > 5 && (
                <button 
                  onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                  className="w-full text-xs px-2 py-1.5 rounded-md font-medium transition-all duration-200 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                >
                  {showAllSubcategories ? "See Less" : `See More (${subcategories.length})`}
                </button>
              )}
            </div>
          </div>
        ) : (
          // Show categories when no category is selected
          <div className="space-y-2">
            <h3 className="text-sm font-semibold transition-colors duration-300 text-[var(--foreground)]">
              Categories
            </h3>
            <div className="space-y-2 pl-1">
              {displayedCategories.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => handleCategoryChange(cat.slug)} 
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                    filters.category === cat.slug 
                      ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                      : "hover:bg-[var(--muted)] border-transparent"
                  }`}
                >
                  {cat.image && (
                    <div className="relative w-8 h-8 rounded-md overflow-hidden">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                    </div>
                  )}
                  <span className="flex-1 text-xs font-medium transition-colors duration-200 text-[var(--foreground)]">
                    {cat.name}
                  </span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    filters.category === cat.slug 
                      ? "bg-[var(--primary)] border-[var(--primary)]" 
                      : "border-[var(--border)]"
                  }`}>
                    {filters.category === cat.slug && <Check size={10} className="text-white" />}
                  </div>
                </div>
              ))}
              {categories.length > 5 && (
                <button 
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-xs px-2 py-1.5 rounded-md font-medium transition-all duration-200 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                >
                  {showAllCategories ? "See Less" : `See More (${categories.length})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Brand Section */}
        {brands.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold transition-colors duration-300 text-[var(--foreground)]">
              Brands
            </h3>
            <div className="space-y-2 pl-1">
              {displayedBrands.map((brand) => {
                const isSelected = filters.brands?.includes(brand.slug) || filters.brand === brand.slug;
                return (
                  <div 
                    key={brand.id} 
                    onClick={() => handleBrandChange(brand.slug)} 
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                      isSelected 
                        ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                        : "hover:bg-[var(--muted)] border-transparent"
                    }`}
                  >
                    {brand.image && (
                      <div className="relative w-8 h-8 rounded-md overflow-hidden">
                        <Image src={brand.image} alt={brand.name} fill className="object-cover" />
                      </div>
                    )}
                    <span className="flex-1 text-xs font-medium transition-colors duration-200 text-[var(--foreground)]">
                      {brand.name}
                    </span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected 
                        ? "bg-[var(--primary)] border-[var(--primary)]" 
                        : "border-[var(--border)]"
                    }`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                  </div>
                );
              })}
              {brands.length > 5 && (
                <button 
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className="w-full text-xs px-2 py-1.5 rounded-md font-medium transition-all duration-200 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                >
                  {showAllBrands ? "See Less" : `See More (${brands.length})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Colors Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold transition-colors duration-300 text-[var(--foreground)]">
            Colors
          </h3>
          <div className="pl-1">
            <div className="flex flex-wrap gap-2">
              {displayedColors.map((color) => (
                <button 
                  key={color.id} 
                  onClick={() => handleColorChange(color.name)} 
                  className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    filters.colors.includes(color.name) 
                      ? "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--card)]" 
                      : "ring-1 ring-[var(--border)]"
                  }`} 
                  style={{ backgroundColor: color.hex_code }} 
                  title={color.name}
                >
                  {filters.colors.includes(color.name) && (
                    <div className="absolute inset-0 rounded-lg bg-black/20 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {colors.length > 6 && (
              <button 
                onClick={() => setShowAllColors(!showAllColors)}
                className="w-full text-xs px-2 py-1.5 rounded-md mt-2 font-medium transition-all duration-200 text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                {showAllColors ? "See Less" : `See More (${colors.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Shipping Categories Section */}
        {shippingCategories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold transition-colors duration-300 text-[var(--foreground)]">
              Shipping Options
            </h3>
            <div className="space-y-2 pl-1">
              {displayedShippingCategories.map((category) => (
                <div 
                  key={category.id} 
                  onClick={() => handleShippingCategoryChange(category.id)} 
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                    (filters.shipping_categories || []).includes(category.id) 
                      ? "bg-[var(--primary)]/10 border-[var(--primary)]"
                      : "hover:bg-[var(--muted)] border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium truncate transition-colors duration-200 text-[var(--foreground)]">
                      {category.name}
                    </h4>
                  </div>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    (filters.shipping_categories || []).includes(category.id) 
                      ? "bg-[var(--primary)] border-[var(--primary)]" 
                      : "border-[var(--border)]"
                  }`}>
                    {(filters.shipping_categories || []).includes(category.id) && <Check size={10} className="text-white" />}
                  </div>
                </div>
              ))}
              {shippingCategories.length > 5 && (
                <button 
                  onClick={() => setShowAllShippingCategories(!showAllShippingCategories)}
                  className="w-full text-xs px-2 py-1.5 rounded-md font-medium transition-all duration-200 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                >
                  {showAllShippingCategories ? "See Less" : `See More (${shippingCategories.length})`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
