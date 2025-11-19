import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom'; 
import {
  HomeIcon,
  NewspaperIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  SparklesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  BookOpenIcon as BookOpenIconSolid
} from '@heroicons/react/24/solid';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { checkIfUserIsProfessional } from '../../services/chatService';

const DesktopSidebar = () => {
  const { t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();
  const [isProfessionalUser, setIsProfessionalUser] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      const checkRole = async () => {
        const isProf = await checkIfUserIsProfessional(currentUser.uid);
        setIsProfessionalUser(isProf);
      };
      checkRole();
    } else {
      setIsProfessionalUser(false);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const mainNavItems = [
    {
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      label: t('home'),
      color: 'text-blue-600'
    },
    {
      path: '/news',
      icon: NewspaperIcon,
      activeIcon: NewspaperIconSolid,
      label: t('news'),
      color: 'text-purple-600'
    },
    {
      path: '/services',
      icon: UserGroupIcon,
      activeIcon: UserGroupIconSolid,
      label: t('professionals'),
      color: 'text-pink-600',
      hideOnProfessionalRoute: true,
    },
    {
      path: '/appointments',
      icon: CalendarDaysIcon,
      activeIcon: CalendarDaysIcon,
      label: t('appointments'),
      color: 'text-blue-600',
    },
    {
      path: '/chat',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatIconSolid,
      label: t('chat'),
      color: 'text-green-600'
    },
    {
      path: '/resources',
      icon: BookOpenIcon,
      activeIcon: BookOpenIconSolid,
      label: t('resources'),
      color: 'text-orange-600'
    }
  ];

  const secondaryNavItems = [
    {
      path: '/profile',
      icon: UserCircleIcon,
      label: t('profile'),
      color: 'text-indigo-600'
    },
    {
      path: '/settings',
      icon: Cog6ToothIcon,
      label: t('settings'),
      color: 'text-gray-600'
    }
  ];

  const filteredMainNavItems = mainNavItems.filter(item => { 
      return !item.hideOnProfessionalRoute || !isProfessionalUser;
  });

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-gradient-to-b from-primary-50 to-secondary-50 border-r border-gray-200 h-screen sticky top-0">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200">
        {/* ... (rest of the logo/brand code is the same) */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg">
            <img
              src="/mitra.png"
              alt="Mitra Logo"
              className="w-10 h-10 rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <span className="text-2xl hidden">🌈</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Gazra Mitra
            </h1>
            <p className="text-xs text-gray-600">
              {t('welcome') || 'Community Support'}
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      {currentUser && (
        <div className="p-4 mx-4 mt-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold text-lg">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredMainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-white shadow-md text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-white/50 hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <item.activeIcon className={`w-6 h-6 ${item.color}`} />
                  ) : (
                    <item.icon className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
                  )}
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="py-4">
          <div className="border-t border-gray-200"></div>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-white shadow-md text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-white/50 hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer Motivational Quote */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg hover:bg-red-50 text-red-600 bg-white border border-red-50"
          >
            {t('logout') || 'Logout'}
          </button>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5" />
            <p className="text-xs font-semibold uppercase tracking-wide">Daily Inspiration</p>
          </div>
          <p className="text-sm leading-relaxed">
            "Be yourself; everyone else is already taken."
          </p>
          <p className="text-xs text-primary-100 mt-2">— Oscar Wilde</p>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;