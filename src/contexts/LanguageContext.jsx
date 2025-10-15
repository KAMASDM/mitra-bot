import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { getTranslation, LANGUAGES } from '../utils/translations';

const LanguageContext = createContext();

// Custom hook for using language context
function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { currentUser } = useAuth();

  // Get translation for a key
  const t = (key, fallback) => {
    return getTranslation(currentLanguage, key, fallback);
  };

  // Change language
  const changeLanguage = async (languageCode) => {
    setCurrentLanguage(languageCode);
    
    // Save to local storage
    localStorage.setItem('gazra-mitra-language', languageCode);
    
    // Update user profile if logged in
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          userLanguage: languageCode
        });
      } catch (error) {
        console.error('Error updating user language:', error);
      }
    }
  };

  // Initialize language from localStorage or user profile
  useEffect(() => {
    const savedLanguage = localStorage.getItem('gazra-mitra-language');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Update language when user changes
  useEffect(() => {
    if (currentUser) {
      // Fetch user's preferred language from Firestore
      // This would be done in a real app
    }
  }, [currentUser]);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { useLanguage };