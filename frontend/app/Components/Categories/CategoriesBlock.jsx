"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import CategoryCard from "../Common/CategoryCard";
import AllCategoryComponents from "../Common/AllCategoryComponents";
import ProductCard from "../Common/ProductCard";
import EnhancedSectionRenderer from "../Common/EnhancedSectionRenderer";
import { getCategories, getProducts, getSubCategories } from "@/app/lib/api";

const CategoriesBlock = () => {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const subcategoryFromUrl = searchParams.get('subcategory');
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl); // slug
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]); // for selected category
  const [selectedSubCategory, setSelectedSubCategory] = useState(subcategoryFromUrl);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  const enhanceCategory = useCallback((c) => {
    // Collect real images only
    const images = [];
    if (c?.image_url) images.push(c.image_url);
    if (Array.isArray(c?.subcategories)) {
      for (const sc of c.subcategories) {
        if (sc?.image_url && images.length < 4) images.push(sc.image_url);
      }
    }
    // Pad with nulls so UI can render placeholders (gradients) instead of dummy images
    while (images.length < 4) images.push(null);
    return {
      id: c.id,
      title: c.name,
      slug: c.slug,
      icon: c.image_url || null,
      images: images.slice(0, 4),
      total_products: c.total_products ?? 0,
      sub_categories: c.sub_category_count ?? (c.subcategories?.length || 0),
      raw: c
    };
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setError(null);
      const data = await getCategories();
      if (data?.error) {
        setError(data.error);
        setCategories([]);
        setTopCategories([]);
      } else if (data && Array.isArray(data)) {
        const enhanced = data.map(enhanceCategory);
        setCategories(enhanced);
        // Top categories by product count
        setTopCategories([...enhanced].sort((a,b)=> (b.total_products - a.total_products)).slice(0,6));
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message);
      setCategories([]);
      setTopCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [enhanceCategory]);

  const loadProducts = useCallback(async (categorySlug=null, subcategorySlug=null) => {
    setLoadingProducts(true);
    const filters = {};
    if (categorySlug) filters.category = categorySlug;
    if (subcategorySlug) filters.subcategory = subcategorySlug;
    
    console.log('Loading products with filters:', filters);
    
    const data = await getProducts(filters, 1);
    if (data?.error) {
      setError(data.error);
      setProducts([]);
    } else {
      // If paginated
      const list = data.results || data;
      setProducts(list);
    }
    setLoadingProducts(false);
  }, []);

  const loadSubCategories = useCallback( async (categorySlug) => {
    if(!categorySlug){ setSubCategories([]); return; }
    const list = await getSubCategories();
    // backend subcategory serializer returns full objects; filter client side
    const filtered = list.filter(sc => sc.category === categorySlug || sc.category?.slug === categorySlug || sc.slug?.startsWith(categorySlug+'-'));
    setSubCategories(filtered);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { 
    loadProducts(selectedCategory, selectedSubCategory); 
    loadSubCategories(selectedCategory);
    if (!selectedCategory) {
      setSelectedSubCategory(null);
    }
  }, [selectedCategory, selectedSubCategory, loadProducts, loadSubCategories]);

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(selectedCategory === categorySlug ? null : categorySlug);
  };

  const filteredProducts = products; // Already filtered by category; could further filter by subcategory locally if needed

  // Lightweight skeleton component
  const Skeleton = ({ className="" }) => (
    <div className={`animate-pulse bg-gray-200/60 dark:bg-gray-700/50 rounded-lg ${className}`}></div>
  );

  return (
    <div className="container w-full mx-auto pt-5 md:pt-5 py-10 md:py-20">
      {/* Top Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-2xl lg:text-3xl font-bold mb-6">
          Top <span className="text-sky-500">Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {loadingCategories && Array.from({length:6}).map((_,i)=>(
            <div key={i} className="p-2 bg-[var(--color-surface)] rounded-lg shadow-md">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({length:4}).map((__,j)=>(
                  <Skeleton key={j} className="aspect-square" />
                ))}
              </div>
            </div>
          ))}
          {!loadingCategories && topCategories.map((data) => (
            <CategoryCard
              key={data.id}
              id={data.slug}
              title={data.title}
              images={data.images}
              total_products={data.total_products}
              sub_categories={data.sub_categories}
            />
          ))}
        </div>
      </section>

      {/* All Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-2xl xl:text-3xl font-bold mb-6">
          All <span className="text-sky-500">Categories</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {loadingCategories && Array.from({length:12}).map((_,i)=>(
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
          {!loadingCategories && categories.map((data) => (
            <AllCategoryComponents
              key={data.id}
              id={data.slug}
              icon={data.icon}
              title={data.title}
              isSelected={selectedCategory === data.slug}
              onClick={() => handleCategorySelect(data.slug)}
            />
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section>
        <h2 className="text-2xl md:text-2xl lg:text-3xl font-bold mb-6">
          {selectedCategory ? (
            <>
              Filtered <span className="text-sky-500">Products</span>
              <span className="ml-2 text-sm font-normal bg-sky-100 text-sky-800 px-3 py-1 rounded-full">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-2 text-sky-600 hover:text-sky-800"
                >
                  ×
                </button>
              </span>
            </>
          ) : (
            <>
              Featured <span className="text-sky-500">Products</span>
            </>
          )}
        </h2>
        {selectedCategory && subCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {subCategories.map(sc => (
              <button
                key={sc.id || sc.slug}
                onClick={() => setSelectedSubCategory(selectedSubCategory === sc.slug ? null : sc.slug)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${selectedSubCategory === sc.slug ? 'bg-sky-600 text-white border-sky-600 shadow' : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur border-sky-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-700'} `}
              >
                {sc.name}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          {loadingProducts && Array.from({length:12}).map((_,i)=>(
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
          {!loadingProducts && filteredProducts
            .filter(p => !selectedSubCategory || p.sub_category?.slug === selectedSubCategory)
            .map((product) => (
              <ProductCard key={product.id || product.slug} productData={product} />
            ))}
        </div>
        
        {/* Dynamic Sections for Categories Page */}
        <div className="mt-12">
          <EnhancedSectionRenderer page="categories" />
        </div>
        
        {error && (
          <div className="mt-6 p-4 text-sm rounded-md bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoriesBlock;
