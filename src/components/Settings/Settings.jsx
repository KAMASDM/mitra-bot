import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  BellIcon, 
  ShieldCheckIcon,
  LanguageIcon,
  MoonIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

const Settings = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const settingsSections = [
    {
      title: 'Account Settings',
      items: [
        {
          icon: UserCircleIcon,
          label: 'Profile',
          description: 'Update your profile information',
          action: () => navigate('/profile')
        },
        {
          icon: ShieldCheckIcon,
          label: 'Privacy & Security',
          description: 'Manage your privacy settings',
          action: () => {} // TODO: Add privacy settings
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: LanguageIcon,
          label: 'Language',
          description: 'Change app language',
          action: () => setShowLanguageSelector(true)
        },
        {
          icon: BellIcon,
          label: 'Notifications',
          description: 'Manage notification preferences',
          action: () => {} // TODO: Add notification settings
        },
        {
          icon: MoonIcon,
          label: 'Theme',
          description: 'Light or dark mode',
          action: () => {} // TODO: Add theme toggle
        }
      ]
    },
    {
      title: 'App Information',
      items: [
        {
          icon: DevicePhoneMobileIcon,
          label: 'About',
          description: 'Version 1.0.0',
          action: () => {}
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('settings') || 'Settings'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold text-2xl">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentUser?.displayName || 'User'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentUser?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Language Selector Modal */}
      <LanguageSelector 
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </div>
  );
};

export default Settings;
