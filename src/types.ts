export interface FileAttachment {
  name: string;
  type: string;
  base64: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  role: 'user' | 'model' | 'system';
  content: string;
  thoughts?: string;
  attachments?: FileAttachment[];
  createdAt: number | string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  model: string;
  isPinned?: boolean;
  createdAt: any;
  updatedAt: any;
}

export type ModelType = 'gemini-3.1-pro-preview' | 'gemini-3.8-flash';

export interface ChatStreamChunk {
  text?: string;
  thought?: string;
  done?: boolean;
  error?: string;
}
