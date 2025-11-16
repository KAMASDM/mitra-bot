import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  UserCircleIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { 
  PROFESSIONAL_CATEGORIES, 
  subscribeToOnlineProfessionals,
  sendChatRequest 
} from '../../services/professionalChatService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfessionalList = ({ categoryId, onBack, onRequestSent }) => {
  const { currentUser } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequestTo, setSendingRequestTo] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const category = PROFESSIONAL_CATEGORIES[categoryId];

  useEffect(() => {
    if (!categoryId) return;

    setLoading(true);
    const unsubscribe = subscribeToOnlineProfessionals(categoryId, (profs) => {
      console.log(`📋 Received ${profs.length} professionals for ${categoryId}`);
      setProfessionals(profs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryId]);

  const handleSendRequest = async () => {
    if (!selectedProfessional || !currentUser) return;

    setSendingRequestTo(selectedProfessional.id);
    try {
      await sendChatRequest(
        currentUser.uid,
        selectedProfessional.id,
        requestMessage
      );
      
      toast.success('Chat request sent!');
      setShowRequestModal(false);
      setRequestMessage('');
      setSelectedProfessional(null);
      
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error('Error sending chat request:', error);
      if (error.message.includes('already exists')) {
        toast.error('You already have a pending request with this professional');
      } else {
        toast.error('Failed to send chat request');
      }
    } finally {
      setSendingRequestTo(null);
    }
  };

  const openRequestModal = (professional) => {
    setSelectedProfessional(professional);
    setShowRequestModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (!category) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-br ${category.color} text-white`}>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h2 className="font-bold text-lg">{category.name}</h2>
              <p className="text-xs opacity-90">
                {professionals.length} professional{professionals.length !== 1 ? 's' : ''} online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading professionals...</p>
            </div>
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center px-4">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">No Professionals Online</h3>
              <p className="text-gray-600 text-sm">
                There are no {category.name.toLowerCase()} available right now.
              </p>
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Back to Categories
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {professionals.map((professional, index) => {
              const fullName = professional.displayName || 
                `${professional.first_name || ''} ${professional.last_name || ''}`.trim();
              const specialization = professional.specialization || professional.specialty || category.description;
              const experience = professional.years_of_experience || 0;
              const rating = professional.rating || 0;
              const isVerified = professional.verification_status === 'VERIFIED';
              const location = professional.address || professional.city || 'Location not specified';

              return (
                <motion.div
                  key={professional.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {professional.photoURL ? (
                        <img
                          src={professional.photoURL}
                          alt={fullName}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${category.color} shadow-md`}>
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(professional.status)} rounded-full border-2 border-white`}></div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">
                            {fullName}
                          </h3>
                          {isVerified && (
                            <CheckBadgeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" title="Verified Professional" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {specialization}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        {experience > 0 && (
                          <span>💼 {experience} years</span>
                        )}
                        {rating > 0 && (
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>{rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <MapPinIcon className="w-3 h-3" />
                          <span className="truncate">{location}</span>
                        </div>
                      )}

                      {/* Biography */}
                      {professional.biography && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {professional.biography}
                        </p>
                      )}

                      {/* Send Request Button */}
                      <button
                        onClick={() => openRequestModal(professional)}
                        disabled={sendingRequestTo === professional.id}
                        className={`
                          w-full py-2 px-4 rounded-lg font-medium text-sm transition-all
                          ${sendingRequestTo === professional.id
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : `bg-gradient-to-r ${category.color} text-white hover:shadow-md`
                          }
                        `}
                      >
                        {sendingRequestTo === professional.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            Send Chat Request
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-royal-lg max-w-md w-full"
          >
            <div className="p-6">
              <div className="text-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-br ${category.color} text-white text-2xl`}>
                  {selectedProfessional.displayName?.charAt(0).toUpperCase() || category.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  Send Chat Request
                </h3>
                <p className="text-sm text-gray-600">
                  to {selectedProfessional.displayName || 'Professional'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself or describe what you need help with..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {requestMessage.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestMessage('');
                    setSelectedProfessional(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={sendingRequestTo === selectedProfessional.id}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all bg-gradient-to-r ${category.color} hover:shadow-md disabled:opacity-50`}
                >
                  {sendingRequestTo === selectedProfessional.id ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalList;
