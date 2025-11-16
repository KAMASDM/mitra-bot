import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PROFESSIONAL_CATEGORIES, getOnlineProfessionalCounts } from '../../services/professionalChatService';

const CategoryChips = ({ onSelectCategory, selectedCategory }) => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCounts = async () => {
    try {
      const categoryCounts = await getOnlineProfessionalCounts();
      setCounts(categoryCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category counts:', error);
      setLoading(false);
    }
  };

  const categories = Object.values(PROFESSIONAL_CATEGORIES);

  return (
    <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary-900 mb-1">
          Connect with Professionals
        </h2>
        <p className="text-sm text-primary-600">
          Choose a category to see available professionals
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const count = counts[category.id] || 0;
          const isSelected = selectedCategory === category.id;
          const isAvailable = count > 0;

          return (
            <motion.button
              key={category.id}
              onClick={() => isAvailable && onSelectCategory(category.id)}
              disabled={!isAvailable}
              whileHover={isAvailable ? { scale: 1.02 } : {}}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
              className={`
                relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-primary-500 shadow-royal-lg' 
                  : 'shadow-md hover:shadow-lg'
                }
                ${isAvailable 
                  ? 'cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{category.icon}</span>
                  {isAvailable && (
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-green-700">
                        {loading ? '...' : count}
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-primary-900 text-sm mb-1">
                  {category.name}
                </h3>
                
                <p className="text-xs text-primary-600 line-clamp-1">
                  {category.description}
                </p>
                
                {!isAvailable && (
                  <div className="mt-2 text-xs text-gray-500 italic">
                    No one available
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchCounts}
        className="mt-4 w-full py-2 px-4 bg-white border border-primary-200 rounded-lg text-sm text-primary-700 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
  );
};

export default CategoryChips;
