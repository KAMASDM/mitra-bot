import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getUserChatRooms } from '../../services/professionalChatService';
import { checkIfUserIsProfessional } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const MyChatsList = ({ onOpenChat }) => {
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        // Check if user is professional
        const professionalStatus = await checkIfUserIsProfessional(currentUser.uid);
        setIsProfessional(professionalStatus);

        // Load chat rooms
        const rooms = await getUserChatRooms(currentUser.uid, professionalStatus);
        setChatRooms(rooms);
        setLoading(false);
      } catch (error) {
        console.error('Error loading chat rooms:', error);
        setLoading(false);
      }
    };

    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No Active Chats</h3>
          <p className="text-gray-600 text-sm">
            {isProfessional 
              ? 'When users send you chat requests, they will appear here.'
              : 'Send a chat request to a professional to start chatting.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600" />
        My Chats
      </h3>

      <div className="space-y-2">
        {chatRooms.map((chatRoom, index) => {
          const otherUser = chatRoom.otherUser;
          const unreadCount = chatRoom.unreadCount?.[currentUser.uid] || 0;
          const lastMessage = chatRoom.lastMessage;
          const lastMessageTime = chatRoom.lastMessageAt;

          return (
            <motion.div
              key={chatRoom.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onOpenChat(chatRoom)}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary-300"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {otherUser?.photoURL ? (
                    <img
                      src={otherUser.photoURL}
                      alt={otherUser.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                      {otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  {otherUser?.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {otherUser?.displayName || 'Unknown User'}
                    </h4>
                    {lastMessageTime && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(lastMessageTime)}
                      </span>
                    )}
                  </div>

                  {/* Professional specialization */}
                  {!isProfessional && chatRoom.professionalData && (
                    <p className="text-xs text-primary-600 mb-1">
                      {chatRoom.professionalData.specialization || chatRoom.professionalData.specialty || 'Professional'}
                    </p>
                  )}

                  {/* Last Message */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {lastMessage || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <div className="bg-primary-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center flex-shrink-0">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MyChatsList;
