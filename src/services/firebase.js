// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIbt0doFhC23oyvpJqk6yEpC1bzOR5-uA",
  authDomain: "gazra-mitra.firebaseapp.com",
  projectId: "gazra-mitra",
  storageBucket: "gazra-mitra.firebasestorage.app",
  messagingSenderId: "130808551513",
  appId: "1:130808551513:web:d4723486d74bc94287f948",
  measurementId: "G-2G549BQ0LZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const messaging = getMessaging(app);
export const analytics = getAnalytics(app);

export default app;