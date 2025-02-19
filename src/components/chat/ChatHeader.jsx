// src/components/chat/ChatHeader.jsx
import React from 'react';

const ChatHeader = ({ onLeave }) => (
  <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
    <h3 className="text-lg font-semibold">채팅방</h3>
    <button 
      onClick={onLeave}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      나가기
    </button>
  </div>
);

export default ChatHeader;