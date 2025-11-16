import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  updateUserPresence,
  subscribeToOnlineUsers,
  getConnectionRequests,
  getUserConnections,
  getUserChatRooms,
  subscribeToMessages,
  subscribeToTypingIndicators
} from '../services/chatService';

const ChatContext = createContext();

// Export ChatContext so components can use it with useContext directly if needed
export { ChatContext };

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Initialize user presence and subscriptions
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeOnlineUsers = null;

    const initializeChat = async () => {
      try {
        console.log('🚀 Initializing chat for user:', currentUser.uid);
        
        // Set user as online
        await updateUserPresence(currentUser.uid, 'online');
        console.log('✅ User presence set to online');

        // Subscribe to online users with role-based filtering
        unsubscribeOnlineUsers = subscribeToOnlineUsers((users) => {
          console.log('📥 Received online users update:', users.length, 'users');
          console.log('📥 Current user ID:', currentUser.uid);
          console.log('📥 Other users (excluding me):', users.filter(u => u.id !== currentUser.uid).length);
          setOnlineUsers(users);
        }, currentUser.uid); // Pass currentUserId for role-based filtering
        
        // Load initial data
        const [connectionsData, requestsData, chatRoomsData] = await Promise.all([
          getUserConnections(currentUser.uid),
          getConnectionRequests(currentUser.uid, 'received'),
          getUserChatRooms(currentUser.uid)
        ]);

        console.log('📊 Loaded connections:', connectionsData.length);
        console.log('📨 Loaded requests:', requestsData.length);
        console.log('💬 Loaded chat rooms:', chatRoomsData.length);

        setConnections(connectionsData);
        setConnectionRequests(requestsData);
        setChatRooms(chatRoomsData);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();

    // Cleanup on user change or unmount
    return () => {
      console.log('🧹 Cleaning up chat for user:', currentUser.uid);
      if (currentUser) {
        console.log('👋 Setting user offline:', currentUser.uid);
        updateUserPresence(currentUser.uid, 'offline').catch(console.error);
      }
      if (unsubscribeOnlineUsers) {
        console.log('🔌 Unsubscribing from online users listener');
        unsubscribeOnlineUsers();
      }
    };
  }, [currentUser]);

  // Subscribe to messages for active chat
  useEffect(() => {
    if (!activeChat?.id || !currentUser) return;

    const unsubscribeMessages = subscribeToMessages(activeChat.id, setMessages);
    const unsubscribeTyping = subscribeToTypingIndicators(
      activeChat.id, 
      currentUser.uid, 
      setTypingUsers
    );

    return () => {
      unsubscribeMessages?.();
      unsubscribeTyping?.();
    };
  }, [activeChat?.id, currentUser]);

  // Update user presence on page visibility change
  useEffect(() => {
    if (!currentUser) return;

    const handleVisibilityChange = () => {
      const status = document.hidden ? 'away' : 'online';
      updateUserPresence(currentUser.uid, status).catch(console.error);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  // Refresh chat rooms periodically
  useEffect(() => {
    if (!currentUser) return;

    const refreshChatRooms = async () => {
      try {
        const chatRoomsData = await getUserChatRooms(currentUser.uid);
        setChatRooms(chatRoomsData);
      } catch (error) {
        console.error('Error refreshing chat rooms:', error);
      }
    };

    const interval = setInterval(refreshChatRooms, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  const refreshConnections = async () => {
    if (!currentUser) return;
    try {
      const connectionsData = await getUserConnections(currentUser.uid);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error refreshing connections:', error);
    }
  };

  const refreshConnectionRequests = async () => {
    if (!currentUser) return;
    try {
      const requestsData = await getConnectionRequests(currentUser.uid, 'received');
      setConnectionRequests(requestsData);
    } catch (error) {
      console.error('Error refreshing connection requests:', error);
    }
  };

  const openChat = (chatRoom) => {
    setActiveChat(chatRoom);
    setMessages([]);
    setTypingUsers([]);
  };

  const closeChat = () => {
    setActiveChat(null);
    setMessages([]);
    setTypingUsers([]);
  };

  const value = {
    // State
    onlineUsers,
    connections,
    connectionRequests,
    chatRooms,
    activeChat,
    messages,
    typingUsers,

    // Actions
    setActiveChat,
    openChat,
    closeChat,
    refreshConnections,
    refreshConnectionRequests,

    // Computed values
    isOnline: currentUser ? onlineUsers.some(user => user.id === currentUser.uid) : false,
    connectionCount: connections.length,
    pendingRequestsCount: connectionRequests.length,
    unreadChatsCount: chatRooms.filter(room => room.hasUnreadMessages).length,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};