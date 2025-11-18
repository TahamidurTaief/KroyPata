import React, { Suspense } from "react";
import OrderPageSkeleton from "../Components/Orders/OrderPageSkeleton";
import OrderListDisplay from "../Components/Orders/OrderListDisplay";
import ProtectedRoute from "../Components/Auth/ProtectedRoute";

// Metadata for the page
export const metadata = {
  title: 'My Orders - ICommerce | Track Your Orders',
  description: 'View and track your orders. Check order status, delivery information, and order history on ICommerce.',
  keywords: 'my orders, order tracking, order history, purchase history, delivery status',
  
  // Open Graph metadata
  openGraph: {
    title: 'My Orders - ICommerce',
    description: 'View and track your orders on ICommerce',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com'}/orders`,
    siteName: 'ICommerce',
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary',
    title: 'My Orders - ICommerce',
    description: 'View and track your orders on ICommerce',
    creator: '@icommerce',
    site: '@icommerce',
  },
  
  // Canonical URL
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://icommerce.com'}/orders`,
  },
  
  // Robots - protected page, don't index
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
}

// Client-side data fetching will be handled in OrderListDisplay
export default function OrdersPage() {
	return (
		<ProtectedRoute pageName="your orders">
			<div className="min-h-screen bg-[var(--color-background)]">
				<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className="text-2xl font-bold text-text-primary mb-2">My Orders</h1>
						<p className="text-text-secondary">Track your current and previous orders</p>
					</div>
					<Suspense fallback={<OrderPageSkeleton />}>
						<OrderListDisplay />
					</Suspense>
				</div>
			</div>
		</ProtectedRoute>
	);
}
