export const metadata = {
  title: 'Products | iCommerce - Shop Our Collection',
  description: 'Browse our extensive collection of products. Find the best deals, latest arrivals, and top-rated items. Filter by category, brand, price, and more.',
  keywords: 'products, shop, online shopping, ecommerce, deals, categories, brands',
  openGraph: {
    title: 'Products | iCommerce',
    description: 'Browse our extensive collection of products with advanced filtering options',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | iCommerce',
    description: 'Browse our extensive collection of products with advanced filtering options',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function ProductsLayout({ children }) {
  return children;
}
