import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DocsPage } from './components/DocsPage';
import { MathSolverPage } from './components/MathSolverPage';
import { SettingsModal } from './components/SettingsModal';
import { ChatMessage as ChatMessageType, ChatSession, FileAttachment, ModelType } from './types';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [model, setModel] = useState<ModelType>('gemini-3.8-flash');
  const [enableThinking, setEnableThinking] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'docs' | 'math'>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chats and active session saved in local storage
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('luraspark_chats');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThoughts, setStreamingThoughts] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (currentView === 'chat') {
      scrollToBottom();
    }
  }, [messages, streamingContent, streamingThoughts, currentView]);

  // Load messages whenever activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    try {
      const saved = localStorage.getItem(`luraspark_msgs_${activeChatId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch (e) {
      setMessages([]);
    }
  }, [activeChatId]);

  // Save chats helper
  const updateAndSaveChats = (newChats: ChatSession[]) => {
    setChats(newChats);
    try {
      localStorage.setItem('luraspark_chats', JSON.stringify(newChats));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // Save messages helper
  const updateAndSaveMessages = (chatId: string, newMessages: ChatMessageType[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(`luraspark_msgs_${chatId}`, JSON.stringify(newMessages));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveChatId(null);
    setMessages([]);
    setStreamingContent('');
    setStreamingThoughts('');
    setCurrentView('chat');
  };

  const handleSelectChat = (chatId: string) => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveChatId(chatId);
    setStreamingContent('');
    setStreamingThoughts('');
    setCurrentView('chat');
  };

  const handleDeleteChat = (chatId: string) => {
    const remaining = chats.filter((c) => c.id !== chatId);
    updateAndSaveChats(remaining);
    localStorage.removeItem(`luraspark_msgs_${chatId}`);

    if (activeChatId === chatId) {
      handleNewChat();
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    const updated = chats.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c));
    updateAndSaveChats(updated);
  };

  const handleTogglePinChat = (chatId: string, currentPin: boolean) => {
    const updated = chats.map((c) => (c.id === chatId ? { ...c, isPinned: currentPin } : c));
    updateAndSaveChats(updated);
  };

  const handleClearAllHistory = () => {
    setChats([]);
    setActiveChatId(null);
    setMessages([]);
    localStorage.removeItem('luraspark_chats');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('luraspark_msgs_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleSendMessage = async (promptText: string, attachments?: FileAttachment[]) => {
    if ((!promptText.trim() && (!attachments || attachments.length === 0)) || isStreaming) return;

    setCurrentView('chat');
    let targetChatId = activeChatId;

    // Create chat if on welcome screen
    if (!targetChatId) {
      targetChatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const title = promptText.length > 36
        ? `${promptText.substring(0, 36)}...`
        : promptText || (attachments?.[0]?.name ? `File: ${attachments[0].name}` : 'New chat');

      const newSession: ChatSession = {
        id: targetChatId,
        userId: 'local_user',
        title,
        model,
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedChatList = [newSession, ...chats];
      updateAndSaveChats(updatedChatList);
      setActiveChatId(targetChatId);
    }

    // Add user message with attachments
    const userMsg: ChatMessageType = {
      id: `msg_u_${Date.now()}`,
      chatId: targetChatId,
      userId: 'local_user',
      role: 'user',
      content: promptText || (attachments && attachments.length > 0 ? 'Sent file attachments' : ''),
      attachments,
      createdAt: new Date().toISOString(),
    };

    const currentMsgList = [...messages, userMsg];
    updateAndSaveMessages(targetChatId, currentMsgList);

    // Initialize Stream
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingThoughts('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const historyPayload = messages
      .filter((m) => m.role === 'user' || m.role === 'model')
      .map((m) => ({
        role: m.role as 'user' | 'model',
        content: m.content,
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          history: historyPayload,
          model,
          enableThinking,
          attachments,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream from server.');

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedThoughts = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.thought) {
                accumulatedThoughts += data.thought;
                setStreamingThoughts((prev) => prev + data.thought);
              }
              if (data.text) {
                accumulatedContent += data.text;
                setStreamingContent((prev) => prev + data.text);
              }
              if (data.error) {
                accumulatedContent += `\n\n*[Notice: ${data.error}]*`;
                setStreamingContent(accumulatedContent);
              }
            } catch (err) {
              // Ignore non-JSON SSE chunk
            }
          }
        }
      }

      // Finalize Model Message
      const modelMsg: ChatMessageType = {
        id: `msg_m_${Date.now()}`,
        chatId: targetChatId,
        userId: 'model',
        role: 'model',
        content: accumulatedContent || 'No response generated.',
        thoughts: accumulatedThoughts,
        createdAt: new Date().toISOString(),
      };

      const finalMsgList = [...currentMsgList, modelMsg];
      updateAndSaveMessages(targetChatId, finalMsgList);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream stopped by user.');
      } else {
        console.error('Chat generation error:', err);
        const errMsg: ChatMessageType = {
          id: `msg_err_${Date.now()}`,
          chatId: targetChatId,
          userId: 'model',
          role: 'model',
          content: `LuraSpark encountered an issue: ${err.message || 'Network error'}. Please try again.`,
          createdAt: new Date().toISOString(),
        };
        const finalMsgs = [...currentMsgList, errMsg];
        updateAndSaveMessages(targetChatId, finalMsgs);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingThoughts('');
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = () => {
    if (isStreaming || messages.length === 0) return;
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex !== -1) {
      const userMsg = messages[lastUserIndex];
      const prompt = userMsg.content;
      const atts = userMsg.attachments;
      const sliced = messages.slice(0, lastUserIndex);
      if (activeChatId) updateAndSaveMessages(activeChatId, sliced);
      handleSendMessage(prompt, atts);
    }
  };

  const handleEditUserQuery = (newContent: string) => {
    if (isStreaming) return;
    handleSendMessage(newContent);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#E3E3E3] font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onOpenDocs={() => setCurrentView('docs')}
        onOpenMathSolver={() => setCurrentView('math')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {currentView === 'docs' ? (
          <DocsPage onBackToChat={() => setCurrentView('chat')} />
        ) : currentView === 'math' ? (
          <MathSolverPage onBackToChat={() => setCurrentView('chat')} />
        ) : (
          <>
            {/* Top Header */}
            <Header
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              currentModel={model}
              onChangeModel={(newModel) => setModel(newModel)}
              enableThinking={enableThinking}
              onToggleThinking={() => setEnableThinking(!enableThinking)}
              onOpenDocs={() => setCurrentView('docs')}
              onOpenMathSolver={() => setCurrentView('math')}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Conversation Body / Welcome Hero */}
            <main className="flex-1 overflow-y-auto flex flex-col">
              {!activeChatId && messages.length === 0 ? (
                <WelcomeScreen
                  onSelectPrompt={(prompt) => handleSendMessage(prompt)}
                  onOpenDocs={() => setCurrentView('docs')}
                />
              ) : (
                <div className="flex-1 py-4 divide-y divide-white/5">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onRegenerate={msg.role === 'model' ? handleRegenerate : undefined}
                      onEdit={msg.role === 'user' ? handleEditUserQuery : undefined}
                    />
                  ))}

                  {/* Streaming Bubble */}
                  {isStreaming && (
                    <ChatMessage
                      message={{
                        id: 'temp_streaming',
                        chatId: activeChatId || 'temp',
                        userId: 'model',
                        role: 'model',
                        content: streamingContent,
                        thoughts: streamingThoughts,
                        createdAt: new Date().toISOString(),
                      }}
                      isStreaming={true}
                    />
                  )}

                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </main>

            {/* Bottom Floating Composer */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onStop={handleStop}
              isStreaming={isStreaming}
            />
          </>
        )}
      </div>

      {/* Settings Modal with Persistent Device Identifier */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        enableThinking={enableThinking}
        onToggleThinking={() => setEnableThinking(!enableThinking)}
        onClearHistory={handleClearAllHistory}
        chatsCount={chats.length}
      />
    </div>
  );
}
