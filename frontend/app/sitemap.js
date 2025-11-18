// app/sitemap.js
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com';
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Fetch products with timeout
    const productsController = new AbortController();
    const productsTimeout = setTimeout(() => productsController.abort(), 5000); // 5 second timeout
    
    let productRoutes = [];
    try {
      const productsRes = await fetch(`${apiUrl}/api/products/products/?limit=1000`, {
        next: { revalidate: 3600 }, // Revalidate every hour
        signal: productsController.signal,
      });
      clearTimeout(productsTimeout);
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const products = productsData.results || [];
        
        productRoutes = products.map((product) => ({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
      }
    } catch (productError) {
      clearTimeout(productsTimeout);
      console.warn('Failed to fetch products for sitemap, skipping:', productError.message);
    }

    // Fetch categories with timeout
    const categoriesController = new AbortController();
    const categoriesTimeout = setTimeout(() => categoriesController.abort(), 5000); // 5 second timeout
    
    let categoryRoutes = [];
    try {
      const categoriesRes = await fetch(`${apiUrl}/api/products/categories/`, {
        next: { revalidate: 3600 },
        signal: categoriesController.signal,
      });
      clearTimeout(categoriesTimeout);
      
      if (categoriesRes.ok) {
        const categories = await categoriesRes.json();
        
        categoryRoutes = categories.map((category) => ({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
      }
    } catch (categoryError) {
      clearTimeout(categoriesTimeout);
      console.warn('Failed to fetch categories for sitemap, skipping:', categoryError.message);
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static routes if API fails
    return staticRoutes;
  }
}
