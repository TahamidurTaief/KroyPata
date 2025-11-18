// SkeletonCard.jsx
const SkeletonCard = () => {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="bg-slate-200 dark:bg-slate-700 h-48 rounded-lg mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
      </div>
    </div>
  );
};

export default SkeletonCard;
