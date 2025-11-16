import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  BellIcon, 
  LanguageIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../Settings/LanguageSelector';
import Notifications from '../Notifications/Notifications';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

const TopBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useLanguage();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  // Subscribe to unread notifications count
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    }, (error) => {
      console.error('Error fetching unread notifications:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-primary-200 shadow-royal max-w-mobile mx-auto" style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-primary-100 text-primary-600"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <img src="/mitra.png" alt="Mitra" className="w-8 h-8 rounded-full" />
            <h1 className="text-lg font-bold text-primary-800 drop-shadow-sm">
              Gazra Mitra
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLanguageSelector(true)}
              className="p-2 rounded-lg hover:bg-primary-100 text-primary-600"
            >
              <LanguageIcon className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-lg hover:bg-primary-100 relative text-primary-600"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg hover:bg-primary-100 text-primary-600"
              title={t('profile') || 'Profile'}
            >
              <UserIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      {showMenu && (
        <div className="fixed inset-0 max-w-mobile mx-auto" style={{ zIndex: 10000 }}>
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-royal">
            <div className="p-4 border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="flex items-center gap-2">
                <img src="/mitra.png" alt="Mitra" className="w-6 h-6 rounded-full" />
                <h2 className="text-lg font-semibold text-primary-800">{t('settings')}</h2>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setShowLanguageSelector(true);
                  setShowMenu(false);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-primary-50 flex items-center space-x-3 text-primary-700"
              >
                <LanguageIcon className="h-5 w-5 text-primary-600" />
                <span>{t('changeLanguage')}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-red-600"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selector Modal */}
      <LanguageSelector 
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />

      {/* Notifications Modal */}
      <Notifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default TopBar;