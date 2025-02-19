// src/services/messageStorage.js
class MessageStorageService {
  constructor() {
    this.dbName = 'ChatAppDB';
    this.dbVersion = 1;
    this.db = null;
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', { 
            keyPath: '_id' 
          });
          
          // 룸ID와 생성 시간으로 인덱스 생성
          store.createIndex('roomId', 'roomId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB 오픈 에러:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async saveMessage(message) {
    if (!message._id) {
      console.warn('메시지에 _id가 없습니다. 고유 ID를 생성합니다.');
      message._id = Date.now().toString();
    }
    
    await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      
      const request = store.put(message);
      
      request.onsuccess = () => resolve(message);
      request.onerror = (event) => {
        console.error('메시지 저장 에러:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getMessages(roomId) {
    await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      
      const index = store.index('roomId');
      const request = index.getAll(roomId);
      
      request.onsuccess = () => {
        // 생성 시간 순으로 정렬
        const messages = request.result
          .filter(msg => msg.roomId === roomId)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        resolve(messages);
      };
      
      request.onerror = (event) => {
        console.error('메시지 조회 에러:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async deleteOldMessages(roomId, keepCount = 100) {
    await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      
      const index = store.index('roomId');
      const request = index.getAll(roomId);
      
      request.onsuccess = () => {
        const messages = request.result
          .filter(msg => msg.roomId === roomId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 최근 메시지 keepCount개 제외하고 삭제
        if (messages.length > keepCount) {
          const messagesToDelete = messages.slice(keepCount);
          
          messagesToDelete.forEach(message => {
            store.delete(message._id);
          });
        }
        
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('오래된 메시지 삭제 에러:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async clearRoomMessages(roomId) {
    await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const index = store.index('roomId');
      
      const request = index.getAllKeys(roomId);
      
      request.onsuccess = () => {
        request.result.forEach(key => {
          store.delete(key);
        });
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('채팅방 메시지 삭제 에러:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // 주기적으로 모든 채팅방의 오래된 메시지 정리
  async cleanupAllRoomMessages() {
    await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const roomIds = [...new Set(request.result.map(msg => msg.roomId))];
        
        roomIds.forEach(roomId => {
          this.deleteOldMessages(roomId);
        });
        
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('전체 메시지 정리 에러:', event.target.error);
        reject(event.target.error);
      };
    });
  }
}

const messageStorageInstance = new MessageStorageService();
export default messageStorageInstance;
