"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ShippingInfo from "./ShippingInfo";

// This component displays detailed product information in a tabbed interface.
export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", name: "Description" },
    { id: "specs", name: "Specification" },
    { id: "shipping", name: "Shipping" },
    { id: "seller", name: "Shop Info" },
    { id: "reviews", name: `Reviews (${product.review_count || 0})` },
  ];

  return (
    <div id="product-tabs" className="bg-[var(--color-second-bg)] rounded-xl p-6 lg:p-8 shadow-lg border border-border">
      {/* Tab Buttons */}
      <div className="flex gap-4 lg:gap-8 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`pb-3 px-1 text-lg font-semibold transition-colors duration-200 whitespace-nowrap relative focus:outline-none
              ${activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.name}
            {activeTab === tab.id && (
              <motion.div 
                className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary" 
                layoutId="underline"
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none">
        {activeTab === "description" && (
          <div dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />
        )}
        {activeTab === "specs" && (
          <div>
            {product.specifications?.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={spec.name} className="border-b border-border last:border-b-0">
                      <td className="py-3 pr-4 font-semibold text-foreground">{spec.name}</td>
                      <td className="py-3 text-muted-foreground">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No specifications available.</p>
            )}
          </div>
        )}
        {activeTab === "shipping" && (
          <div>
            {product.shipping_category ? (
              <ShippingInfo shippingCategory={product.shipping_category} />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Shipping Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This product doesn't have specific shipping details configured yet.
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === "seller" && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">{product.shop?.name || 'Shop Information'}</h3>
            <p>{product.shop?.description || "No description available for this shop."}</p>
          </div>
        )}
        {activeTab === "reviews" && (
          <div>
            {product.reviews?.length > 0 ? (
                <div className="space-y-6">
                    {product.reviews.map(review => (
                        <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                            <p className="font-semibold text-foreground">{review.user}</p>
                            <p className="text-sm text-muted-foreground mb-1">{new Date(review.created_at).toLocaleDateString()}</p>
                            <div className="flex text-amber-500 my-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "stroke-current text-gray-300"}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                ))}
                            </div>
                            <p>{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
