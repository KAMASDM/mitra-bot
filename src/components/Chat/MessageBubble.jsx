import React from 'react';
import { format } from 'date-fns';
import DataCards from './DataCards';

const MessageBubble = ({ message, onDataAction }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isBot 
          ? 'bg-white text-gray-800 shadow-sm border' 
          : 'bg-primary text-white'
      }`}>
        {isBot && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs">🤗</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Gazra Mitra</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap">
          {message.text.includes('**') ? (
            // Render markdown-style bold text and lists
            message.text.split('\n').map((line, index) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <div key={index} className="font-semibold mb-1">
                    {line.replace(/\*\*/g, '')}
                  </div>
                );
              } else if (line.startsWith('🩺') || line.startsWith('🧠') || line.startsWith('-')) {
                return (
                  <div key={index} className="text-sm mb-1">
                    {line}
                  </div>
                );
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else {
                return (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                );
              }
            })
          ) : (
            message.text
          )}
        </div>
        
        {/* Display structured data if available */}
        {isBot && message.data && (
          <div className="mt-3">
            {/* Check if data has professionals property */}
            {message.data.professionals && message.data.professionals.length > 0 && (
              <DataCards 
                data={message.data.professionals} 
                type="professionals" 
                onAction={onDataAction}
              />
            )}
            {/* Check if data has jobs property */}
            {message.data.jobs && message.data.jobs.length > 0 && (
              <DataCards 
                data={message.data.jobs} 
                type="jobs" 
                onAction={onDataAction}
              />
            )}
            {/* Check if data is directly an array (doctors/professionals/jobs array) */}
            {Array.isArray(message.data) && message.data.length > 0 && (
              <DataCards 
                data={message.data} 
                type={
                  // Check for job-specific fields first
                  message.data[0]?.jobTitle || 
                  message.data[0]?.job_title || 
                  message.data[0]?.company || 
                  message.data[0]?.company_name
                    ? "jobs" 
                    : "professionals"
                } 
                onAction={onDataAction}
              />
            )}
          </div>
        )}
        
        <div className={`text-xs mt-1 ${
          isBot ? 'text-gray-400' : 'text-white/70'
        }`}>
          {format(message.timestamp, 'HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;