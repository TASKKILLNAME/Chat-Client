// src/pages/ChatPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import InviteModal from '../components/chat/InviteModal';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await chatAPI.getRooms();
      setRooms(response.data);
      setError(null);
    } catch (err) {
      console.error('채팅방 로드 오류:', err);
      setError('채팅방을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreateRoom = useCallback(async (roomData) => {
    try {
      const response = await chatAPI.createRoom(roomData);
      setRooms(prev => [...prev, response.data]);
      setIsCreateRoomModalOpen(false);
    } catch (err) {
      console.error('채팅방 생성 오류:', err);
      alert('채팅방 생성에 실패했습니다.');
    }
  }, []);

  const handleRoomEnter = useCallback((roomId) => {
    navigate(`/chat/${roomId}`);
  }, [navigate]);

  const handleInvite = useCallback((roomId) => {
    setSelectedRoomId(roomId);
    setIsInviteModalOpen(true);
  }, []);

  const handleInviteSubmit = useCallback(async (invitedUsers) => {
    try {
      await chatAPI.inviteToRoom(selectedRoomId, invitedUsers);
      await fetchRooms();
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error('초대 오류:', error);
      alert('사용자 초대에 실패했습니다.');
    }
  }, [selectedRoomId, fetchRooms]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={fetchRooms}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">채팅방 목록</h1>
        <div className="flex items-center space-x-4">
          <span>환영합니다, {user?.username}님!</span>
          <button 
            onClick={() => setIsCreateRoomModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            채팅방 생성
          </button>
          <button 
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          아직 생성된 채팅방이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div 
              key={room._id} 
              className="bg-white shadow rounded-lg p-4 hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              <p className="text-gray-600 mb-4">{room.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <div>생성자: {room.createdBy.username}</div>
                  <div>참여자: {room.participants.length}명</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleInvite(room._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  >
                    초대
                  </button>
                  <button 
                    onClick={() => handleRoomEnter(room._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    입장
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateRoomModalOpen && (
        <CreateRoomModal 
          onClose={() => setIsCreateRoomModalOpen(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}

      {isInviteModalOpen && (
        <InviteModal 
          roomId={selectedRoomId}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleInviteSubmit}
        />
      )}
    </div>
  );
};

export default ChatPage;