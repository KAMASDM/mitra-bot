import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateNotification = () => {
  const [showNotification, setShowNotification] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
      // Check for updates every hour
      r && setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowNotification(true);
    }
  }, [needRefresh]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowNotification(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  if (!showNotification || !needRefresh) {
    return null;
  }

  return (
    <>
      {/* Mobile Notification - Bottom Toast */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-white/20 p-2 rounded-lg">
                <ArrowPathIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">New Update Available!</h3>
                <p className="text-sm text-indigo-100">
                  We've made improvements to Gazra Mitra. Update now for the best experience.
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="text-white/80 hover:text-white p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-white text-indigo-600 py-2.5 px-4 rounded-xl font-semibold hover:bg-indigo-50 transition-all"
            >
              Update Now
            </button>
            <button
              onClick={close}
              className="px-4 py-2.5 text-white/90 hover:text-white font-medium"
            >
              Later
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Notification - Top Right Toast */}
      <div className="hidden lg:block fixed top-20 right-6 z-50 w-96 animate-slide-left">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ArrowPathIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Update Available</h3>
                  <p className="text-indigo-100 text-sm">Version 2.0 is ready</p>
                </div>
              </div>
              <button
                onClick={close}
                className="text-white/80 hover:text-white p-1"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm mb-4">
              We've made improvements to Gazra Mitra with new features and bug fixes. Update now to get the latest version.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
              >
                Update Now
              </button>
              <button
                onClick={close}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-left {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default UpdateNotification;
