"use client";
import React from "react";
import FilterSection from "./FilterSection";
import ProductGrid from "./ProductGrid";

const ProductPage = ({ products, categories }) => {
  return (
    <div className="py-10 md:py-16">
      <FilterSection categories={categories} />
      <ProductGrid products={products} />
    </div>
  );
};

export default ProductPage;