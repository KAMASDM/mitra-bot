import React, { useState } from 'react';
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

const TopBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-primary-200 shadow-royal z-50 max-w-mobile mx-auto">
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
            
            <button className="p-2 rounded-lg hover:bg-primary-100 relative text-primary-600">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
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
      </div>

      {/* Side Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 max-w-mobile mx-auto">
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
    </>
  );
};

export default TopBar;