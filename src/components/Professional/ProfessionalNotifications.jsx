import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  subscribeToProfessionalNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../services/professionalNotificationService';
import { getProfessionalByUserId } from '../../services/professionalService';
import toast from 'react-hot-toast';

const ProfessionalNotifications = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const loadProfessional = async () => {
      try {
        const prof = await getProfessionalByUserId(currentUser.uid);
        if (prof) {
          setProfessional(prof);
        }
      } catch (error) {
        console.error('Error loading professional:', error);
      }
    };

    loadProfessional();
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (!professional) return;

    setLoading(true);
    const unsubscribe = subscribeToProfessionalNotifications(
      professional.id,
      (notifs) => {
        setNotifications(notifs);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [professional]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!professional) return;
    
    try {
      await markAllNotificationsAsRead(professional.id);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_booking':
        return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      case 'booking_cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'review_received':
        return <StarIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="w-6 h-6" />
              <h2 className="text-xl font-bold">Notifications</h2>
              {notifications.length > 0 && (
                <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <BellIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No new notifications</h3>
              <p className="text-sm text-gray-500">
                You'll be notified about new bookings and updates here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {notification.createdAt?.toLocaleString()}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalNotifications;
