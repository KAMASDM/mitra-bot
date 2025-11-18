import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfessionalChat } from '../../contexts/ProfessionalChatContext';
import CategoryChips from './CategoryChips';
import ProfessionalList from './ProfessionalList';
import MyChatsList from './MyChatsList';
import PendingRequestsPanel from './PendingRequestsPanel';
import ProfessionalChatWindow from './ProfessionalChatWindow';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const Chat = () => {
  const { currentUser } = useAuth();
  const {
    selectedCategory,
    setSelectedCategory,
    isProfessional,
    loading: contextLoading,
    refreshChatRooms,
    activeChatRooms
  } = useProfessionalChat();

  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'chats', 'requests'
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Set default tab based on user role
  useEffect(() => {
    if (isProfessional) {
      setActiveTab('requests'); // Professionals see requests first
    } else {
      setActiveTab('categories'); // Users see categories first
    }
  }, [isProfessional]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleOpenChat = (chatRoom) => {
    setActiveChatRoom(chatRoom);
  };

  const handleCloseChat = () => {
    setActiveChatRoom(null);
    refreshChatRooms();
  };

  const handleRequestResponded = async (chatRoomId) => {
    // 1. Refresh chat rooms list (this will include the newly created one)
    await refreshChatRooms();

    // 2. Find the newly created chat room from the refreshed list
    const newRoom = activeChatRooms.find(room => room.id === chatRoomId);

    if (newRoom) {
      setActiveTab('chats'); // Switch to chats tab
      handleOpenChat(newRoom); // Open the new chat window immediately
    } else {
      // Fallback: if not found immediately, just switch to chats tab
      setActiveTab('chats');
    }
  };

  if (contextLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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

  // If chat window is open, show full screen chat
  if (activeChatRoom) {
    return (
      <ProfessionalChatWindow
        chatRoom={activeChatRoom}
        onClose={handleCloseChat}
      />
    );
  }

  return (
    <div className="fixed inset-0 top-16 bottom-20 bg-white/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white p-4 shadow-royal flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/mitra.png" alt="Mitra" className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="text-lg font-bold">Professional Connect</h1>
              <p className="text-xs text-primary-100">
                {isProfessional ? 'Manage your clients' : 'Find professionals'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-1 overflow-x-auto">
        {!isProfessional && (
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all ${activeTab === 'categories'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
              }`}
          >
            <Squares2X2Icon className="w-5 h-5" />
            <span>Find Professionals</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('chats')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all ${activeTab === 'chats'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-primary-600'
            }`}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          <span>{isProfessional ? 'My Clients' : 'My Chats'}</span>
        </button>

        {isProfessional && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all ${activeTab === 'requests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
              }`}
          >
            <ClockIcon className="w-5 h-5" />
            <span>Pending Requests</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'categories' && !isProfessional && (
          selectedCategory ? (
            <ProfessionalList
              categoryId={selectedCategory}
              onBack={handleBackToCategories}
            />
          ) : (
            <CategoryChips onSelectCategory={handleCategorySelect} />
          )
        )}

        {activeTab === 'chats' && (
          <MyChatsList onOpenChat={handleOpenChat} />
        )}

        {activeTab === 'requests' && isProfessional && (
          <PendingRequestsPanel onRequestResponded={handleRequestResponded} />
        )}
      </div>
    </div>
  );
};

export default Chat;