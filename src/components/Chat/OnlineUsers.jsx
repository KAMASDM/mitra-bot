import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { 
  UserPlusIcon, 
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { 
  sendConnectionRequest, 
  checkConnectionStatus,
  getChatRoom,
  respondToConnectionRequest 
} from '../../services/chatService';
import { toast } from 'react-hot-toast';

const OnlineUsers = ({ onUserSelect }) => {
  const { currentUser } = useAuth();
  const { onlineUsers, connections, connectionRequests, refreshConnections, refreshConnectionRequests } = useChat();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [currentUserIsProfessional, setCurrentUserIsProfessional] = useState(false);

  // Check if current user is a professional
  React.useEffect(() => {
    const checkProfessionalStatus = async () => {
      if (currentUser?.uid) {
        const { checkIfUserIsProfessional } = await import('../../services/chatService');
        const isProfessional = await checkIfUserIsProfessional(currentUser.uid);
        setCurrentUserIsProfessional(isProfessional);
        console.log(`👤 Current user is ${isProfessional ? 'a Professional' : 'a Regular User'}`);
      }
    };
    checkProfessionalStatus();
  }, [currentUser]);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 OnlineUsers component state:');
    console.log('  - Total online users:', onlineUsers.length);
    console.log('  - Current user ID:', currentUser?.uid);
    console.log('  - Current user is professional:', currentUserIsProfessional);
    console.log('  - Filtered count:', onlineUsers.filter(u => u.id !== currentUser?.uid).length);
    console.log('  - Users:', onlineUsers.map(u => ({ id: u.id, name: u.displayName, status: u.status, isProfessional: u.isProfessional })));
  }, [onlineUsers, currentUser, currentUserIsProfessional]);

  const handleRefreshUsers = async () => {
    console.log('🔄 Manually refreshing online users...');
    const { getOnlineUsers } = await import('../../services/chatService');
    try {
      const users = await getOnlineUsers(null, currentUser?.uid); // Pass currentUserId for role-based filtering
      console.log('📊 Manual refresh - fetched users:', users.length);
      console.log('👥 Users:', users.map(u => ({ id: u.id, name: u.displayName, status: u.status, email: u.email, isProfessional: u.isProfessional })));
    } catch (error) {
      console.error('❌ Error refreshing:', error);
    }
  };

  const handleDebugAllUsers = async () => {
    console.log('🔍 DEBUG: Fetching ALL users from database...');
    const { getAllUsersDebug } = await import('../../services/chatService');
    try {
      await getAllUsersDebug();
      toast.success('Check console for all users data');
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      toast.error('Error fetching users');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'available': return 'bg-status-online';
      case 'away': return 'bg-status-away';
      case 'busy': return 'bg-status-busy';
      default: return 'bg-status-offline';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
      case 'available': return 'Available';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'online':
      case 'available': return '🟢';
      case 'away': return '🟡';
      case 'busy': return '🔴';
      default: return '⚫';
    }
  };

  const getUserConnectionStatus = (userId) => {
    return connections.some(conn => conn.userData?.id === userId);
  };

  const handleConnectUser = async (user) => {
    if (!currentUser || isLoading) return;

    try {
      setIsLoading(true);
      
      // Check if already connected
      const isConnected = getUserConnectionStatus(user.id);
      if (isConnected) {
        // Open chat directly
        const chatRoom = await getChatRoom(currentUser.uid, user.id);
        onUserSelect?.(chatRoom);
        return;
      }

      // Check if connection request already exists
      const hasExistingRequest = connectionRequests.some(
        req => req.fromUserId === user.id || req.toUserId === user.id
      );

      if (hasExistingRequest) {
        toast.error('Connection request already exists');
        return;
      }

      setSelectedUser(user);
      setShowRequestModal(true);
    } catch (error) {
      console.error('Error connecting user:', error);
      toast.error('Failed to connect with user');
    } finally {
      setIsLoading(false);
    }
  };

  const sendRequest = async () => {
    if (!currentUser || !selectedUser) return;

    try {
      setIsLoading(true);
      await sendConnectionRequest(currentUser.uid, selectedUser.id, requestMessage);
      toast.success('Connection request sent!');
      setRequestMessage('');
      setShowRequestModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, response) => {
    try {
      setIsLoading(true);
      await respondToConnectionRequest(requestId, response, currentUser.uid);
      
      if (response === 'accepted') {
        toast.success('Connection request accepted!');
        await refreshConnections();
      } else {
        toast.success('Connection request rejected');
      }
      
      await refreshConnectionRequests();
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Failed to respond to request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-white border-r border-primary-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-primary-200 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-royal font-semibold text-white">
              {currentUserIsProfessional ? 'Online Clients' : 'Online Professionals'}
            </h2>
            <p className="text-xs text-white/70 mt-0.5">
              {currentUserIsProfessional 
                ? 'Users seeking support' 
                : 'Verified service providers'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDebugAllUsers}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              title="Debug: Show all users in database"
            >
              🔍 Debug
            </button>
            <button
              onClick={handleRefreshUsers}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Refresh users list"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">
                {onlineUsers.filter(u => u.id !== currentUser?.uid).length} 
              </span>
            </div>
          </div>
        </div>
        {/* Show current user role */}
        <div className="mt-2 text-xs text-white/80 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>You are {currentUserIsProfessional ? 'a Professional' : 'a User'} • Online</span>
        </div>
      </div>

      {/* Connection Requests */}
      {connectionRequests.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-secondary-50 to-primary-50 border-b border-primary-200">
          <h3 className="text-sm font-semibold text-primary-900 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-secondary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {connectionRequests.length}
            </div>
            Connection Request{connectionRequests.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {connectionRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg p-3 shadow-md border border-secondary-200 hover:border-secondary-400 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {request.userData?.photoURL ? (
                        <img 
                          src={request.userData.photoURL} 
                          alt={request.userData.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="w-8 h-8 text-secondary-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-900">
                        {request.userData?.displayName || 'Unknown User'}
                      </p>
                      {request.message && (
                        <p className="text-xs text-primary-600 mt-0.5">{request.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRequestResponse(request.id, 'accepted')}
                      disabled={isLoading}
                      className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                      title="Accept"
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleRequestResponse(request.id, 'rejected')}
                      disabled={isLoading}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Users List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3">
            {currentUserIsProfessional ? 'Available Clients' : 'Available Professionals'}
          </h3>
          <div className="space-y-2">
            {onlineUsers
              .filter(user => user.id !== currentUser?.uid)
              .length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">
                  {currentUserIsProfessional ? '👥' : '👨‍⚕️'}
                </div>
                <p className="text-sm text-gray-600">
                  No {currentUserIsProfessional ? 'clients' : 'professionals'} online right now
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Check back later
                </p>
              </div>
            ) : (
              onlineUsers
                .filter(user => user.id !== currentUser?.uid)
                .map((user) => {
                  const isConnected = getUserConnectionStatus(user.id);
                  return (
                    <div
                      key={user.id}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all cursor-pointer border border-transparent hover:border-primary-200 hover:shadow-sm"
                      onClick={() => handleConnectUser(user)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                      <div className="relative flex-shrink-0">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center shadow-md">
                            <UserCircleIcon className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status)} shadow-sm`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-primary-900 group-hover:text-primary-700 truncate">
                            {user.displayName || 'Anonymous User'}
                          </h4>
                          {user.isProfessional && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                              Professional
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 text-primary-500">
                            <span>{getStatusEmoji(user.status)}</span>
                            <span className="font-medium">{getStatusText(user.status)}</span>
                          </div>
                          {user.statusMessage && (
                            <span className="text-primary-400 truncate italic">
                              • {user.statusMessage}
                            </span>
                          )}
                          {user.role && (
                            <>
                              <span className="text-primary-400">•</span>
                              <span className="text-primary-500">{user.role}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      {isConnected ? (
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <ChatBubbleLeftIcon className="w-5 h-5 text-primary-600" />
                        </div>
                      ) : (
                        <div className="bg-secondary-100 p-2 rounded-lg">
                          <UserPlusIcon className="w-5 h-5 text-secondary-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Connection Request Modal */}
      {showRequestModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-royal-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {selectedUser.photoURL ? (
                    <img 
                      src={selectedUser.photoURL} 
                      alt={selectedUser.displayName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-14 h-14 text-primary-400" />
                  )}
                </div>
                <h3 className="text-lg font-royal font-semibold text-primary-800">
                  Connect with {selectedUser.displayName}
                </h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Introduction Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Hi! I'd like to connect with you..."
                  className="w-full p-3 border border-primary-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-primary-500 mt-1">
                  {requestMessage.length}/200 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedUser(null);
                    setRequestMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendRequest}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;