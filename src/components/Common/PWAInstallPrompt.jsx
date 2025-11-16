import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    const installCount = localStorage.getItem('pwa-install-count') || 0;
    
    // Don't show if dismissed in last 7 days
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Show prompt after 3 seconds for first-time visitors
    // or after 10 seconds for returning visitors
    const delay = installCount === 0 ? 3000 : 10000;

    const timer = setTimeout(() => {
      if (iOS) {
        // Show iOS-specific instructions
        setShowPrompt(true);
      } else {
        // For Android/Desktop, show if beforeinstallprompt was captured
        if (deferredPrompt) {
          setShowPrompt(true);
        }
      }
    }, delay);

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Auto-show prompt after delay
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    } else {
      console.log('User dismissed the install prompt');
      // Increment dismiss count
      const count = parseInt(localStorage.getItem('pwa-install-count') || 0) + 1;
      localStorage.setItem('pwa-install-count', count);
    }

    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    
    // Increment dismiss count
    const count = parseInt(localStorage.getItem('pwa-install-count') || 0) + 1;
    localStorage.setItem('pwa-install-count', count);
  };

  const handleMaybeLater = () => {
    setShowPrompt(false);
    // Don't set dismissed timestamp - will show again on next visit
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
            onClick={handleMaybeLater}
          />

          {/* Install Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-md"
          >
            <div className="bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden border-t-4 border-indigo-500">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all z-10"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8">
                {/* App Icon & Title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Install Gazra Mitra
                    </h3>
                    <p className="text-sm text-gray-600">
                      Access faster & offline
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <BenefitItem
                    icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    text="Works offline - access anytime"
                  />
                  <BenefitItem
                    icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    text="Faster loading & better performance"
                  />
                  <BenefitItem
                    icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    text="Add to home screen - like a native app"
                  />
                  <BenefitItem
                    icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    text="Push notifications for updates"
                  />
                </div>

                {/* iOS Instructions */}
                {isIOS && showIOSInstructions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4"
                  >
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                      To install on iOS:
                    </h4>
                    <ol className="text-xs text-blue-800 space-y-2">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Tap the Share button <span className="inline-block">⎙</span> in Safari</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>Scroll down and tap "Add to Home Screen"</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>Tap "Add" in the top right corner</span>
                      </li>
                    </ol>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleInstallClick}
                    className="
                      w-full flex items-center justify-center gap-2
                      bg-gradient-to-r from-indigo-500 to-purple-600
                      text-white px-6 py-3.5 rounded-xl
                      font-semibold text-base
                      hover:from-indigo-600 hover:to-purple-700
                      active:scale-95
                      shadow-lg hover:shadow-xl
                      transition-all duration-200
                    "
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {isIOS ? 'Show Instructions' : 'Install App'}
                  </button>

                  <button
                    onClick={handleMaybeLater}
                    className="
                      w-full px-6 py-2.5 rounded-xl
                      text-gray-600 font-medium text-sm
                      hover:bg-gray-100
                      active:scale-95
                      transition-all duration-200
                    "
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Privacy Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Free, secure, and takes less than 1MB
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Benefit Item Component
const BenefitItem = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    {icon}
    <span className="text-sm text-gray-700">{text}</span>
  </div>
);

export default PWAInstallPrompt;
