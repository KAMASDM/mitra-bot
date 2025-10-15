import React from 'react';

const QuickReplies = ({ replies, onReplyClick }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 ml-4">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReplyClick(reply)}
          className="px-3 py-2 bg-white border border-primary-300 text-primary-700 rounded-full text-sm hover:bg-primary-50 hover:border-primary-500 hover:text-primary-800 transition-all duration-200 shadow-sm font-medium"
        >
          {reply.text}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;