import { Suspense } from "react";
import NavbarClient from "./NavbarClient";
import NavbarSkeleton from "./NavbarSkeleton";
import { getCategories, getOfferCategories } from "@/app/lib/api";

// Server Component: Fetches data on the server for SEO and Speed
export default async function Navbar() {
  // Initialize with empty arrays safely
  let categories = [];
  let offerCategories = [];

  try {
    // Fetch data in parallel
    const categoriesData = getCategories();
    const offersData = getOfferCategories();
    
    const [cats, offers] = await Promise.all([categoriesData, offersData]);
    
    // Normalize data structure (handle Django REST framework results or plain arrays)
    categories = Array.isArray(cats) ? cats : (cats?.results || []);
    offerCategories = Array.isArray(offers) ? offers : (offers?.results || []);
  } catch (error) {
    console.error("Navbar Data Fetch Error:", error);
    // Fail silently to UI - allowing the navbar to render empty rather than crashing
  }

  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarClient 
        initialCategories={categories} 
        initialOfferCategories={offerCategories} 
      />
    </Suspense>
  );
}