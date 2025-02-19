// src/components/chat/Message.jsx
import React from 'react';

const Message = ({ 
  message, 
  isOwnMessage, 
  onEdit, 
  onDelete, 
  isEditing, 
  editText, 
  onEditChange, 
  onSaveEdit, 
  onCancelEdit 
}) => (
  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
    <div className="flex flex-col max-w-[70%]">
      <div className={`p-2 rounded-lg ${
        isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
      }`}>
        <div className="text-sm font-medium mb-1">
          {message.sender.username}
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editText}
              onChange={onEditChange}
              className="p-1 rounded border text-black"
            />
            <div className="flex gap-2">
              <button 
                onClick={onSaveEdit}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm"
              >
                저장
              </button>
              <button 
                onClick={onCancelEdit}
                className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.fileUrl ? (
              <div className="flex flex-col gap-1">
                {message.fileType?.startsWith('image/') ? (
                  <img 
                    src={message.fileUrl} 
                    alt={message.fileName}
                    className="max-w-full rounded"
                  />
                ) : (
                  <a 
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {message.fileName}
                  </a>
                )}
              </div>
            ) : (
              message.text
            )}
          </>
        )}
        {message.isEdited && !isEditing && (
          <span className="text-xs italic ml-1">(수정됨)</span>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1 flex gap-2">
        <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
        {message.readBy?.length > 0 && (
          <span>읽음 {message.readBy.length}</span>
        )}
        {isOwnMessage && !isEditing && (
          <div className="flex gap-2">
            <button 
              onClick={onEdit}
              className="text-blue-500 hover:underline"
            >
              수정
            </button>
            <button 
              onClick={onDelete}
              className="text-red-500 hover:underline"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default React.memo(Message);