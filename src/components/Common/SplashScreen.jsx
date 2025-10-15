import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Auto complete after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for fade out animation
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-main bg-cover bg-center flex items-center justify-center z-50 transition-opacity duration-500 opacity-0">
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-main bg-cover bg-center flex items-center justify-center z-50">
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-white/90 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center shadow-royal">
            <img 
              src="/mitra.png" 
              alt="Mitra" 
              className="w-20 h-20 rounded-full"
            />
          </div>
        </div>

        {/* App Name */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Gazra Mitra
          </h1>
          <p className="text-xl text-white/90 drop-shadow-md font-medium">
            Your Community Support Partner
          </p>
        </div>

        {/* Tagline */}
        <div className="mb-8">
          <p className="text-white/80 text-lg drop-shadow-md">
            Connect • Support • Thrive
          </p>
          <p className="text-white/70 text-sm mt-2 drop-shadow-md">
            Empowering LGBTQAI+ community and women with essential services
          </p>
        </div>

        {/* Loading Progress */}
        <div className="w-64 mx-auto">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm border border-white/30">
            <div 
              className="bg-gradient-to-r from-primary-400 to-secondary-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/70 text-xs mt-2 drop-shadow-md">
            Loading your community platform...
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg mx-auto flex items-center justify-center mb-2 border border-white/30">
              <span className="text-white text-xl">💼</span>
            </div>
            <p className="text-white/80 text-xs drop-shadow-md">Find Jobs</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg mx-auto flex items-center justify-center mb-2 border border-white/30">
              <span className="text-white text-xl">🏥</span>
            </div>
            <p className="text-white/80 text-xs drop-shadow-md">Healthcare</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg mx-auto flex items-center justify-center mb-2 border border-white/30">
              <span className="text-white text-xl">💬</span>
            </div>
            <p className="text-white/80 text-xs drop-shadow-md">Community</p>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onComplete, 300);
          }}
          className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/20 transition-colors border border-white/30"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;