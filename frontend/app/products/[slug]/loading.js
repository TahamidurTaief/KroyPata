// app/products/[slug]/loading.js

export default function Loading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12 bg-[var(--color-background)] min-h-[calc(100vh-126px)]">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Image Gallery Skeleton */}
          <div className="lg:col-span-4">
            <div className="w-full aspect-square bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
            <div className="flex gap-3 justify-center">
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>

          {/* Column 2: Product Info Skeleton */}
          <div className="lg:col-span-4 bg-[var(--color-second-bg)] p-6 rounded-lg shadow-md">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="flex gap-4 mt-6">
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg flex-1"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-24"></div>
            </div>
          </div>

          {/* Column 3: Payment Details Skeleton */}
          <div className="lg:col-span-4">
            <div className="bg-[var(--color-second-bg)] p-6 rounded-lg shadow-md h-96">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full mb-6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-6"></div>
            </div>
          </div>

          {/* Row 2: Tabs Section Skeleton */}
          <div className="lg:col-span-8 bg-[var(--color-second-bg)] p-6 rounded-lg shadow-md mt-6 lg:mt-0">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5 mb-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}