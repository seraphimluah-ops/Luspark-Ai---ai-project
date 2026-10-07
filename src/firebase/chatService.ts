import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { ChatMessage, ChatSession } from '../types';

export const chatService = {
  // Subscribe to user's chat sessions
  subscribeUserChats: (
    userId: string,
    callback: (chats: ChatSession[]) => void,
    onError?: (error: Error) => void
  ) => {
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const chats: ChatSession[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          chats.push({
            id: docSnap.id,
            userId: data.userId,
            title: data.title || 'Untitled Chat',
            model: data.model || 'gemini-3.1-pro-preview',
            isPinned: data.isPinned || false,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          });
        });
        callback(chats);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'chats');
        } catch (wrapped) {
          if (onError) onError(wrapped as Error);
        }
      }
    );
  },

  // Subscribe to messages in a chat session
  subscribeMessages: (
    chatId: string,
    userId: string,
    callback: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void
  ) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          messages.push({
            id: docSnap.id,
            chatId: data.chatId || chatId,
            userId: data.userId,
            role: data.role,
            content: data.content || '',
            thoughts: data.thoughts || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          });
        });
        callback(messages);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
        } catch (wrapped) {
          if (onError) onError(wrapped as Error);
        }
      }
    );
  },

  // Create a new chat session
  createChat: async (
    chatId: string,
    userId: string,
    title: string,
    model: string = 'gemini-3.1-pro-preview'
  ): Promise<void> => {
    const path = `chats/${chatId}`;
    try {
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        id: chatId,
        userId,
        title,
        model,
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Update chat title or model
  updateChat: async (
    chatId: string,
    updates: { title?: string; model?: string; isPinned?: boolean }
  ): Promise<void> => {
    const path = `chats/${chatId}`;
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Save a message into a chat
  saveMessage: async (
    chatId: string,
    message: ChatMessage
  ): Promise<void> => {
    const path = `chats/${chatId}/messages/${message.id}`;
    try {
      const msgRef = doc(db, 'chats', chatId, 'messages', message.id);
      const data: Record<string, any> = {
        id: message.id,
        chatId,
        userId: message.userId,
        role: message.role,
        content: message.content,
        createdAt: serverTimestamp(),
      };
      if (message.thoughts) {
        data.thoughts = message.thoughts;
      }
      await setDoc(msgRef, data);

      // Also touch the parent chat's updatedAt
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Delete chat and all its subcollection messages
  deleteChat: async (chatId: string): Promise<void> => {
    const path = `chats/${chatId}`;
    try {
      // First delete sub-messages
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const msgSnap = await getDocs(messagesRef);
      const batch = writeBatch(db);
      msgSnap.forEach((mDoc) => {
        batch.delete(mDoc.ref);
      });
      batch.delete(doc(db, 'chats', chatId));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },
};
