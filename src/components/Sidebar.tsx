import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Pencil,
  Check,
  X,
  Search,
  BookOpen,
  Calculator,
  Settings,
} from 'lucide-react';
import { ChatSession } from '../types';
import { MBLogo } from './MBLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onTogglePinChat: (chatId: string, currentPin: boolean) => void;
  onOpenDocs: () => void;
  onOpenMathSolver: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  onOpenDocs,
  onOpenMathSolver,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const recentChats = filteredChats.filter((c) => !c.isPinned);

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameChat(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#1e1f20] md:bg-[#18191b] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top: + New Chat & Features */}
        <div className="p-3.5 space-y-2">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1a1a1c] hover:bg-[#282a2d] text-zinc-300 hover:text-white text-sm font-medium transition-colors cursor-pointer border border-white/5 group shadow-sm"
          >
            <Plus className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>New chat</span>
          </button>

          {/* Math Solver Navigation in Burger Button Drawer */}
          <button
            type="button"
            onClick={() => {
              onOpenMathSolver();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-400" />
              <span>Math Solving</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono group-hover:text-white">Neural →</span>
          </button>

          {/* Docs Button in Burger Drawer */}
          <button
            type="button"
            onClick={() => {
              onOpenDocs();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-sky-300 border border-sky-500/20 text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sky-400" />
              <span>LuraSpark Docs</span>
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-white">By Mark Beranio →</span>
          </button>

          {/* Search bar */}
          {chats.length > 2 && (
            <div className="relative pt-1">
              <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#131314] text-xs text-zinc-300 placeholder-zinc-500 rounded-xl border border-white/5 focus:outline-none focus:border-zinc-700"
              />
            </div>
          )}
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3 select-none">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-medium text-zinc-500">
                Pinned
              </div>
              <div className="mt-1 space-y-0.5">
                {pinnedChats.map((chat) => renderChatItem(chat))}
              </div>
            </div>
          )}

          {/* Recent Chats */}
          <div>
            <div className="px-3 py-1 text-[11px] font-medium text-zinc-500">
              Recent
            </div>
            {recentChats.length === 0 && pinnedChats.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-zinc-600">
                <MessageSquare className="h-4 w-4 mx-auto mb-2 opacity-30" />
                No recent chats
              </div>
            ) : (
              <div className="mt-1 space-y-0.5">
                {recentChats.map((chat) => renderChatItem(chat))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Utility Actions */}
        <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <MBLogo size={18} className="h-4 w-4" />
            <span className="text-[11px] text-zinc-500">LuraSpark AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSettings}
              title="Device Identifier & Settings"
              className="text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 p-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={onOpenDocs}
              className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="h-3 w-3" />
              <span>Docs</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  function renderChatItem(chat: ChatSession) {
    const isActive = activeChatId === chat.id;
    const isEditing = editingChatId === chat.id;

    return (
      <div
        key={chat.id}
        onClick={() => {
          onSelectChat(chat.id);
          if (window.innerWidth < 768) onClose();
        }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-full text-xs transition-colors cursor-pointer ${
          isActive
            ? 'bg-[#282a2d] text-white font-medium'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-zinc-500'}`} />
          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={editingTitle}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(chat.id, e as any);
                if (e.key === 'Escape') handleCancelRename(e as any);
              }}
              className="w-full bg-[#141517] text-white px-2 py-0.5 rounded-md text-xs focus:outline-none ring-1 ring-blue-500"
            />
          ) : (
            <span className="truncate">{chat.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={(e) => handleSaveRename(chat.id, e)}
                title="Save"
                className="p-1 hover:text-white hover:bg-white/10 rounded cursor-pointer"
              >
                <Check className="h-3 w-3 text-emerald-400" />
              </button>
              <button
                type="button"
                onClick={handleCancelRename}
                title="Cancel"
                className="p-1 hover:text-white hover:bg-white/10 rounded cursor-pointer"
              >
                <X className="h-3 w-3 text-rose-400" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePinChat(chat.id, !chat.isPinned);
                }}
                title={chat.isPinned ? 'Unpin' : 'Pin'}
                className={`p-1 hover:text-white hover:bg-white/10 rounded cursor-pointer ${
                  chat.isPinned ? 'text-sky-400' : 'text-zinc-500'
                }`}
              >
                <Pin className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => handleStartRename(chat, e)}
                title="Rename"
                className="p-1 hover:text-white hover:bg-white/10 rounded cursor-pointer text-zinc-500"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                title="Delete"
                className="p-1 hover:text-rose-400 hover:bg-white/10 rounded cursor-pointer text-zinc-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
};
