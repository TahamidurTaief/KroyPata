// frontend/app/Components/Common/Pagination.jsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A reusable pagination component with smart page number display.
 * @param {number} currentPage - The current active page.
 * @param {number} totalPages - The total number of pages available.
 * @param {function} onPageChange - Callback function invoked with the new page number.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render pagination if there's only one page or less.
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generates the list of page numbers to display, including ellipsis for large ranges.
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all page numbers.
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // For more than 5 pages, show a condensed view.
      pages.push(1); // Always show the first page.
      if (currentPage > 3) {
        pages.push("...");
      }
      if (currentPage > 2) {
        pages.push(currentPage - 1);
      }
      if (currentPage !== 1 && currentPage !== totalPages) {
        pages.push(currentPage);
      }
      if (currentPage < totalPages - 1) {
        pages.push(currentPage + 1);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages); // Always show the last page.
    }
    // Use Set to remove duplicates that can occur at edge cases (e.g., page 2).
    return [...new Set(pages)];
  };

  return (
    <nav className="flex items-center justify-center gap-4 mt-12" aria-label="Pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--card)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <div className="flex items-center gap-2">
        {getPageNumbers().map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
                  : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--color-border)] hover:bg-[var(--muted)]"
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="w-10 h-10 flex items-center justify-center text-sm text-[var(--muted-foreground)]">
              {page}
            </span>
          )
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--card)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
