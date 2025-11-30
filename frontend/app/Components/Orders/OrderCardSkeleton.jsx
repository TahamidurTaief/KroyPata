import React from 'react';

const OrderCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg h-10 w-10"></div>
            <div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
          <div className="flex justify-around text-center">
            <div>
              <div className="h-3 w-10 bg-gray-200 dark:bg-gray-600 rounded mx-auto"></div>
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-600 rounded mx-auto mt-1"></div>
            </div>
            <div>
              <div className="h-3 w-10 bg-gray-200 dark:bg-gray-600 rounded mx-auto"></div>
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-600 rounded mx-auto mt-1"></div>
            </div>
            <div>
              <div className="h-3 w-10 bg-gray-200 dark:bg-gray-600 rounded mx-auto"></div>
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-600 rounded mx-auto mt-1"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
