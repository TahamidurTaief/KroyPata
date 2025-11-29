/*
================================================================================
| FILE: app/Components/NavbarSkeleton.jsx (Optimized for faster rendering)
================================================================================
*/
export default function NavbarSkeleton() {
    return (
      <div className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        {/* Desktop Skeleton */}
        <div className="hidden lg:block container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6 mb-4">
            {/* Logo */}
            <div className="w-32 h-10 bg-[var(--color-muted-bg)] rounded animate-pulse" />
            
            {/* Search Bar Skeleton - Simplified */}
            <div className="flex-1 max-w-3xl">
              <div className="h-11 bg-[var(--color-muted-bg)] border border-[var(--color-border)] rounded-full" />
            </div>
            
            {/* Icons - Simplified */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-8 bg-[var(--color-muted-bg)] rounded" />
              <div className="w-16 h-8 bg-[var(--color-muted-bg)] rounded" />
              <div className="w-20 h-8 bg-[var(--color-muted-bg)] rounded" />
            </div>
          </div>
          
          {/* Bottom Row - Only show placeholder for dynamic content */}
          <div className="h-12 border-t border-[var(--color-border)] flex items-center gap-6 pt-2">
             <div className="w-36 h-8 bg-[var(--color-muted-bg)] rounded-full animate-pulse" />
             <div className="flex-1 flex gap-4">
               <div className="w-20 h-4 bg-[var(--color-muted-bg)] rounded animate-pulse" />
               <div className="w-20 h-4 bg-[var(--color-muted-bg)] rounded animate-pulse" />
               <div className="w-20 h-4 bg-[var(--color-muted-bg)] rounded animate-pulse" />
             </div>
          </div>
        </div>
  
        {/* Mobile Skeleton */}
        <div className="lg:hidden px-4 py-3 flex items-center justify-between gap-4">
           <div className="w-8 h-8 bg-[var(--color-muted-bg)] rounded" />
           <div className="flex-1 h-10 bg-[var(--color-muted-bg)] border border-[var(--color-border)] rounded-full" />
           <div className="w-8 h-8 bg-[var(--color-muted-bg)] rounded" />
        </div>
      </div>
    );
  }