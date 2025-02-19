// src/hooks/useChat.js
import { useState, useRef, useEffect, useCallback } from 'react';
import SocketService from '../services/socket';
import { chatAPI } from '../services/api';
import MessageStorageService from '../services/messageStorage';

export const useChat = (roomId, userId) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [participants, setParticipants] = useState([]);
  const typingTimeoutRef = useRef(null);

  // 메시지 로드 및 동기화 로직
  const loadAndSyncMessages = useCallback(async () => {
    try {
      // 로컬 스토리지에서 캐시된 메시지 확인
      const cachedMessages = localStorage.getItem(`chatroom_${roomId}_messages`);
      const parsedCachedMessages = cachedMessages ? JSON.parse(cachedMessages) : [];

      // 서버에서 메시지 로드
      const serverMessagesResponse = await chatAPI.getMessages(roomId);
      const serverMessages = serverMessagesResponse.data;

      // IndexedDB에서 메시지 로드
      const localMessages = await MessageStorageService.getMessages(roomId);

      // 메시지 병합 및 중복 제거
      const combinedMessages = [
        ...serverMessages,
        ...parsedCachedMessages,
        ...localMessages.filter(
          local => !serverMessages.some(server => server._id === local._id)
        )
      ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // 중복 제거
      const uniqueMessages = Array.from(
        new Map(combinedMessages.map(m => [m._id, m])).values()
      );

      // 상태와 로컬 스토리지, IndexedDB 업데이트
      setMessages(uniqueMessages);
      localStorage.setItem(`chatroom_${roomId}_messages`, JSON.stringify(uniqueMessages));
      
      // 서버 메시지를 IndexedDB에 저장
      for (let message of serverMessages) {
        await MessageStorageService.saveMessage(message);
      }

      // 오래된 메시지 정리 (옵션)
      await MessageStorageService.deleteOldMessages(roomId);

    } catch (error) {
      console.error('메시지 로드 오류:', error);
    }
  }, [roomId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    SocketService.connect(token);
    SocketService.joinRoom(roomId);

    // 초기 메시지 로드
    loadAndSyncMessages();

    // 참가자 목록 로드
    const loadParticipants = async () => {
      try {
        const response = await chatAPI.getRoomParticipants(roomId);
        setParticipants(response.data);
      } catch (error) {
        console.error('참가자 목록 로드 오류:', error);
      }
    };
    loadParticipants();

    // 메시지 수신 리스너
    const handleReceiveMessage = async (message) => {
      // 메시지를 상태와 IndexedDB에 저장
      setMessages(prev => {
        // 중복 메시지 방지
        const isDuplicate = prev.some(msg => msg._id === message._id);
        const updatedMessages = isDuplicate 
          ? prev 
          : [...prev, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // 로컬 스토리지 업데이트
        localStorage.setItem(`chatroom_${roomId}_messages`, JSON.stringify(updatedMessages));
        
        return updatedMessages;
      });

      // IndexedDB에 메시지 저장
      await MessageStorageService.saveMessage(message);

      // 자신의 메시지가 아니면 읽음 표시
      if (message.sender._id !== userId) {
        SocketService.markMessageAsRead(message._id, roomId);
      }
    };

    // 타이핑 상태 리스너
    const handleTypingStatus = ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    // 참가자 업데이트 리스너
    const handleParticipantsUpdate = (updatedParticipants) => {
      setParticipants(updatedParticipants);
    };

    // 소켓 이벤트 리스너 등록
    SocketService.onMessage(handleReceiveMessage);
    SocketService.onTypingStatus(handleTypingStatus);
    SocketService.addListener('room_users_updated', handleParticipantsUpdate);

    // 클린업 함수
    return () => {
      SocketService.leaveRoomTemporary(roomId);
      SocketService.disconnect();
      
      // 소켓 이벤트 리스너 제거
      SocketService.removeListener('receive_message', handleReceiveMessage);
      SocketService.removeListener('typing_status', handleTypingStatus);
      SocketService.removeListener('room_users_updated', handleParticipantsUpdate);
    };
  }, [roomId, userId, loadAndSyncMessages]);

  // 타이핑 타임아웃 핸들러
  const handleTypingTimeout = useCallback((callback) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(callback, 1000);
  }, []);

  // 메시지 전송 시 IndexedDB에도 저장
  const sendMessage = useCallback(async (messageData) => {
    try {
      // 메시지를 서버와 IndexedDB에 저장
      SocketService.sendMessage(roomId, messageData);
      await MessageStorageService.saveMessage(messageData);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
    }
  }, [roomId]);

  // 타이핑 상태 전송
  const sendTypingStatus = useCallback((isTyping) => {
    SocketService.sendTypingStatus(roomId, isTyping);
  }, [roomId]);

  return {
    messages,
    setMessages,
    typingUsers,
    participants,
    sendMessage,
    sendTypingStatus,
    loadAndSyncMessages,
    handleTypingTimeout
  };
};