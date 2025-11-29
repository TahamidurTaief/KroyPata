import Head from 'next/head';

/**
 * SEO Component for Navbar and E-commerce pages
 * Optimizes metadata for better search engine visibility
 */
export default function NavbarSEO({ 
  title = "iCommerce - Best Online Shopping in Bangladesh",
  description = "Shop the latest products at the best prices. Wide selection of electronics, clothing, home goods, and more. Wholesale prices available for bulk buyers.",
  keywords = "online shopping bangladesh, ecommerce bd, wholesale products, best deals, electronics, clothing, home goods",
  ogImage = "/img/og-image.jpg",
  canonicalUrl
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com';
  const fullCanonicalUrl = canonicalUrl || siteUrl;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="iCommerce" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="iCommerce" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "iCommerce",
            "url": siteUrl,
            "logo": `${siteUrl}/img/logo.png`,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+880-XXX-XXXXXX",
              "contactType": "Customer Service",
              "areaServed": "BD",
              "availableLanguage": ["en", "bn"]
            },
            "sameAs": [
              "https://www.facebook.com/icommerce",
              "https://twitter.com/icommerce",
              "https://www.instagram.com/icommerce"
            ]
          })
        }}
      />
      
      {/* Structured Data - WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "iCommerce",
            "url": siteUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/products?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </Head>
  );
}

/**
 * Generate SEO metadata for product pages
 */
export function generateProductSEO(product) {
  if (!product) return null;

  const price = product.discount_price || product.price;
  const availability = product.stock > 0 ? "InStock" : "OutOfStock";

  return {
    title: `${product.name} | iCommerce`,
    description: product.short_description || product.description?.replace(/<[^>]*>/g, '').substring(0, 160),
    keywords: `${product.name}, ${product.category?.name || ''}, ${product.brand_name || ''}, buy online bangladesh`,
    ogImage: product.thumbnail_url || product.image_url,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.thumbnail_url || product.image_url,
      "description": product.short_description || product.description?.replace(/<[^>]*>/g, ''),
      "sku": product.sku || product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand_name || "iCommerce"
      },
      "offers": {
        "@type": "Offer",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
        "priceCurrency": "BDT",
        "price": price,
        "availability": `https://schema.org/${availability}`,
        "seller": {
          "@type": "Organization",
          "name": "iCommerce"
        }
      },
      "aggregateRating": product.average_rating ? {
        "@type": "AggregateRating",
        "ratingValue": product.average_rating,
        "reviewCount": product.review_count || 1
      } : undefined
    }
  };
}
