// app/cart/loading.jsx

const CartSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-pulse">
        {/* Left Column: Order Summary Skeleton */}
        <div className="lg:col-span-2 bg-background rounded-xl border border-border shadow-sm w-full">
          <div className="p-4 border-b border-border">
            <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-24 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Shopping Cart Skeleton */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-background rounded-xl border border-border shadow-sm p-6 space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="border-t border-border !my-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-7 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-7 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>

            <div className="border-t border-border"></div>

            <div>
              <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="flex gap-2">
                <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>

            <div className="h-12 w-full bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
