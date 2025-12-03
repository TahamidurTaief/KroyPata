// app/layout.js
import { Suspense } from 'react'; // <-- IMPORT SUSPENSE
import { Inter, Lato, Raleway } from "next/font/google";
import { ThemeProvider } from "@/app/Components/ThemeProvider";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { MessageProvider } from "@/context/MessageContext";
import { CartProvider } from "@/app/contexts/CartContext";
import Navbar from "@/app/Components/Navbar";
import AuthModal from "@/app/Components/Auth/AuthModal";
import ErrorBoundary from "@/app/Components/ErrorBoundary";
import SWRProvider from "@/app/Components/SWRProvider";
// import NetworkStatusIndicator from "@/app/Components/NetworkStatusIndicator";
import "./globals.css";
import { ModalProvider } from "@/app/contexts/ModalContext"; 
import Footer from "./Components/Footer";
import FooterSkeleton from './Components/FooterSkeleton'; // <-- IMPORT THE SKELETON
import ClientManifestErrorBoundary from './Components/ErrorBoundaries/ClientManifestErrorBoundary';
import ChunkLoadErrorBoundary from './Components/ErrorBoundaries/ChunkLoadErrorBoundary';
import { ChunkErrorHandler } from './Components/ChunkErrorHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
  preload: true,
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "ICommerce",
  description: "Import products from China to Bangladesh",
  keywords: "ecommerce, online shopping, China import, Bangladesh, products, wholesale",
  
  // Open Graph metadata
  openGraph: {
    title: 'ICommerce - Import Products from China to Bangladesh',
    description: 'Your trusted platform for importing quality products from China to Bangladesh',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com',
    siteName: 'ICommerce',
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'ICommerce - Import Products from China to Bangladesh',
    description: 'Your trusted platform for importing quality products from China to Bangladesh',
    creator: '@icommerce',
    site: '@icommerce',
  },
  
  // Additional metadata
  icons: {
    icon: '/img/favicon.ico',
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

export default function RootLayout({ children }) {
  // Get base URL from environment
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com';
  
  // Organization Schema for site-wide SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ICommerce',
    description: 'Import products from China to Bangladesh',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@icommerce.com',
    },
    sameAs: [
      'https://www.facebook.com/icommerce',
      'https://twitter.com/icommerce',
      'https://www.instagram.com/icommerce',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('icommerce-theme') || 'dark';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${lato.variable} ${raleway.variable} font-sans antialiased`} suppressHydrationWarning>
        <ChunkLoadErrorBoundary>
          <ChunkErrorHandler />
          <ErrorBoundary>
            <AuthProvider>
              <ThemeProvider>
                <MessageProvider>
                  <ModalProvider>
                    <CartProvider>
                      <SWRProvider>
                        <div className="bg-[var(--color-background)] min-h-screen flex flex-col">
                        <Navbar />
                        {/* <NetworkStatusIndicator /> */}
                        <main className="w-full flex-grow">
                        <div className="w-full">{children}</div>
                      </main>
                      
                      {/* Footer - now client component, no need for Suspense */}
                      <Footer />
                      
                      <AuthModal />
                      <ToastContainer />
                    </div>
                  </SWRProvider>
                </CartProvider>
              </ModalProvider>
              </MessageProvider>
            </ThemeProvider>
          </AuthProvider>
          </ErrorBoundary>
        </ChunkLoadErrorBoundary>
      </body>
    </html>
  );
}