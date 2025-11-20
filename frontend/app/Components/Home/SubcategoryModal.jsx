"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const SubcategoryModal = ({ category, position, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!category || !category.subcategories || category.subcategories.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed z-50 bg-[var(--color-second-bg)] rounded-lg shadow-2xl border border-[var(--color-border)] max-w-md w-full animate-slide-up"
        style={{
          left: `${Math.min(position.x, window.innerWidth - 400)}px`,
          top: `${position.y + 8}px`,
          maxHeight: "400px",
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div>
            <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
              {category.name}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {category.subcategories.length} subcategories available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Subcategories Grid */}
        <div className="p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: "320px" }}>
          <div className="grid grid-cols-2 gap-3">
            {category.subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categories/${category.slug}/${subcategory.slug}`}
                className="group block"
                onClick={onClose}
              >
                <div className="bg-[var(--color-background)] rounded-lg p-3 border border-[var(--color-border)] hover:border-[var(--color-button-primary)] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  {/* Subcategory Image */}
                  {subcategory.image && (
                    <div className="relative w-full h-20 mb-2 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={subcategory.image}
                        alt={subcategory.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Subcategory Name */}
                  <h4 className="font-medium text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-button-primary)] transition-colors line-clamp-2 text-center">
                    {subcategory.name}
                  </h4>

                  {/* Product Count if available */}
                  {subcategory.product_count !== undefined && (
                    <p className="text-xs text-[var(--color-text-secondary)] text-center mt-1">
                      {subcategory.product_count} products
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer with View All Link */}
        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <Link
            href={`/categories/${category.slug}`}
            className="block text-center py-2 px-4 bg-[var(--color-button-primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
            onClick={onClose}
          >
            View All in {category.name}
          </Link>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default SubcategoryModal;
