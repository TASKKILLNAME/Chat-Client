// src/components/chat/MessageInput.jsx
import React from 'react';
import { useDropzone } from 'react-dropzone';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSubmit,
  onEmojiClick,
  showEmojiPicker,
  onToggleEmojiPicker,
  onFileUpload
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    onDrop: onFileUpload
  });

  return (
    <div className="p-4 bg-gray-100">
      <div {...getRootProps()} className="mb-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
        <input {...getInputProps()} />
        <p>파일을 드래그하거나 클릭하여 업로드하세요</p>
        <p className="text-sm text-gray-500">지원 형식: 이미지, PDF, DOC, DOCX (최대 5MB)</p>
      </div>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={onMessageChange}
            className="w-full p-2 border rounded-lg pr-24"
            placeholder="메시지를 입력하세요"
          />
          <button
            type="button"
            onClick={onToggleEmojiPicker}
            className="absolute right-14 top-2 text-gray-500 hover:text-gray-700"
          >
            😊
          </button>
          <button 
            type="submit" 
            className="absolute right-2 top-1 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            전송
          </button>
        </div>
        
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width={300}
              height={400}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default React.memo(MessageInput);