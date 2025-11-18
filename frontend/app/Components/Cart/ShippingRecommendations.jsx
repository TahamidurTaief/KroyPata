// app/Components/Cart/ShippingRecommendations.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiTruck, FiDollarSign, FiRefreshCw, FiX, FiGift } from "react-icons/fi";
import { useState } from "react";

const ShippingRecommendations = ({
  recommendations = { warnings: [], suggestions: [], savings: [] },
  onRefreshShipping = () => {}
}) => {
  const [dismissed, setDismissed] = useState(new Set());
  
  const allRecommendations = [
    ...recommendations.warnings.map(r => ({ ...r, category: 'warning' })),
    ...recommendations.suggestions.map(r => ({ ...r, category: 'suggestion' })),
    ...recommendations.savings.map(r => ({ ...r, category: 'savings' }))
  ];

  const visibleRecommendations = allRecommendations.filter(
    (rec) => !dismissed.has(`${rec.category}-${rec.type}`)
  );

  const dismissRecommendation = (category, type) => {
    setDismissed(prev => new Set([...prev, `${category}-${type}`]));
  };

  if (visibleRecommendations.length === 0) {
    return null;
  }

  const getRecommendationStyle = (category) => {
    switch (category) {
      case 'warning':
        return {
          containerClass: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
          iconClass: 'text-orange-600',
          titleClass: 'text-orange-800 dark:text-orange-200',
          textClass: 'text-orange-700 dark:text-orange-300',
          Icon: FiAlertTriangle
        };
      case 'suggestion':
        return {
          containerClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          iconClass: 'text-blue-600',
          titleClass: 'text-blue-800 dark:text-blue-200',
          textClass: 'text-blue-700 dark:text-blue-300',
          Icon: FiGift
        };
      case 'savings':
        return {
          containerClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          iconClass: 'text-green-600',
          titleClass: 'text-green-800 dark:text-green-200',
          textClass: 'text-green-700 dark:text-green-300',
          Icon: FiDollarSign
        };
      default:
        return {
          containerClass: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
          iconClass: 'text-gray-600',
          titleClass: 'text-gray-800 dark:text-gray-200',
          textClass: 'text-gray-700 dark:text-gray-300',
          Icon: FiTruck
        };
    }
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {visibleRecommendations.map((recommendation, index) => {
          const style = getRecommendationStyle(recommendation.category);
          const IconComponent = style.Icon;
          
          return (
            <motion.div
              key={`${recommendation.category}-${recommendation.type}-${index}`}
              className={`
                relative rounded-lg border p-4 ${style.containerClass}
              `}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                type: "spring",
                stiffness: 300
              }}
              layout
            >
              {/* Dismiss Button */}
              <button
                onClick={() => dismissRecommendation(recommendation.category, recommendation.type)}
                className={`
                  absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 
                  transition-colors ${style.textClass}
                `}
                aria-label="Dismiss"
              >
                <FiX className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <div className="flex-shrink-0 mt-0.5">
                  <IconComponent className={`w-5 h-5 ${style.iconClass}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-semibold ${style.titleClass}`}>
                      {recommendation.title}
                    </h4>
                    {recommendation.icon && (
                      <span className="text-lg">{recommendation.icon}</span>
                    )}
                  </div>

                  <p className={`text-sm ${style.textClass} leading-relaxed`}>
                    {recommendation.message}
                  </p>

                  {/* Action needed amount for free shipping */}
                  {recommendation.actionNeeded && (
                    <motion.div
                      className="mt-3 flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className={`
                        px-3 py-2 rounded-lg font-bold text-lg
                        ${recommendation.category === 'suggestion' ? 
                          'bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200' : 
                          'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200'
                        }
                      `}>
                        +${recommendation.actionNeeded.toFixed(2)}
                      </div>
                      <span className={`text-xs ${style.textClass}`}>
                        needed for free shipping
                      </span>
                    </motion.div>
                  )}

                  {/* Split shipping details */}
                  {recommendation.type === 'split_shipping' && (
                    <motion.div
                      className="mt-3 text-xs opacity-75"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.75 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className={style.textClass}>
                        This may result in multiple delivery dates and separate tracking numbers.
                      </p>
                    </motion.div>
                  )}

                  {/* Action buttons */}
                  {recommendation.category === 'warning' && recommendation.type === 'no_shipping' && (
                    <motion.button
                      onClick={onRefreshShipping}
                      className="mt-3 flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Retry Shipping
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Summary indicator */}
      {visibleRecommendations.length > 0 && (
        <motion.div
          className="text-center pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xs text-[var(--color-text-secondary)]">
            {visibleRecommendations.length} shipping {visibleRecommendations.length === 1 ? 'notice' : 'notices'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ShippingRecommendations;
