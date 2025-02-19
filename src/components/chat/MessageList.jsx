// src/components/chat/MessageList.jsx
import React, { useRef, useEffect } from 'react';
import Message from './Message';

const MessageList = ({ 
  messages, 
  currentUserId, 
  editingMessageId,
  editText,
  onEditChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  typingIndicator 
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <Message
          key={msg._id}
          message={msg}
          isOwnMessage={msg.sender._id === currentUserId}
          isEditing={editingMessageId === msg._id}
          editText={editText}
          onEditChange={onEditChange}
          onEdit={() => onStartEdit(msg)}
          onSaveEdit={() => onSaveEdit(msg._id)}
          onCancelEdit={onCancelEdit}
          onDelete={() => onDelete(msg._id)}
        />
      ))}
      {typingIndicator}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(MessageList);