import SkeletonCard from '../Components/Common/SkeletonCard';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Skeleton for filter section */}
        <div className="h-20 bg-white dark:bg-gray-800 rounded-lg mb-8 animate-pulse" />
        
        {/* Skeleton grid for products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(12).fill(null).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}