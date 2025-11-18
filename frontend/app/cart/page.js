// app/cart/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import CartView from "../Components/Cart/CartView";
import CartViewAlpine from "../Components/Cart/CartViewAlpine";
import SectionRenderer from "../Components/Common/SectionRenderer";
import ClientManifestErrorBoundary from '../Components/ErrorBoundaries/ClientManifestErrorBoundary';

/**
 * This is the main page for the shopping cart.
 * Users can access the cart without login - authentication is only required for checkout.
 * Features advanced shipping logic with dynamic UI updates.
 * 
 * The cart now supports:
 * - Advanced shipping analysis based on product categories
 * - Free shipping rule detection and application
 * - Split shipping warnings when products require different methods
 * - Dynamic shipping cost calculation based on quantity
 * - Real-time shipping recommendations
 * 
 * You can switch between React (default) and Alpine.js versions using the
 * NEXT_PUBLIC_USE_ALPINE_CART environment variable.
 */
const CartPage = () => {
  // Use Alpine.js version if environment variable is set
  const useAlpineCart = process.env.NEXT_PUBLIC_USE_ALPINE_CART === 'true';
  const CartComponent = useAlpineCart ? CartViewAlpine : CartView;

  const [chunkError, setChunkError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Handler for chunk loading failures
    const handleError = (e) => {
      const message = e?.message || e?.error?.message || "";
      if (message.includes("Loading chunk") || message.includes("ChunkLoadError")) {
        // Prevent infinite loop – retry max 2 times
        setChunkError(message);
      }
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", (e) => {
      const msg = e?.reason?.message || "";
      if (msg.includes("Loading chunk") || msg.includes("ChunkLoadError")) {
        setChunkError(msg);
      }
    });
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (chunkError && retryCount < 2) {
      const timeout = setTimeout(() => {
        setRetryCount((c) => c + 1);
        // Force a hard reload with a cache-busting query param
        const url = new URL(window.location.href);
        url.searchParams.set("_r", Date.now().toString());
        window.location.replace(url.toString());
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [chunkError, retryCount]);

  if (chunkError && retryCount >= 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold mb-3">Problem loading the cart assets</h1>
        <p className="text-sm opacity-80 mb-4 max-w-md">
          We tried reloading the required bundle but it still failed. This can happen if the dev server port changed
          or an old cached tab is open. Make sure you're using the active Next.js dev server port (often 3001 if 3000 was busy),
          then manually refresh this page.
        </p>
        <button
          onClick={() => {
            setChunkError(null);
            setRetryCount(0);
            window.location.reload();
          }}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
        >
          Retry Now
        </button>
      </div>
    );
  }

  return (
    <ClientManifestErrorBoundary>
      <div className="pb-20 md:pb-5">
        <CartComponent />
        {/* Dynamic Sections for Cart Page */}
        <div className="container mx-auto px-4 py-8">
          <SectionRenderer page="cart" />
        </div>
      </div>
    </ClientManifestErrorBoundary>
  );
};

export default CartPage;
