import ProductCard from "@/app/Components/Common/ProductCard";
import SkeletonCard from "@/app/Components/Common/SkeletonCard";
import React from "react";

const FilteredProduct = ({ productData, isLoading }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {isLoading ? (
            // Display 12 skeleton cards while loading
            Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : productData && productData.length > 0 ? (
            productData.map((product) => (
              <ProductCard key={product.id} productData={product} />
            ))
          ) : (
            // Show a message if no products are found after loading
            <div className="col-span-full text-center py-10">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">No Products Found</h3>
              <p className="text-[var(--muted-foreground)]">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilteredProduct;
