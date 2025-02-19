// components/chat/CreateRoomModal.jsx
import React, { useState } from 'react';

const CreateRoomModal = ({ onClose, onCreateRoom }) => {
  const [roomData, setRoomData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom(roomData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">새 채팅방 만들기</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              방 이름
            </label>
            <input
              type="text"
              value={roomData.name}
              onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={roomData.description}
              onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;