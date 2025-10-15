import React from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNavigation from './BottomNavigation';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="mobile-container bg-white/90 backdrop-blur-sm">
      <TopBar />
      
      <main className="pt-16 pb-20 min-h-screen">
        {children}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Layout;