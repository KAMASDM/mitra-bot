import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { 
  PaperAirplaneIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import {
  sendMessage,
  markMessagesAsRead,
  setTyping
} from '../../services/chatService';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const ChatWindow = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { activeChat, messages, typingUsers } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (activeChat && messages.length > 0) {
      markMessagesAsRead(activeChat.id, currentUser.uid);
    }
  }, [activeChat, messages, currentUser]);

  useEffect(() => {
    // Focus input when chat opens
    if (activeChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat || !currentUser || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      await sendMessage(activeChat.id, currentUser.uid, messageText);
      
      // Stop typing indicator
      await setTyping(activeChat.id, currentUser.uid, false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setInputMessage(messageText); // Restore message on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = async (e) => {
    setInputMessage(e.target.value);

    // Handle typing indicator
    if (!activeChat || !currentUser) return;

    try {
      if (e.target.value.trim()) {
        // Start typing
        await setTyping(activeChat.id, currentUser.uid, true);
        
        // Clear existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        // Set new timeout to stop typing after 3 seconds
        const timeout = setTimeout(async () => {
          await setTyping(activeChat.id, currentUser.uid, false);
          setTypingTimeout(null);
        }, 3000);
        
        setTypingTimeout(timeout);
      } else {
        // Stop typing immediately if input is empty
        await setTyping(activeChat.id, currentUser.uid, false);
        if (typingTimeout) {
          clearTimeout(typingTimeout);
          setTypingTimeout(null);
        }
      }
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-status-online';
      case 'away': return 'bg-status-away';
      case 'busy': return 'bg-status-busy';
      default: return 'bg-status-offline';
    }
  };

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/mitra.png" alt="Mitra" className="w-12 h-12 rounded-full" />
          </div>
          <p className="text-primary-600 font-medium">Select a user to start chatting</p>
          <p className="text-primary-500 text-sm mt-1">Connect with community members and get support</p>
        </div>
      </div>
    );
  }

  const otherUser = activeChat.otherUser;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-primary-600" />
            </button>
            
            <div className="relative">
              {otherUser?.photoURL ? (
                <img 
                  src={otherUser.photoURL} 
                  alt={otherUser.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-10 h-10 text-primary-400" />
              )}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(otherUser?.status)}`}></div>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary-800">
                {otherUser?.displayName || 'Unknown User'}
              </h3>
              <p className="text-xs text-primary-600">
                {otherUser?.status === 'online' ? 'Online' : `Last seen ${formatMessageTime(otherUser?.lastSeen)}`}
              </p>
            </div>
          </div>

          <button className="p-2 hover:bg-primary-100 rounded-full transition-colors">
            <EllipsisVerticalIcon className="w-5 h-5 text-primary-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-mandala-pattern">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <img src="/mitra.png" alt="Mitra" className="w-10 h-10 rounded-full" />
              </div>
              <p className="text-primary-600 font-medium">Start your conversation</p>
              <p className="text-primary-500 text-sm mt-1">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUser.uid;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-white text-primary-800 border border-primary-100 rounded-bl-md shadow-elegant'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.message}</p>
                  <p
                    className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-primary-100' : 'text-primary-500'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                    {isOwnMessage && message.read && (
                      <span className="ml-1">✓✓</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-primary-100 rounded-2xl rounded-bl-md px-4 py-3 border border-primary-200">
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-primary-600 ml-2">typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-primary-200 bg-primary-25">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border border-primary-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
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
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-200 ${
              inputMessage.trim() && !isLoading
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-royal hover:shadow-royal-lg'
                : 'bg-primary-200 text-primary-400 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;