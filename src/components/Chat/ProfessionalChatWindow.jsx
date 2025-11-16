import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { 
  sendChatMessage, 
  subscribeToChatMessages,
  markChatMessagesAsRead 
} from '../../services/professionalChatService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ProfessionalChatWindow = ({ chatRoom, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const otherUser = chatRoom.otherUser;
  const isProfessionalData = chatRoom.professionalData;

  useEffect(() => {
    if (!chatRoom?.id) return;

    // Subscribe to messages
    const unsubscribe = subscribeToChatMessages(chatRoom.id, (newMessages) => {
      setMessages(newMessages);
      // Mark as read
      markChatMessagesAsRead(chatRoom.id, currentUser.uid);
    });

    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => unsubscribe();
  }, [chatRoom?.id, currentUser.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      await sendChatMessage(chatRoom.id, currentUser.uid, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setInputMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  return (
    <div className="fixed inset-0 top-0 bottom-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="relative flex-shrink-0">
            {otherUser?.photoURL ? (
              <img
                src={otherUser.photoURL}
                alt={otherUser.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8" />
              </div>
            )}
            {otherUser?.status === 'online' && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {otherUser?.displayName || 'Unknown User'}
            </h3>
            {isProfessionalData && (
              <p className="text-xs opacity-90 truncate">
                {isProfessionalData.specialization || isProfessionalData.specialty || 'Professional'}
              </p>
            )}
            {!isProfessionalData && (
              <p className="text-xs opacity-90">
                {otherUser?.status === 'online' ? 'Online' : 'Offline'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCircleIcon className="w-10 h-10 text-primary-400" />
              </div>
              <p className="text-gray-600 font-medium">Start your conversation</p>
              <p className="text-gray-500 text-sm mt-1">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUser.uid;
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {!isOwnMessage && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        otherUser?.photoURL ? (
                          <img
                            src={otherUser.photoURL}
                            alt={otherUser.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )
                      ) : (
                        <div className="w-8"></div>
                      )}
                    </div>
                  )}

                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.message}</p>
                    </div>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-right text-gray-500' : 'text-gray-500'}`}>
                      {formatMessageTime(message.createdAt)}
                      {isOwnMessage && message.read && (
                        <span className="ml-1 text-primary-600">✓✓</span>
                      )}
                    </p>
                  </div>

                  {isOwnMessage && <div className="w-8"></div>}
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className={`p-3 rounded-xl transition-all ${
              inputMessage.trim() && !sending
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalChatWindow;
