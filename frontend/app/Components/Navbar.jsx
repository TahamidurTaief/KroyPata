import { Suspense } from "react";
import NavbarClient from "./NavbarClient";
import NavbarSkeleton from "./NavbarSkeleton";
import { getCategories, getOfferCategories } from "@/app/lib/api";

// Async function to fetch categories
async function fetchCategories() {
  try {
    const cats = await getCategories();
    return Array.isArray(cats) ? cats : (cats?.results || []);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return [];
  }
}

// Async function to fetch offer categories
async function fetchOfferCategories() {
  try {
    const offers = await getOfferCategories();
    return Array.isArray(offers) ? offers : (offers?.results || []);
  } catch (error) {
    console.error("Offer categories fetch error:", error);
    return [];
  }
}

// Server Component: Optimized with streaming
export default async function Navbar() {
  // Start fetching immediately but don't await yet
  const categoriesPromise = fetchCategories();
  const offerCategoriesPromise = fetchOfferCategories();

  return (
    <div className="w-full">
      {/* Show skeleton only for the parts that need data */}
      <Suspense fallback={<NavbarSkeleton />}>
        <NavbarWithData 
          categoriesPromise={categoriesPromise}
          offerCategoriesPromise={offerCategoriesPromise}
        />
      </Suspense>
    </div>
  );
}

// Separate component that awaits the data
async function NavbarWithData({ categoriesPromise, offerCategoriesPromise }) {
  // Await in parallel for best performance
  const [categories, offerCategories] = await Promise.all([
    categoriesPromise,
    offerCategoriesPromise
  ]);

  return (
    <NavbarClient 
      initialCategories={categories} 
      initialOfferCategories={offerCategories} 
    />
  );
}