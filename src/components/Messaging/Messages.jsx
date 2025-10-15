import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  // Mock conversations data
  const conversations = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      lastMessage: 'Your appointment is confirmed for tomorrow at 10 AM',
      timestamp: '2 min ago',
      unread: 1,
      avatar: '👩‍⚕️',
      isOnline: true
    },
    {
      id: '2',
      name: 'Support Group',
      lastMessage: 'Welcome! Feel free to share your thoughts.',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: '👥',
      isOnline: false
    },
    {
      id: '3',
      name: 'Career Counselor',
      lastMessage: 'I found some great opportunities for you',
      timestamp: '3 hours ago',
      unread: 2,
      avatar: '💼',
      isOnline: true
    }
  ];

  // Mock online users
  const onlineUsers = [
    { id: '1', name: 'Alex', avatar: '👤', status: 'Available to chat' },
    { id: '2', name: 'Sam', avatar: '👤', status: 'Looking for support' },
    { id: '3', name: 'Jordan', avatar: '👤', status: 'New member' },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{t('messages')}</h1>
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full">
            <UserPlusIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Online Users */}
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('onlineUsers')} ({onlineUsers.length})</h3>
        <div className="flex space-x-3 overflow-x-auto">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex-shrink-0 text-center">
              <div className="relative">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                  {user.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate w-16">{user.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setActiveChat(conversation)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                      {conversation.avatar}
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <div className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 mb-4">
                Start a conversation with someone from the community or your healthcare providers.
              </p>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                Find people to chat with
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface Modal (simplified) */}
      {activeChat && (
        <div className="fixed inset-0 z-50 max-w-mobile mx-auto bg-white">
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <button
              onClick={() => setActiveChat(null)}
              className="text-primary hover:bg-primary/10 p-2 rounded-full"
            >
              ← Back
            </button>
            <div className="text-center">
              <h3 className="font-semibold">{activeChat.name}</h3>
              <p className="text-xs text-gray-500">
                {activeChat.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="w-10"></div>
          </div>
          
          <div className="flex-1 p-4 text-center text-gray-500">
            <div className="text-4xl mb-4">{activeChat.avatar}</div>
            <p>Chat interface would be implemented here</p>
            <p className="text-sm mt-2">This would include real-time messaging, file sharing, and more.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;