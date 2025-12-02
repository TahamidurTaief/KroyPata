const FooterSkeleton = () => {
  return (
    <footer className="bg-[var(--card)] px-8 sm:px-12 pt-16 pb-8 animate-pulse">
      <div className="grid lg:grid-cols-3 gap-x-8 gap-y-12">
        {/* Logo and Social Skeleton */}
        <div className="max-w-sm">
          <div className="h-9 w-36 bg-[var(--muted)] rounded-lg"></div>
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full bg-[var(--muted)] rounded-md"></div>
            <div className="h-4 w-5/6 bg-[var(--muted)] rounded-md"></div>
          </div>
          <div className="mt-6 flex space-x-4">
            <div className="h-8 w-8 bg-[var(--muted)] rounded-full"></div>
            <div className="h-8 w-8 bg-[var(--muted)] rounded-full"></div>
            <div className="h-8 w-8 bg-[var(--muted)] rounded-full"></div>
            <div className="h-8 w-8 bg-[var(--muted)] rounded-full"></div>
          </div>
        </div>

        {/* Links Skeleton */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, colIndex) => (
            <div key={colIndex} className="space-y-4">
              <div className="h-5 w-2/3 bg-[var(--muted)] rounded-md"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, linkIndex) => (
                  <div key={linkIndex} className="h-4 w-5/6 bg-[var(--muted)] rounded-md"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar Skeleton */}
      <div className="mt-16 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2">
            <div className="h-4 w-24 bg-[var(--muted)] rounded-md"></div>
            <div className="h-4 w-24 bg-[var(--muted)] rounded-md"></div>
        </div>
        <div className="h-4 w-48 bg-[var(--muted)] rounded-md"></div>
      </div>
    </footer>
  );
};

export default FooterSkeleton;  