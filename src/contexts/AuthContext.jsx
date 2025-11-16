import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { sendWelcomeEmail } from '../services/emailService';

const AuthContext = createContext();

// Custom hook for using auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          displayName: displayName || '',
          email,
          photoURL: photoURL || '',
          userLanguage: 'en', // Default language
          fcmToken: '',
          blockedUsers: [],
          status: 'offline', // Initialize status field
          created_at: createdAt,
          lastSeen: createdAt,
          ...additionalData
        });

        // Also create a client profile
        const clientRef = doc(db, 'clients', user.uid);
        await setDoc(clientRef, {
          userId: user.uid,
          email,
          displayName: displayName || '',
          status: 'active',
          created_at: createdAt
        });

        // Send welcome email to new users
        try {
          await sendWelcomeEmail(
            email,
            displayName || 'Friend',
            additionalData.userLanguage || 'en'
          );
          console.log('Welcome email sent successfully');
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't throw error - email failure shouldn't block registration
        }
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }

    return userRef;
  };

  // Sign up with email and password
  const signUp = async (email, password, additionalData = {}) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(user, additionalData);
    return user;
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    await createUserProfile(user);
    return user;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createUserProfile(user);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { useAuth };