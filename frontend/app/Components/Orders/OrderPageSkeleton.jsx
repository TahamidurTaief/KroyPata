import React from "react";
import OrderCardSkeleton from "./OrderCardSkeleton";

const OrderPageSkeleton = () => {
	return (
		<div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
			<div className="max-w-7xl mx-auto">
				{/* Page Title Skeleton */}
				<div className="mb-8">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
				</div>

				{/* Order Cards Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<OrderCardSkeleton key={item} />
					))}
				</div>
			</div>
		</div>
	);
};

export default OrderPageSkeleton;
