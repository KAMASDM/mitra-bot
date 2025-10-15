import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, 
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/react/24/solid';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChatContext } from '../../contexts/ChatContext';

const BottomNavigation = () => {
  const { t } = useLanguage();
  // Safely get chat context - it might not be available on all routes
  const chatContext = React.useContext(ChatContext);
  const connectionRequests = chatContext?.connectionRequests || [];

  const navItems = [
    {
      path: '/',
      label: t('home'),
      icon: HomeIcon,
      activeIcon: HomeIconSolid
    },
    {
      path: '/services',
      label: t('search'),
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid
    },
    {
      path: '/messages',
      label: t('messages'),
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
      badge: 2 // Unread message count
    },
    {
      path: '/chat',  
      label: 'Community',
      icon: UserGroupIcon,
      activeIcon: UserGroupIconSolid,
      badge: connectionRequests?.length || 0
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200 bottom-nav max-w-mobile mx-auto shadow-royal">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-2 min-w-0 flex-1 relative ${
                isActive ? 'text-primary-600' : 'text-primary-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {React.createElement(
                    isActive ? item.activeIcon : item.icon, 
                    { className: "h-6 w-6" }
                  )}
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 truncate font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;