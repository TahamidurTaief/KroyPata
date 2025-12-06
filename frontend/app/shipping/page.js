"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { 
  FiPackage, FiTruck, FiClock, FiDollarSign, FiInfo, 
  FiMaximize2, FiAlertCircle, FiCheckCircle, FiLayers
} from "react-icons/fi";
import Tk_icon from "../Components/Common/Tk_icon";

export default function ShippingPage() {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const methodRefs = useRef({});

  useEffect(() => {
    fetchShippingMethods();
  }, [retryCount]);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      
      // Use API URL from .env.local
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.chinakroy.com';
      const response = await fetch(`${apiBaseUrl}/api/orders/shipping-methods/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch shipping methods: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched shipping methods:', data);
      
      // Handle both paginated and non-paginated responses
      const methodsArray = Array.isArray(data) ? data : (data.results || []);
      
      if (!Array.isArray(methodsArray)) {
        throw new Error('Invalid response format: expected an array of shipping methods');
      }
      
      setShippingMethods(methodsArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipping methods:', err);
      setError(err.message || 'Failed to load shipping methods. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  const scrollToMethod = (methodId) => {
    const element = methodRefs.current[methodId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedMethod(shippingMethods.find(m => m.id === methodId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Error Loading Shipping Methods</h3>
                <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <strong>Troubleshooting:</strong>
                  </p>
                  <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                    <li>Make sure the Django backend server is running</li>
                    <li>Check if the API endpoint is accessible: <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">/api/orders/shipping-methods/</code></li>
                    <li>Verify CORS settings in Django backend</li>
                    <li>Check browser console for detailed error messages</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setError(null);
                    setRetryCount(prev => prev + 1);
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      {/* SEO Meta Tags */}
      <Head>
        <title>Shipping Methods & Pricing | ChinaKroy Bangladesh</title>
        <meta name="description" content="View all available shipping methods, pricing tiers, and delivery information. Choose from multiple shipping options including door-to-door delivery, pick-up points, and international shipping from China to Bangladesh." />
        <meta name="keywords" content="shipping methods, delivery options, shipping rates, Bangladesh shipping, door to door delivery, pick up point, China to Bangladesh shipping, shipping costs, ecommerce shipping" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Shipping Methods & Pricing | ChinaKroy" />
        <meta property="og:description" content="Explore our comprehensive shipping options with transparent pricing and flexible delivery choices." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://chinakroy.com/shipping" />
      </Head>

      {/* Structured Data for SEO */}
      {Array.isArray(shippingMethods) && shippingMethods.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Shipping Methods & Pricing",
              "description": "View all available shipping methods, pricing tiers, and delivery information",
              "provider": {
                "@type": "Organization",
                "name": "ChinaKroy",
              },
              "about": {
                "@type": "Service",
                "serviceType": "Shipping and Delivery",
                "offers": shippingMethods.map(method => ({
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": method.name,
                    "description": method.description || `${method.name} shipping service`,
                  },
                  "price": method.price,
                  "priceCurrency": "BDT",
                  "availability": "https://schema.org/InStock",
                })),
              },
            }),
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiPackage className="text-blue-600 dark:text-blue-400" size={40} aria-hidden="true" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Shipping Methods & Pricing
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            View all available shipping methods, pricing tiers, and delivery information. 
            All data is fetched dynamically from our backend system.
          </p>
        </header>

        {/* Available Shipping Methods Filter */}
        {Array.isArray(shippingMethods) && shippingMethods.length > 0 && (
          <section className="mb-12" aria-label="Available Shipping Methods">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiTruck className="text-blue-600 dark:text-blue-400" size={24} />
                Available Shipping Methods
              </h2>
              <div className="flex flex-wrap gap-3">
                {shippingMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => scrollToMethod(method.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedMethod?.id === method.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiTruck size={16} />
                      <span>{method.name}</span>
                      <span className="flex items-center gap-1 text-sm">
                        (<Tk_icon size={14} /> {formatPrice(method.price)})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Statistics */}
        {Array.isArray(shippingMethods) && shippingMethods.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" aria-label="Shipping Statistics">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg" aria-hidden="true">
                  <FiTruck className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Methods</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{shippingMethods.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg" aria-hidden="true">
                  <FiDollarSign className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Starting From</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <Tk_icon size={24} />
                    {formatPrice(Math.min(...shippingMethods.map(m => parseFloat(m.price || 0))))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg" aria-hidden="true">
                  <FiLayers className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pricing Tiers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {shippingMethods.reduce((sum, m) => sum + (m.shipping_tiers?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Shipping Methods Grid */}
        <main className="space-y-8" role="main">
          {Array.isArray(shippingMethods) && shippingMethods.map((method) => (
            <article 
              key={method.id}
              ref={(el) => (methodRefs.current[method.id] = el)}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all ${
                selectedMethod?.id === method.id 
                  ? 'border-blue-500 dark:border-blue-400 shadow-blue-100 dark:shadow-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              itemScope
              itemType="https://schema.org/Offer"
            >
              {/* Method Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setSelectedMethod(selectedMethod?.id === method.id ? null : method)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg" aria-hidden="true">
                      <FiTruck className="text-blue-600 dark:text-blue-400" size={28} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white" itemProp="name">
                          {method.name || method.title}
                        </h2>
                        {selectedMethod?.id === method.id && (
                          <FiCheckCircle className="text-blue-600 dark:text-blue-400" size={24} aria-label="Selected" />
                        )}
                      </div>
                      
                      {method.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3" itemProp="description">
                          {method.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Tk_icon size={16} className="text-green-600 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Base Price: <strong className="text-green-600 dark:text-green-400 flex items-center gap-1"><Tk_icon size={14} />{formatPrice(method.price)}</strong>
                          </span>
                        </div>

                        {method.delivery_estimated_time && (
                          <div className="flex items-center gap-2">
                            <FiClock className="text-orange-600 dark:text-orange-400" size={16} aria-hidden="true" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Delivery: <strong>{method.delivery_estimated_time}</strong>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <FiInfo className="text-blue-600 dark:text-blue-400" size={16} aria-hidden="true" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Pricing: <strong className="capitalize">{method.preferred_pricing_type}-based</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-end gap-2" itemProp="price" content={method.price}>
                      <Tk_icon size={32} />
                      {formatPrice(method.price)}
                    </div>
                    <meta itemProp="priceCurrency" content="BDT" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      starting price
                    </div>
                  </div>
                </div>
              </div>

              {/* Constraints Section */}
              {(method.max_quantity || method.max_weight) && (
                <div className="px-6 py-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiMaximize2 className="text-yellow-600 dark:text-yellow-400" size={18} aria-hidden="true" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Constraints</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {method.max_quantity && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Maximum Quantity:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{method.max_quantity} items</span>
                      </div>
                    )}
                    {method.max_weight && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Maximum Weight:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{method.max_weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Allowed Categories Section */}
              <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/10 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FiPackage className="text-indigo-600 dark:text-indigo-400" size={18} aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Allowed Product Categories
                  </h3>
                </div>
                
                {method.shipping_categories && method.shipping_categories.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {method.shipping_categories.map((category, index) => (
                        <span 
                          key={category.id || index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                          title={category.description || category.name}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      This shipping method is available for products in these {method.shipping_categories.length} categories
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                    <p className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      Available for all product categories
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing Tiers Section */}
              {method.shipping_tiers && method.shipping_tiers.length > 0 && (
                <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiLayers className="text-purple-600 dark:text-purple-400" size={18} aria-hidden="true" />
                    Pricing Tiers ({method.shipping_tiers.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {method.shipping_tiers.map((tier, index) => (
                      <div 
                        key={tier.id || index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">
                            {tier.pricing_type} Tier
                          </span>
                          {tier.priority > 0 && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                              Priority: {tier.priority}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          {/* Range */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Range:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {tier.applicable_range}
                            </span>
                          </div>

                          {/* Base Price */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                            <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Tk_icon size={14} />
                              {formatPrice(tier.base_price)}
                            </span>
                          </div>

                          {/* Incremental Pricing */}
                          {tier.has_incremental_pricing && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Per Unit:</span>
                                <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                  +<Tk_icon size={14} />
                                  {formatPrice(tier.increment_per_unit)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Unit Size:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {tier.increment_unit_size} {tier.pricing_type === 'weight' ? 'kg' : 'items'}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Explanation */}
                          {tier.pricing_explanation && (
                            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {tier.pricing_explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </main>

        {/* No Methods Message */}
        {Array.isArray(shippingMethods) && shippingMethods.length === 0 && !loading && (
          <div className="text-center py-12" role="status">
            <FiPackage className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Shipping Methods Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              There are currently no shipping methods configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
