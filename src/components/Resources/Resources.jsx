import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import ResourceCard from './ResourceCard';
import {
  RESOURCES_DATA,
  RESOURCE_CATEGORIES,
  CATEGORY_INFO,
  getResourcesByCategory,
  searchResources,
} from '../../data/resourcesData';

const Resources = () => {
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter resources based on category and search
  const filteredResources = useMemo(() => {
    let resources = RESOURCES_DATA;

    // Filter by category
    if (selectedCategory !== 'all') {
      resources = getResourcesByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      resources = resources.filter(resource =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return resources;
  }, [selectedCategory, searchQuery]);

  const categoryStats = useMemo(() => {
    const stats = {};
    Object.keys(RESOURCE_CATEGORIES).forEach(key => {
      const category = RESOURCE_CATEGORIES[key];
      stats[category] = RESOURCES_DATA.filter(r => r.category === category).length;
    });
    return stats;
  }, []);

  return (
    <div className="fixed pt-9 inset-0 top-16 bottom-20 flex flex-col bg-gray-50 lg:bg-transparent lg:h-full">
      {/* Fixed Header - Hidden on desktop (shown in Layout) */}
      <div className="flex-shrink-0 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white p-4 shadow-lg lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Community Resources</h1>
            <p className="text-xs text-primary-100">
              {filteredResources.length} verified resources
            </p>
          </div>
          <CheckCircleIcon className="w-8 h-8" />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 px-8 py-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Resources</h1>
            <p className="text-gray-600 mt-1">
              {filteredResources.length} verified organizations and services
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">All Verified</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 p-4 lg:px-8 bg-white lg:bg-transparent">
        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-12 pr-4 py-3 rounded-xl
              border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
              text-sm bg-white
            "
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200
              ${selectedCategory === 'all'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            All ({RESOURCES_DATA.length})
          </button>

          {Object.keys(RESOURCE_CATEGORIES).map((key) => {
            const category = RESOURCE_CATEGORIES[key];
            const info = CATEGORY_INFO[category];
            const count = categoryStats[category] || 0;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${selectedCategory === category
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {info.icon} {info.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6">
        {/* Category Description */}
        {selectedCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 mb-6 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_INFO[selectedCategory].color}
                flex items-center justify-center text-2xl
              `}>
                {CATEGORY_INFO[selectedCategory].icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {CATEGORY_INFO[selectedCategory].name}
                </h3>
                <p className="text-sm text-gray-600">
                  {CATEGORY_INFO[selectedCategory].description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No resources found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {filteredResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> All resources listed here are verified and authentic.
            However, we recommend verifying current contact information and availability before reaching out.
            If you notice any outdated information, please contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
