import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  UserCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  getPendingChatRequests, 
  respondToChatRequest 
} from '../../services/professionalChatService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistance } from 'date-fns';
import toast from 'react-hot-toast';

const PendingRequestsPanel = ({ onRequestResponded }) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    loadRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [currentUser.uid]);

  const loadRequests = async () => {
    try {
      const pendingRequests = await getPendingChatRequests(currentUser.uid);
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, accept) => {
    setRespondingTo(requestId);
    
    try {
      const result = await respondToChatRequest(requestId, accept);
      
      if (accept && result.chatRoomId) {
        toast.success('Chat request accepted!');
        if (onRequestResponded) {
          onRequestResponded(result.chatRoomId);
        }
      } else {
        toast.success('Chat request declined');
      }
      
      // Reload requests
      await loadRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    } finally {
      setRespondingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClockIcon className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No pending requests</p>
          <p className="text-gray-500 text-sm mt-1">New chat requests will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <AnimatePresence>
        {requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {request.userData?.photoURL ? (
                  <img
                    src={request.userData.photoURL}
                    alt={request.userData.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                    {request.userData?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {request.userData?.displayName || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {request.createdAt && formatDistance(
                        request.createdAt.toDate ? request.createdAt.toDate() : new Date(request.createdAt),
                        new Date(),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {request.message}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(request.id, true)}
                    disabled={respondingTo === request.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Accept</span>
                  </button>
                  
                  <button
                    onClick={() => handleRespond(request.id, false)}
                    disabled={respondingTo === request.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Decline</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PendingRequestsPanel;
