import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ChatProvider } from './contexts/ChatContext';
import { ProfessionalChatProvider } from './contexts/ProfessionalChatContext';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import Services from './components/Services/Services';
import Chat from './components/Chat/Chat';
import News from './components/News/News';
import Resources from './components/Resources/Resources';
import Profile from './components/Profile/Profile';
import Layout from './components/Layout/Layout';
import SplashScreen from './components/Common/SplashScreen';
import PWAInstallPrompt from './components/Common/PWAInstallPrompt';
import ProfessionalDashboard from './components/Professional/ProfessionalDashboard';
import AppointmentsCalendar from './components/Professional/AppointmentsCalendar';
import AvailabilityManager from './components/Professional/AvailabilityManager';
import ProfessionalRegistration from './components/Professional/ProfessionalRegistration';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if user has seen splash before
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem('hasSeenSplash', 'true');
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Router>
      <PWAInstallPrompt />
      <div className="App min-h-screen bg-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute>
              <Layout>
                <Services />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/news" element={
            <ProtectedRoute>
              <Layout>
                <News />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
              <Layout>
                <Resources />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Professional Routes */}
          <Route path="/professional/register" element={
            <ProtectedRoute>
              <ProfessionalRegistration />
            </ProtectedRoute>
          } />
          <Route path="/professional/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <ProfessionalDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professional/appointments" element={
            <ProtectedRoute>
              <Layout>
                <AppointmentsCalendar />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/professional/availability" element={
            <ProtectedRoute>
              <Layout>
                <AvailabilityManager />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ChatProvider>
          <ProfessionalChatProvider>
            <AppContent />
          </ProfessionalChatProvider>
        </ChatProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
