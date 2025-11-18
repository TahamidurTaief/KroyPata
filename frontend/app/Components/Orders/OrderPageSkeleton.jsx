import React from "react";

export default function OrderPageSkeleton() {
	// Skeleton card for order
	function SkeletonCard() {
		return (
			<div className="bg-second-bg rounded-lg p-4 border border-border flex flex-col gap-3 shadow-sm animate-pulse min-h-[120px]">
				{/* Order Number */}
				<div className="h-4 w-28 bg-muted-bg rounded mb-2" />
				{/* Date */}
				<div className="h-3 w-20 bg-muted-bg rounded mb-1" />
				{/* Status Badge */}
				<div className="h-5 w-16 bg-muted-bg rounded-full mb-2" />
				{/* Button */}
				<div className="h-8 w-28 bg-muted-bg rounded" />
			</div>
		);
	}

	// Section skeleton with heading and 3 cards
	function SectionSkeleton({ heading }) {
		return (
			<div>
				<div className="h-7 w-44 bg-muted-bg rounded mb-4 animate-pulse" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-text-primary py-8 px-2">
			<div className="max-w-5xl mx-auto flex flex-col gap-12">
				<SectionSkeleton heading="Current Orders" />
				<SectionSkeleton heading="Previous Orders" />
			</div>
		</div>
	);
}
