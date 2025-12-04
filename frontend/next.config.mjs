/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Add chunk loading optimization - reverted to original
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize chunk loading for development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
      
      // Add retry logic for chunk loading
      config.output = {
        ...config.output,
        chunkLoadTimeout: 30000, // 30 seconds timeout
        crossOriginLoading: false,
      };
    }
    return config;
  },
  // Add development server optimization
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000, // 1 minute
      pagesBufferLength: 5,
    },
  }),
  images: {
    // Image optimization configuration
    formats: ['image/webp', 'image/avif'], // Modern formats for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for optimized images
    dangerouslyAllowSVG: true, // Allow SVG images
    contentDispositionType: 'attachment', // Security for SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // SVG security
    
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'api.chinakroy.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'api.chinakroy.com',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pagedone.io',
        port: '',
        pathname: '/asset/uploads/**',
      },
    ],
    
    // Loader configuration for additional optimization
    loader: 'default',
    // Quality setting for image optimization (1-100)
    // Lower = smaller files, higher = better quality
    // Default is 75, which is a good balance
    unoptimized: false, // Enable Next.js image optimization
  },
};

export default nextConfig;