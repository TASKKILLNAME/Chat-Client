// src/types/chat.ts
export interface Message {
    _id: string;
    sender: {
      _id: string;
      username: string;
    };
    text: string;
    createdAt: Date;
    readBy: Array<any>;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    isEdited?: boolean;
  }