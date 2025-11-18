"use client";
import React from 'react';

// Base skeleton animation component
export const SkeletonBox = ({ 
  className = "", 
  variant = "default",
  animation = "wave",
  width,
  height,
  rounded = "rounded",
  ...props 
}) => {
  const variantClasses = {
    default: "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
    light: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
    card: "bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-750 dark:to-gray-800"
  };

  const animationClasses = {
    wave: "animate-skeleton-wave",
    pulse: "animate-skeleton-pulse", 
    glow: "animate-skeleton-glow",
    float: "animate-skeleton-float",
    breathe: "animate-skeleton-breathe"
  };

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div 
      className={`skeleton-item ${animationClasses[animation]} ${rounded} ${className}`}
      style={style}
      {...props}
    />
  );
};

// Text skeleton with realistic proportions
export const SkeletonText = ({ 
  lines = 1, 
  className = "",
  variant = "default",
  animation = "wave"
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <SkeletonBox 
        key={i}
        className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`}
        variant={variant}
        animation={animation}
      />
    ))}
  </div>
);

// Avatar/Image skeleton
export const SkeletonAvatar = ({ 
  size = "md", 
  className = "",
  variant = "default",
  animation = "wave"
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  return (
    <SkeletonBox 
      className={`${sizeClasses[size]} rounded-full ${className}`}
      variant={variant}
      animation={animation}
    />
  );
};

// Button skeleton
export const SkeletonButton = ({ 
  size = "md", 
  className = "",
  variant = "default",
  animation = "wave",
  fullWidth = false
}) => {
  const sizeClasses = {
    sm: "h-8 px-4",
    md: "h-10 px-6", 
    lg: "h-12 px-8",
    xl: "h-14 px-10"
  };

  return (
    <SkeletonBox 
      className={`${sizeClasses[size]} ${fullWidth ? 'w-full' : 'w-24'} rounded-lg ${className}`}
      variant={variant}
      animation={animation}
    />
  );
};

// Card skeleton layout
export const SkeletonCard = ({ 
  className = "",
  variant = "card",
  animation = "wave",
  showHeader = true,
  showFooter = false,
  children
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
    {showHeader && (
      <div className="flex items-center space-x-3 mb-4">
        <SkeletonAvatar size="sm" variant={variant} animation={animation} />
        <div className="flex-1">
          <SkeletonBox className="h-4 w-32 mb-2" variant={variant} animation={animation} />
          <SkeletonBox className="h-3 w-20" variant={variant} animation={animation} />
        </div>
      </div>
    )}
    
    {children || (
      <div className="space-y-3">
        <SkeletonText lines={3} variant={variant} animation={animation} />
        <SkeletonBox className="h-32 w-full rounded-lg" variant={variant} animation={animation} />
      </div>
    )}
    
    {showFooter && (
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <SkeletonButton size="sm" variant={variant} animation={animation} />
        <SkeletonBox className="h-6 w-16" variant={variant} animation={animation} />
      </div>
    )}
  </div>
);

// Form skeleton
export const SkeletonForm = ({ 
  fields = 3, 
  className = "",
  variant = "default",
  animation = "wave",
  showButton = true
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: fields }, (_, i) => (
      <div key={i}>
        <SkeletonBox className="h-4 w-20 mb-2" variant={variant} animation={animation} />
        <SkeletonBox className="h-12 w-full rounded-lg" variant={variant} animation={animation} />
      </div>
    ))}
    {showButton && (
      <SkeletonButton size="lg" fullWidth className="mt-6" variant={variant} animation={animation} />
    )}
  </div>
);

// Product card skeleton
export const SkeletonProductCard = ({ 
  className = "",
  variant = "card",
  animation = "wave",
  showPrice = true,
  showRating = true
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
    {/* Product Image */}
    <SkeletonBox className="h-48 w-full" variant={variant} animation={animation} />
    
    {/* Product Details */}
    <div className="p-4">
      <SkeletonBox className="h-5 w-full mb-2" variant={variant} animation={animation} />
      <SkeletonBox className="h-4 w-2/3 mb-3" variant={variant} animation={animation} />
      
      {showRating && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonBox key={i} className="w-4 h-4 rounded-sm" variant={variant} animation={animation} />
            ))}
          </div>
          <SkeletonBox className="h-4 w-8" variant={variant} animation={animation} />
        </div>
      )}
      
      {showPrice && (
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-6 w-16" variant={variant} animation={animation} />
          <SkeletonButton size="sm" variant={variant} animation={animation} />
        </div>
      )}
    </div>
  </div>
);

// List skeleton
export const SkeletonList = ({ 
  items = 5, 
  className = "",
  variant = "default",
  animation = "wave",
  showAvatar = true
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400 transition-colors duration-200">
        {showAvatar && <SkeletonAvatar size="md" variant={variant} animation={animation} />}
        <div className="flex-1">
          <SkeletonBox className="h-4 w-32 mb-2" variant={variant} animation={animation} />
          <SkeletonBox className="h-3 w-48" variant={variant} animation={animation} />
        </div>
        <SkeletonBox className="h-8 w-16 rounded" variant={variant} animation={animation} />
      </div>
    ))}
  </div>
);

// Table skeleton
export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  className = "",
  variant = "default",
  animation = "wave",
  showHeader = true
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
    {showHeader && (
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, i) => (
            <SkeletonBox key={i} className="h-4 w-20" variant={variant} animation={animation} />
          ))}
        </div>
      </div>
    )}
    
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, j) => (
              <SkeletonBox key={j} className="h-4 w-full" variant={variant} animation={animation} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Page skeleton wrapper
export const SkeletonPage = ({ 
  children, 
  className = "",
  showHeader = true,
  showSidebar = false,
  animation = "wave"
}) => (
  <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
    {showHeader && (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="container mx-auto">
          <SkeletonBox className="h-8 w-48" animation={animation} />
        </div>
      </div>
    )}
    
    <div className="container mx-auto px-4 py-6">
      {showSidebar ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SkeletonCard className="sticky top-6" animation={animation}>
              <SkeletonList items={5} showAvatar={false} animation={animation} />
            </SkeletonCard>
          </div>
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export default SkeletonBox;
