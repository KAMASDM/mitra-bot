import { motion } from 'framer-motion';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  trend,
  onClick 
}) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    success: 'bg-gradient-to-br from-green-500 to-emerald-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    danger: 'bg-gradient-to-br from-red-500 to-pink-600',
    info: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        ${onClick ? 'cursor-pointer' : ''}
        bg-white rounded-2xl shadow-md p-5
        hover:shadow-lg transition-shadow duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`
            ${colorClasses[color]}
            w-12 h-12 rounded-xl
            flex items-center justify-center
            shadow-lg
          `}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
