import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white text-gray-800 shadow-sm border rounded-lg px-4 py-2 max-w-xs">
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
            <span className="text-xs">🤗</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Gazra Mitra</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;