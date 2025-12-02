// frontend/app/products/Components/FilteredProductGrid.jsx
import ProductCard from "@/app/Components/Common/ProductCard";

export default function FilteredProductGrid({ productData }) {
  if (!productData || productData.length === 0) {
    return (
      <div className="text-center py-20 bg-[var(--muted)] rounded-lg h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          No Products Found
        </h2>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-sm">
          Your search returned no results. Please try adjusting your filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {productData.map((product) => (
        <ProductCard key={product.id} productData={product} />
      ))}
    </div>
  );
}
