import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon,
  NewspaperIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  BookOpenIcon as BookOpenIconSolid
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
      path: '/news',
      label: t('news'),
      icon: NewspaperIcon,
      activeIcon: NewspaperIconSolid
    },
    {
      path: '/services',
      label: t('professionals'),
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid
    },
    {
      path: '/',
      label: t('home'),
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      isCenter: true
    },
    {
      path: '/chat',  
      label: t('chat'),
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
      badge: connectionRequests?.length || 0
    },
    {
      path: '/resources',
      label: t('resources'),
      icon: BookOpenIcon,
      activeIcon: BookOpenIconSolid
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 bottom-nav max-w-mobile mx-auto shadow-[0_-2px_10px_rgba(0,0,0,0.1)]" style={{ zIndex: 9999 }}>
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-0 flex-1 relative ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {item.isCenter ? (
                    // Home button with embossed circle
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.1)]
                      ${isActive 
                        ? 'bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }
                    `}>
                      {React.createElement(
                        isActive ? item.activeIcon : item.icon, 
                        { className: `h-6 w-6 ${isActive ? 'text-white drop-shadow-md' : 'text-gray-600'}` }
                      )}
                    </div>
                  ) : (
                    // Regular icons with embossed effect
                    <div className={`
                      p-2 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-gradient-to-br from-primary-50 to-secondary-50 shadow-[inset_0_1px_3px_rgba(99,102,241,0.2),0_2px_6px_rgba(99,102,241,0.15)]' 
                        : 'bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1)]'
                      }
                    `}>
                      {React.createElement(
                        isActive ? item.activeIcon : item.icon, 
                        { className: "h-6 w-6" }
                      )}
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-semibold shadow-md">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;