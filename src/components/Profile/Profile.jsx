import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
  CalendarIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import LanguageSelector from '../Settings/LanguageSelector';
import StatusSelector from '../Settings/StatusSelector';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

const Profile = () => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [userStatus, setUserStatus] = useState('available');
  const [statusMessage, setStatusMessage] = useState('');
  const { currentUser, logout } = useAuth();
  const { t, currentLanguage, availableLanguages } = useLanguage();

  // Subscribe to user status changes
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserStatus(data.status || data.customStatus || 'available');
        setStatusMessage(data.statusMessage || '');
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'online':
      case 'available': return '🟢';
      case 'away': return '🟡';
      case 'busy': return '🔴';
      case 'offline': return '⚫';
      default: return '🟢';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
      case 'available': return t('status_available') || 'Available';
      case 'away': return t('status_away') || 'Away';
      case 'busy': return t('status_busy') || 'Busy';
      case 'offline': return t('status_offline') || 'Offline';
      default: return t('status_available') || 'Available';
    }
  };

  const profileStats = [
    { label: 'Appointments Booked', value: '3', icon: CalendarIcon },
    { label: 'Messages Sent', value: '15', icon: '💬' },
    { label: 'Services Used', value: '2', icon: HeartIcon },
  ];

  const menuItems = [
    {
      label: t('your_status') || 'Your Status',
      icon: UserIcon,
      action: () => setShowStatusSelector(true),
      subtitle: 'Set your availability status'
    },
    {
      label: t('changeLanguage'),
      icon: GlobeAltIcon,
      action: () => setShowLanguageSelector(true),
      subtitle: 'Change app language'
    },
    {
      label: 'Notifications',
      icon: BellIcon,
      action: () => console.log('Notifications'),
      subtitle: 'Manage your notification preferences'
    },
    {
      label: 'Privacy & Security',
      icon: ShieldCheckIcon,
      action: () => console.log('Privacy'),
      subtitle: 'Control your privacy settings'
    },
    {
      label: 'Blocked Users',
      icon: UserIcon,
      action: () => console.log('Blocked users'),
      subtitle: 'Manage blocked users'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10 text-primary" />
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {currentUser?.displayName || 'User'}
          </h2>
          <p className="text-gray-600 text-sm mb-3">
            {currentUser?.email}
          </p>
          
          {/* User Status Display */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full text-sm border border-gray-200">
              <span className="mr-2">{getStatusEmoji(userStatus)}</span>
              <span className="font-medium text-gray-700">{getStatusText(userStatus)}</span>
            </div>
          </div>
          
          {statusMessage && (
            <p className="text-sm text-gray-600 italic mb-3 px-4">
              "{statusMessage}"
            </p>
          )}
          
          <div className="inline-flex items-center px-3 py-1 bg-success/10 text-success rounded-full text-sm">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Active Member
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h3>
        <div className="grid grid-cols-3 gap-4">
          {profileStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                {typeof stat.icon === 'string' ? (
                  <span className="text-2xl">{stat.icon}</span>
                ) : (
                  <stat.icon className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Menu */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{t('settings')}</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.label}</div>
                  {item.subtitle && (
                    <div className="text-sm text-gray-500">{item.subtitle}</div>
                  )}
                </div>
                <div className="text-gray-400">›</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6">
        <div className="text-center">
          <div className="text-3xl mb-3">🤗</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Need Help?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Our support team is here to help you navigate and find the services you need.
          </p>
          <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
            Contact Support
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-danger text-danger py-3 rounded-lg font-medium hover:bg-danger hover:text-white transition-colors"
        >
          {t('logout')}
        </button>
      </div>

      {/* Language Selector Modal */}
      <LanguageSelector 
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />

      {/* Status Selector Modal */}
      <StatusSelector 
        isOpen={showStatusSelector}
        onClose={() => setShowStatusSelector(false)}
      />
    </div>
  );
};

export default Profile;