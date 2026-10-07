import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  User as UserIcon,
  FileText,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { ThinkingBox } from './ThinkingBox';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LuraSparkLogo } from './LuraSparkLogo';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const isModel = message.role === 'model';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.content.replace(/[#*`_~\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="py-5 px-4 sm:px-6 w-full group">
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        {/* Brand/User Avatar */}
        {isModel ? (
          <div className="shrink-0 mt-0.5">
            <LuraSparkLogo size={28} className="h-7 w-7" />
          </div>
        ) : (
          <div className="shrink-0 mt-0.5">
            <div className="h-7 w-7 rounded-full bg-[#282a2d] flex items-center justify-center text-xs font-medium text-zinc-300">
              <UserIcon className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        )}

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {/* Attached Files / Photos in user message */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-3">
              {message.attachments.map((file, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-[#1e1f20] shadow-sm">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.base64}
                      alt={file.name}
                      className="h-28 w-auto max-w-xs object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300">
                      <FileText className="h-4 w-4 text-sky-400" />
                      <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Differentiated Reasoning (Thinking) Phase from Final Answer */}
          {isModel && (message.thoughts || isStreaming) && (
            <ThinkingBox
              thoughts={message.thoughts || ''}
              isStreamingReasoning={isStreaming}
              hasStartedFinalAnswer={Boolean(message.content && message.content.trim().length > 0)}
            />
          )}

          {/* User editing view */}
          {!isModel && isEditing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-[#1e1f20] text-[#E3E3E3] border border-white/20 rounded-2xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y min-h-[90px]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-full hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 text-xs bg-white text-black font-medium rounded-full shadow-sm hover:bg-zinc-200"
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Content with react-syntax-highlighter */
            <div className="text-[15px] leading-relaxed text-[#D2D2D2] break-words">
              {isModel ? (
                message.content ? (
                  <MarkdownRenderer content={message.content} />
                ) : isStreaming ? (
                  <div className="flex items-center gap-2 text-xs text-sky-400/80 py-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                    <span>LuraSpark is deliberating response...</span>
                  </div>
                ) : null
              ) : (
                <div className="whitespace-pre-wrap font-normal text-zinc-100">
                  {message.content}
                </div>
              )}

              {isStreaming && isModel && message.content && (
                <span className="inline-block w-2 h-4 ml-1 bg-gradient-to-t from-blue-500 to-cyan-400 animate-pulse align-middle rounded-xs" />
              )}
            </div>
          )}

          {/* Action Toolbar */}
          {message.content && (
            <div className="mt-3 flex items-center gap-1 text-zinc-500 opacity-80 group-hover:opacity-100 transition-opacity">
              {isModel ? (
                <>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy response"
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    title={isSpeaking ? 'Stop speaking' : 'Listen'}
                    className={`p-1.5 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer ${
                      isSpeaking ? 'text-blue-400' : ''
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  {onRegenerate && (
                    <button
                      type="button"
                      onClick={onRegenerate}
                      title="Regenerate response"
                      className="p-1.5 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <div className="h-3 w-[1px] bg-white/10 mx-1" />
                  <button
                    type="button"
                    onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                    title="Good response"
                    className={`p-1.5 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer ${
                      feedback === 'up' ? 'text-blue-400' : ''
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                    title="Bad response"
                    className={`p-1.5 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer ${
                      feedback === 'down' ? 'text-rose-400' : ''
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </>
              ) : (
                onEdit &&
                !isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    title="Edit prompt"
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
