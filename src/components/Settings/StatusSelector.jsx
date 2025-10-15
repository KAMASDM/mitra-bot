import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserStatus } from '../../services/chatService';
import toast from 'react-hot-toast';

const StatusSelector = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = [
    {
      value: 'available',
      label: t('status_available') || 'Available',
      emoji: '🟢',
      color: 'text-green-600 bg-green-50',
      description: t('status_available_desc') || 'Ready to connect'
    },
    {
      value: 'busy',
      label: t('status_busy') || 'Busy',
      emoji: '🔴',
      color: 'text-red-600 bg-red-50',
      description: t('status_busy_desc') || 'Do not disturb'
    },
    {
      value: 'away',
      label: t('status_away') || 'Away',
      emoji: '🟡',
      color: 'text-yellow-600 bg-yellow-50',
      description: t('status_away_desc') || 'Away from device'
    },
    {
      value: 'offline',
      label: t('status_offline') || 'Appear Offline',
      emoji: '⚫',
      color: 'text-gray-600 bg-gray-50',
      description: t('status_offline_desc') || 'Hide your online status'
    }
  ];

  const handleSaveStatus = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      await updateUserStatus(currentUser.uid, selectedStatus, statusMessage.trim());
      toast.success(t('status_updated') || 'Status updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('status_update_error') || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    {t('set_status') || 'Set Your Status'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Status Options */}
                <div className="space-y-3 mb-6">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedStatus === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color}`}>
                          <span className="text-xl">{option.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {option.description}
                          </div>
                        </div>
                        {selectedStatus === option.value && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Status Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('status_message') || 'Status Message'} {t('optional') || '(optional)'}
                  </label>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder={t('status_message_placeholder') || 'What\'s on your mind?'}
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {statusMessage.length}/100
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel') || 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveStatus}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t('saving') || 'Saving...' : t('save_status') || 'Save Status'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default StatusSelector;
