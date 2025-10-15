import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import OnlineUsers from './OnlineUsers';
import ChatWindow from './ChatWindow';
import { UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Chat = () => {
  const { currentUser } = useAuth();
  const { activeChat, onlineUsers, connectionRequests } = useChat();
  const [showUsers, setShowUsers] = useState(true); // Always show users panel by default
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show users panel
      if (!mobile) {
        setShowUsers(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // On mobile, show chat window when activeChat is selected
  useEffect(() => {
    if (isMobile && activeChat) {
      setShowUsers(false);
    }
  }, [activeChat, isMobile]);

  const handleBackToUsers = () => {
    setShowUsers(true);
  };

  const requestCount = connectionRequests.length;

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/mitra.png" alt="Mitra" className="w-12 h-12 rounded-full" />
          </div>
          <p className="text-primary-600 font-medium">Please login to access chat</p>
          <p className="text-primary-500 text-sm mt-1">Connect with your community</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bottom-20 bg-white/95 backdrop-blur-sm flex flex-col">
      {/* Header with Mitra logo and navigation */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white p-4 shadow-royal flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/mitra.png" alt="Mitra" className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="text-lg font-bold">Mitra Community</h1>
              <p className="text-xs text-primary-100">
                {onlineUsers.filter(u => u.id !== currentUser?.uid).length > 0 
                  ? `${onlineUsers.filter(u => u.id !== currentUser?.uid).length} ${onlineUsers.filter(u => u.id !== currentUser?.uid).length === 1 ? 'user' : 'users'} online`
                  : 'Waiting for others to join...'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show notification badge for connection requests */}
            {requestCount > 0 && (
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{requestCount} new request{requestCount > 1 ? 's' : ''}</span>
              </div>
            )}

            {isMobile && !showUsers && (
              <button
                onClick={handleBackToUsers}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                title="Back to Users"
              >
                <UserGroupIcon className="w-5 h-5" />
                {requestCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {requestCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: Side by side layout */}
        {!isMobile ? (
          <>
            {/* Users Panel - Always visible on desktop */}
            <div className="w-80 border-r border-primary-200 flex flex-col overflow-hidden">
              <OnlineUsers />
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatWindow />
            </div>
          </>
        ) : (
          /* Mobile: Toggle between views */
          <>
            {showUsers ? (
              <div className="w-full flex flex-col overflow-hidden">
                <OnlineUsers />
              </div>
            ) : (
              <div className="w-full flex flex-col overflow-hidden">
                <ChatWindow onClose={handleBackToUsers} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;