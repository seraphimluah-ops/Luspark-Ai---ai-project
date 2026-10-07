import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Square, Plus, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { FileAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: FileAttachment[]) => void;
  onStop?: () => void;
  isStreaming: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStop,
  isStreaming,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'application/octet-stream',
            base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isStreaming) return;
    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Paste image support
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAttachments((prev) => [
              ...prev,
              {
                name: file.name || `Pasted_Image_${Date.now()}.png`,
                type: file.type,
                base64,
              },
            ]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const canSubmit = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.js,.ts,.tsx,.py,.json,.csv,.md"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Stadium Composer */}
      <div className="rounded-[28px] bg-[#1e1f20] hover:bg-[#222427] focus-within:bg-[#282a2d] transition-colors p-3 pl-4 sm:pl-5 shadow-sm">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2.5 pt-1 px-1 border-b border-white/5 mb-1.5">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="relative group flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#141517] border border-white/10 text-xs text-zinc-200"
              >
                {file.type.startsWith('image/') ? (
                  <img src={file.base64} alt={file.name} className="h-7 w-7 object-cover rounded-lg" />
                ) : (
                  <FileText className="h-4 w-4 text-sky-400" />
                )}
                <span className="truncate max-w-[140px] text-[11.5px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="p-0.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={attachments.length > 0 ? "Ask about attached files or photos..." : "Ask LuraSpark (supports files & photos)..."}
            disabled={isStreaming}
            className="w-full bg-transparent text-[#E3E3E3] placeholder-zinc-500 text-[15px] focus:outline-none resize-none leading-relaxed min-h-[44px]"
          />

          {/* Bottom Controls Row inside Composer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-zinc-400">
              {/* File / Photo Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload photos or files"
                className="p-2 rounded-full hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Use microphone'}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'hover:text-white hover:bg-white/10'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  title="Stop generating"
                  className="h-8 w-8 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  title="Send message"
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    canSubmit
                      ? 'bg-white text-black hover:bg-zinc-200 shadow-md'
                      : 'bg-white/10 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Gemini UX Footnote */}
      <p className="text-[11px] text-center text-zinc-500 mt-2 select-none">
        LuraSpark can make mistakes, so double-check it
      </p>
    </div>
  );
};
