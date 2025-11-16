import React from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNavigation from './BottomNavigation';
import DesktopSidebar from './DesktopSidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <DesktopSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen lg:max-w-none max-w-[428px] mx-auto bg-white/90 backdrop-blur-sm">
        {/* Mobile/Tablet Top Bar - Hidden on desktop */}
        <div className="lg:hidden">
          <TopBar />
        </div>
        
        {/* Desktop Top Bar - Only visible on desktop */}
        <div className="hidden lg:block border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {location.pathname === '/' ? 'Home' :
               location.pathname === '/news' ? 'News & Updates' :
               location.pathname === '/services' ? 'Find Professionals' :
               location.pathname === '/chat' ? 'Messages' :
               location.pathname === '/resources' ? 'Resources' :
               location.pathname === '/profile' ? 'Profile' :
               location.pathname === '/settings' ? 'Settings' : 'Gazra Mitra'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {location.pathname === '/' ? 'Connect with professionals and community support' :
               location.pathname === '/news' ? 'Stay updated with community news and events' :
               location.pathname === '/services' ? 'Search and book appointments with LGBTQAI+ friendly professionals' :
               location.pathname === '/chat' ? 'Connect with professionals and community members' :
               location.pathname === '/resources' ? 'Access healthcare, legal, and career resources' :
               location.pathname === '/profile' ? 'Manage your account and preferences' :
               location.pathname === '/settings' ? 'Configure your app preferences' : 'Welcome to Gazra Mitra'}
            </p>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto lg:pt-0 pt-16 pb-20 lg:pb-0">
          <div className="lg:p-6 lg:max-w-7xl lg:mx-auto">
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation - Hidden on desktop */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

export default Layout;