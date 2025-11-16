import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getOnlineProfessionalsByCategory,
  getUserChatRooms 
} from '../services/professionalChatService';
import { checkIfUserIsProfessional } from '../services/chatService';

const ProfessionalChatContext = createContext();

export const useProfessionalChat = () => {
  const context = useContext(ProfessionalChatContext);
  if (!context) {
    throw new Error('useProfessionalChat must be used within a ProfessionalChatProvider');
  }
  return context;
};

export const ProfessionalChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [categoryCounts, setCategoryCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeChatRooms, setActiveChatRooms] = useState([]);
  const [isProfessional, setIsProfessional] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if current user is a professional
  useEffect(() => {
    if (!currentUser) {
      setIsProfessional(false);
      setLoading(false);
      return;
    }

    const checkProfessionalStatus = async () => {
      try {
        const professional = await checkIfUserIsProfessional(currentUser.uid);
        setIsProfessional(!!professional);
      } catch (error) {
        console.error('Error checking professional status:', error);
        setIsProfessional(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfessionalStatus();
  }, [currentUser]);

  // Load category counts
  useEffect(() => {
    if (!currentUser || isProfessional) return;

    const loadCategoryCounts = async () => {
      try {
        const counts = await getOnlineProfessionalsByCategory();
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error loading category counts:', error);
      }
    };

    loadCategoryCounts();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadCategoryCounts, 30000);
    return () => clearInterval(interval);
  }, [currentUser, isProfessional]);

  // Load active chat rooms
  useEffect(() => {
    if (!currentUser) return;

    const loadChatRooms = async () => {
      try {
        const rooms = await getUserChatRooms(currentUser.uid);
        setActiveChatRooms(rooms);
      } catch (error) {
        console.error('Error loading chat rooms:', error);
      }
    };

    loadChatRooms();

    // Refresh every 30 seconds
    const interval = setInterval(loadChatRooms, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const refreshChatRooms = async () => {
    if (!currentUser) return;
    try {
      const rooms = await getUserChatRooms(currentUser.uid);
      setActiveChatRooms(rooms);
    } catch (error) {
      console.error('Error refreshing chat rooms:', error);
    }
  };

  const value = {
    categoryCounts,
    selectedCategory,
    setSelectedCategory,
    activeChatRooms,
    isProfessional,
    loading,
    refreshChatRooms,
  };

  return (
    <ProfessionalChatContext.Provider value={value}>
      {children}
    </ProfessionalChatContext.Provider>
  );
};

export default ProfessionalChatContext;
