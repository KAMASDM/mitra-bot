import { motion } from 'framer-motion';
import {
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  ClockIcon,
  MapPinIcon,
  LanguageIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const ResourceCard = ({ resource, index }) => {
  const handleVisit = () => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {resource.name}
              </h3>
              {resource.verified && (
                <CheckBadgeIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2.5">
          {/* Helpline (Priority) */}
          {resource.helpline && (
            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  {resource.helpline}
                  {resource.hours && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">
                      ({resource.hours})
                    </span>
                  )}
                </span>
                <button
                  onClick={() => handleCall(resource.helpline)}
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 active:scale-95 transition-all"
                >
                  Call
                </button>
              </div>
            </div>
          )}

          {/* Phone */}
          {resource.phone && !resource.helpline && (
            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-gray-700">{resource.phone}</span>
                <button
                  onClick={() => handleCall(resource.phone)}
                  className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600 active:scale-95 transition-all"
                >
                  Call
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          {resource.contactEmail && (
            <div className="flex items-center gap-2 text-sm">
              <EnvelopeIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <button
                onClick={() => handleEmail(resource.contactEmail)}
                className="text-gray-700 hover:text-indigo-600 truncate text-left"
              >
                {resource.contactEmail}
              </button>
            </div>
          )}

          {/* Website */}
          {resource.url && (
            <div className="flex items-center gap-2 text-sm">
              <GlobeAltIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <button
                onClick={handleVisit}
                className="text-indigo-600 hover:text-indigo-700 font-medium truncate text-left flex-1"
              >
                Visit Website
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between gap-4 text-xs text-gray-600">
          {/* Languages */}
          {resource.languages && resource.languages.length > 0 && (
            <div className="flex items-center gap-1.5">
              <LanguageIcon className="w-3.5 h-3.5" />
              <span>{resource.languages.slice(0, 2).join(', ')}</span>
              {resource.languages.length > 2 && (
                <span>+{resource.languages.length - 2}</span>
              )}
            </div>
          )}

          {/* Available For */}
          {resource.availableFor && resource.availableFor.length > 0 && (
            <div className="flex items-center gap-1.5">
              <UserGroupIcon className="w-3.5 h-3.5" />
              <span className="truncate">
                {resource.availableFor[0]}
                {resource.availableFor.length > 1 && ` +${resource.availableFor.length - 1}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;
