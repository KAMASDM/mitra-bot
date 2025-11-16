import { motion } from 'framer-motion';
import {
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const AppointmentCard = ({
  booking,
  onAccept,
  onReject,
  onComplete,
  onCancel,
  showActions = true,
  compact = false
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    rejected: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-2xl shadow-md p-4
        border border-gray-100
        ${compact ? 'mb-3' : 'mb-4'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {booking.serviceName || booking.service || 'Appointment'}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium border
              ${statusColors[booking.status] || statusColors.pending}
            `}>
              {booking.status?.toUpperCase() || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{formatDate(booking.date)}</span>
          <ClockIcon className="w-4 h-4 ml-2" />
          <span>{formatTime(booking.time)}</span>
        </div>

        {/* Client Name */}
        {booking.clientName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon className="w-4 h-4" />
            <span>{booking.clientName}</span>
          </div>
        )}

        {/* Location */}
        {booking.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4" />
            <span className="truncate">{booking.location}</span>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onAccept?.(booking)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  bg-green-500 text-white px-4 py-2 rounded-xl
                  font-medium text-sm
                  hover:bg-green-600 active:scale-95
                  transition-all duration-200
                "
              >
                <CheckCircleIcon className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => onReject?.(booking)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  bg-red-500 text-white px-4 py-2 rounded-xl
                  font-medium text-sm
                  hover:bg-red-600 active:scale-95
                  transition-all duration-200
                "
              >
                <XCircleIcon className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

          {booking.status === 'confirmed' && (
            <>
              <button
                onClick={() => onComplete?.(booking)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  bg-blue-500 text-white px-4 py-2 rounded-xl
                  font-medium text-sm
                  hover:bg-blue-600 active:scale-95
                  transition-all duration-200
                "
              >
                <CheckCircleIcon className="w-4 h-4" />
                Complete
              </button>
              <button
                onClick={() => onCancel?.(booking)}
                className="
                  flex-1 flex items-center justify-center gap-2
                  bg-gray-500 text-white px-4 py-2 rounded-xl
                  font-medium text-sm
                  hover:bg-gray-600 active:scale-95
                  transition-all duration-200
                "
              >
                <XCircleIcon className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentCard;
