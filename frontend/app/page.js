import HomePage from "@/app/Components/Home/HomePage";
import { getInitialHomeProducts, getCategories, getHorizontalBanners, getOfferBanners } from "@/app/lib/api";

// Enable ISR with revalidation every 60 seconds for better performance
export const revalidate = 60;

// Metadata for SEO
export const metadata = {
  title: 'Special Offers & Deals | ChinaKroy - Your Premier Shopping Destination',
  description: 'Discover amazing deals and exclusive offers on premium products. Save up to 60% on fashion, electronics, and more. Free shipping available.',
  keywords: 'special offers, deals, discounts, coupons, sale, fashion, electronics, free shipping',
  openGraph: {
    title: 'Special Offers & Deals | ChinaKroy',
    description: 'Discover amazing deals and exclusive offers on premium products. Save up to 60% on fashion, electronics, and more.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Special Offers & Deals | ChinaKroy',
    description: 'Discover amazing deals and exclusive offers on premium products. Save up to 60% on fashion, electronics, and more.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  // Fetch all data in parallel for better performance
  try {
    const [
      initialProductsData,
      categoriesData,
      horizontalBannersData,
      offerBannersData
    ] = await Promise.allSettled([
      getInitialHomeProducts(),
      getCategories(),
      getHorizontalBanners(),
      getOfferBanners()
    ]);

    // Extract the 'results' array or default to an empty array
    const initialProducts = initialProductsData.status === 'fulfilled' 
      ? (initialProductsData.value?.results || [])
      : [];
    
    // getCategories now returns an array directly
    const categories = categoriesData.status === 'fulfilled' 
      ? (Array.isArray(categoriesData.value) ? categoriesData.value : [])
      : [];
    
    // Extract horizontal banners or default to empty array
    const horizontalBanners = horizontalBannersData.status === 'fulfilled' 
      ? (horizontalBannersData.value?.results || horizontalBannersData.value || [])
      : [];
    
    // Extract offer banners or default to empty array
    const offerBanners = offerBannersData.status === 'fulfilled' 
      ? (offerBannersData.value?.results || offerBannersData.value || [])
      : [];

    // Log any failed requests for debugging
    [initialProductsData, categoriesData, horizontalBannersData, offerBannersData].forEach((result, index) => {
      if (result.status === 'rejected') {
        const names = ['initialProducts', 'categories', 'horizontalBanners', 'offerBanners'];
        console.warn(`Failed to load ${names[index]}:`, result.reason);
      }
    });

    return (
      <div>
        <HomePage 
          initialProducts={initialProducts} 
          categories={categories} 
          horizontalBanners={horizontalBanners}
          offerBanners={offerBanners}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading home page data:', error);
    
    // Return with empty data as fallback
    return (
      <div>
        <HomePage 
          initialProducts={[]} 
          categories={[]} 
          horizontalBanners={[]}
          offerBanners={[]}
        />
      </div>
    );
  }
}
