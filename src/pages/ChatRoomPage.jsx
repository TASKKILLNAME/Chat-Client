// src/pages/ChatRoomPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import SocketService from '../services/socket';
import MessageStorageService from '../services/messageStorage';
import ChatHeader from '../components/chat/ChatHeader';
import ParticipantList from '../components/chat/ParticipantList';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';

const ChatRoomPage = () => {
 const { roomId } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 const [newMessage, setNewMessage] = useState('');
 const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 const [editingMessageId, setEditingMessageId] = useState(null);
 const [editText, setEditText] = useState('');

 const {
   messages,
   setMessages,
   typingUsers,
   handleTypingTimeout,
   participants,
   sendMessage,
   loadAndSyncMessages
 } = useChat(roomId, user.id);

 // ChatRoomPage.jsx의 handleLeaveRoom 함수 수정
const handleLeaveRoom = useCallback(async () => {
  if (!window.confirm('채팅방을 나가시겠습니까?')) return;
  
  try {
    // 로컬 스토리지 메시지 유지
    // localStorage.removeItem(`chatroom_${roomId}_messages`); 삭제
    // MessageStorageService.clearRoomMessages(roomId); 삭제
    
    await SocketService.leaveRoomPermanently(roomId);
    navigate('/chat');
  } catch (error) {
    console.error('채팅방 나가기 오류:', error);
    alert('채팅방 나가기에 실패했습니다.');
  }
}, [roomId, navigate]);

 const handleSendMessage = useCallback(async (e) => {
   e.preventDefault();
   if (!newMessage.trim()) return;

   const messageData = {
     _id: Date.now().toString(), // 고유 ID 생성
     text: newMessage,
     roomId, // 룸 ID 추가
     sender: {
       _id: user.id,
       username: user.username
     },
     createdAt: new Date(),
     readBy: []
   };

   // 메시지를 상태와 서버, 로컬 스토리지에 전송
   setMessages(prev => {
     const updatedMessages = [...prev, messageData];
     // 로컬 스토리지에 메시지 저장
     localStorage.setItem(`chatroom_${roomId}_messages`, JSON.stringify(updatedMessages));
     return updatedMessages;
   });

   await sendMessage(messageData);
   
   setNewMessage('');
   setShowEmojiPicker(false);
 }, [newMessage, roomId, user, sendMessage, setMessages]);

 const handleMessageTyping = useCallback((e) => {
   setNewMessage(e.target.value);
   handleTypingTimeout(() => {
     SocketService.sendTypingStatus(roomId, false);
   });
   SocketService.sendTypingStatus(roomId, true);
 }, [roomId, handleTypingTimeout]);

 const handleStartEdit = useCallback((message) => {
   setEditingMessageId(message._id);
   setEditText(message.text);
 }, []);

 const handleSaveEdit = useCallback(async (messageId) => {
   if (!editText.trim()) return;
   
   try {
     await SocketService.editMessage(messageId, editText);
     setEditingMessageId(null);
     setEditText('');
   } catch (error) {
     console.error('메시지 수정 오류:', error);
     alert('메시지 수정에 실패했습니다.');
   }
 }, [editText]);

 const handleDeleteMessage = useCallback(async (messageId) => {
   if (!window.confirm('메시지를 삭제하시겠습니까?')) return;
   
   try {
     await SocketService.deleteMessage(messageId);
   } catch (error) {
     console.error('메시지 삭제 오류:', error);
     alert('메시지 삭제에 실패했습니다.');
   }
 }, []);

 const handleEmojiClick = useCallback((emojiData) => {
   setNewMessage(prev => prev + emojiData.emoji);
 }, []);

 const handleFileUpload = useCallback(async (acceptedFiles) => {
   try {
     const file = acceptedFiles[0];
     if (file.size > 5 * 1024 * 1024) {
       alert('파일 크기는 5MB를 초과할 수 없습니다.');
       return;
     }
     await SocketService.uploadFile(file, roomId);
   } catch (error) {
     console.error('File upload error:', error);
     alert('파일 업로드에 실패했습니다.');
   }
 }, [roomId]);

 const renderTypingIndicator = useCallback(() => {
   const typingUsersArray = Array.from(typingUsers);
   if (typingUsersArray.length === 0) return null;

   const getUsername = (userId) => {
     const participant = participants.find(p => p._id === userId);
     return participant ? participant.username : '알 수 없는 사용자';
   };

   return (
     <div className="text-gray-500 text-sm italic">
       {typingUsersArray.length === 1 
         ? `${getUsername(typingUsersArray[0])}님이 입력 중...`
         : '여러 명이 입력 중...'}
     </div>
   );
 }, [typingUsers, participants]);

 // 페이지 로드 시 메시지 복원 로직
 useEffect(() => {
   loadAndSyncMessages();
 }, [loadAndSyncMessages]);

 return (
   <div className="flex flex-col h-screen">
     <ChatHeader onLeave={handleLeaveRoom} />
     <ParticipantList participants={participants} />
     <MessageList
       messages={messages}
       currentUserId={user.id}
       editingMessageId={editingMessageId}
       editText={editText}
       onEditChange={(e) => setEditText(e.target.value)}
       onStartEdit={handleStartEdit}
       onSaveEdit={handleSaveEdit}
       onCancelEdit={() => setEditingMessageId(null)}
       onDelete={handleDeleteMessage}
       typingIndicator={renderTypingIndicator()}
     />
     <MessageInput
       newMessage={newMessage}
       onMessageChange={handleMessageTyping}
       onSubmit={handleSendMessage}
       onEmojiClick={handleEmojiClick}
       showEmojiPicker={showEmojiPicker}
       onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
       onFileUpload={handleFileUpload}
     />
   </div>
 );
};

export default ChatRoomPage;