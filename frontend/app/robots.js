// app/robots.js
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/orders/',
          '/cart/',
          '/checkout/',
          '/confirmation/',
          '/shipping/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/orders/',
          '/cart/',
          '/checkout/',
          '/confirmation/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
