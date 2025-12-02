import { notFound } from "next/navigation";
import ProductDetailPageClient from "@/app/Components/Product/ProductDetailPageClient";
import { Suspense } from "react";
import Loading from "./loading";

// Revalidate product pages every 60s (ISR-like behavior in App Router)
export const revalidate = 60;

// Generate no static params; handle dynamically at request time (blocking-like)
export async function generateStaticParams() {
  return [];
}

// Helper to fetch a single product with proper base URL and revalidate
async function fetchProductBySlug(slug) {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const url = `${base}/api/products/products/${slug}/`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`Failed to fetch product ${slug}:`, res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Network/API error fetching product:', err);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com';
  const plainDescription = product.description ? product.description.replace(/<[^>]*>?/gm, '') : '';
  const description = plainDescription.substring(0, 160) || `Buy ${product.name} at the best price on ICommerce`;
  const productImage = product.images?.[0] || product.image_url || product.image || '';
  const productUrl = `${baseUrl}/products/${slug}`;
  
  return {
    title: `${product.name} | ICommerce`,
    description: description,
    keywords: `${product.name}, ${product.sub_category?.name || ''}, ${product.sub_category?.category?.name || ''}, buy online, ecommerce`,
    
    // Open Graph metadata
    openGraph: {
      title: `${product.name} | ICommerce`,
      description: description,
      url: productUrl,
      siteName: 'ICommerce',
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    
    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ICommerce`,
      description: description,
      images: [productImage],
      creator: '@icommerce',
      site: '@icommerce',
    },
    
    // Canonical URL
    alternates: {
      canonical: productUrl,
    },
    
    // Additional SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Main page component
export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product || !product.id) {
    notFound();
  }

  // Get base URL from environment
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com';
  
  // Prepare structured data (JSON-LD)
  const plainDescription = product.description ? product.description.replace(/<[^>]*>?/gm, '') : '';
  const productImage = product.images?.[0] || product.image_url || product.image || '';
  
  // Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: plainDescription.substring(0, 500),
    image: productImage,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'ICommerce',
    },
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/products/${slug}`,
        priceCurrency: 'BDT',
        price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      },
    }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.sub_category?.category?.name || 'Products',
        item: `${baseUrl}/categories`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.sub_category?.name || product.name,
        item: `${baseUrl}/categories/${product.sub_category?.slug || ''}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${baseUrl}/products/${slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <div className="product-detail-page container mx-auto px-4 py-8 md:py-12 bg-[var(--background)] text-[var(--foreground)] min-h-[calc(100vh-126px)] overflow-auto">
        <Suspense fallback={<Loading />}>
          <ProductDetailPageClient product={product} />
        </Suspense>
      </div>
    </>
  );
}
