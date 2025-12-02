// SkeletonCard.jsx
const SkeletonCard = () => {
  return (
    <div className="animate-pulse bg-[var(--card)] rounded-lg shadow-md p-4">
      <div className="bg-[var(--color-border)] h-48 rounded-lg mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-[var(--color-border)] rounded w-3/4" />
        <div className="h-4 bg-[var(--color-border)] rounded w-1/2" />
        <div className="h-4 bg-[var(--color-border)] rounded w-1/4" />
      </div>
    </div>
  );
};

export default SkeletonCard;
