import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to socket after ${attemptNumber} attempts`);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.forEach((listener, event) => {
        this.removeListener(event);
      });
    }
  }

  addListener(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }

  removeListener(event) {
    if (this.socket) {
      const callback = this.listeners.get(event);
      if (callback) {
        this.socket.off(event, callback);
        this.listeners.delete(event);
      }
    }
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  // 임시 퇴장 (다시 들어올 수 있음)
  leaveRoomTemporary(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  // 영구 퇴장 (채팅방에서 완전히 나가기)
  leaveRoomPermanently(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room_permanently', roomId);
    }
  }

  sendMessage(roomId, message) {
    if (this.socket) {
      this.socket.emit('send_message', { roomId, message });
    }
  }

  onMessage(callback) {
    this.addListener('receive_message', callback);
  }

  sendTypingStatus(roomId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing_status', { roomId, isTyping });
    }
  }

  onTypingStatus(callback) {
    this.addListener('typing_status', callback);
  }

  markMessageAsRead(messageId, roomId) {
    if (this.socket) {
      this.socket.emit('mark_as_read', { messageId, roomId });
    }
  }

  onMessageRead(callback) {
    this.addListener('message_read', callback);
  }

  editMessage(messageId, newText) {
    if (this.socket) {
      this.socket.emit('edit_message', { messageId, newText });
    }
  }

  deleteMessage(messageId) {
    if (this.socket) {
      this.socket.emit('delete_message', { messageId });
    }
  }

  onMessageEdited(callback) {
    this.addListener('message_edited', callback);
  }

  onMessageDeleted(callback) {
    this.addListener('message_deleted', callback);
  }

  uploadFile(file, roomId) {
    if (this.socket) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.socket.emit('upload_file', {
            roomId,
            file: reader.result,
            fileName: file.name,
            fileType: file.type
          }, (response) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response);
            }
          });
        };
        reader.readAsDataURL(file);
      });
    }
    return Promise.reject(new Error('Socket not connected'));
  }
    // 채팅방의 전체 메시지 히스토리 요청 메서드 추가
    fetchChatHistory(roomId, options = {}) {
      const { 
        limit = 50,  // 기본적으로 최근 50개 메시지 로드
        offset = 0 
      } = options;
  
      return new Promise((resolve, reject) => {
        if (this.socket) {
          this.socket.emit('fetch_chat_history', { 
            roomId, 
            limit, 
            offset 
          }, (response) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response.messages);
            }
          });
        } else {
          reject(new Error('Socket not connected'));
        }
      });
    }
  
    // 메시지 동기화 메서드 추가 (클라이언트의 로컬 메시지와 서버의 메시지 동기화)
    synchronizeMessages(roomId, localMessages) {
      return new Promise((resolve, reject) => {
        if (this.socket) {
          this.socket.emit('sync_messages', {
            roomId,
            localMessages
          }, (response) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response.syncedMessages);
            }
          });
        } else {
          reject(new Error('Socket not connected'));
        }
      });
    }
  
    // 메시지 동기화 이벤트 리스너
    onMessageSync(callback) {
      this.addListener('messages_synced', callback);
    }
  
    // 오프라인 메시지 지원 (네트워크 연결이 불안정할 때)
    cacheOfflineMessage(message) {
      const offlineMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
      offlineMessages.push(message);
      localStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
    }
  
    // 오프라인 메시지 동기화
    syncOfflineMessages(roomId) {
      const offlineMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
      
      if (offlineMessages.length > 0) {
        if (this.socket) {
          this.socket.emit('sync_offline_messages', {
            roomId,
            messages: offlineMessages
          }, (response) => {
            if (response.success) {
              // 성공적으로 동기화되면 로컬 오프라인 메시지 초기화
              localStorage.removeItem('offlineMessages');
            }
          });
        }
      }
    }
  }
const socketService = new SocketService();
export default socketService; 
