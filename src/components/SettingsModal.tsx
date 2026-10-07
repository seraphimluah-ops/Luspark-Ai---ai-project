import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
  Trash2,
  Info,
} from 'lucide-react';
import { MBLogo } from './MBLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enableThinking: boolean;
  onToggleThinking: () => void;
  onClearHistory: () => void;
  chatsCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  enableThinking,
  onToggleThinking,
  onClearHistory,
  chatsCount,
}) => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    os: 'Unknown OS',
    browser: 'Modern Browser',
    screen: '',
    language: 'en-US',
  });

  useEffect(() => {
    // Generate or retrieve persistent device identifier
    let storedId = localStorage.getItem('luraspark_device_identifier');
    if (!storedId) {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randomHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randomHex3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      storedId = `LURASPARK-DEV-${randomHex}-${randomHex2}-${randomHex3}`;
      localStorage.setItem('luraspark_device_identifier', storedId);
    }
    setDeviceId(storedId);

    // Collect device environment data
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let os = 'Unknown OS';
      if (ua.includes('Win')) os = 'Windows';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

      let browser = 'Chrome / Chromium';
      if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Edg')) browser = 'Microsoft Edge';

      setDeviceInfo({
        os,
        browser,
        screen: `${window.screen.width} × ${window.screen.height}`,
        language: navigator.language || 'en-US',
      });
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateId = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex3 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `LURASPARK-DEV-${randomHex}-${randomHex2}-${randomHex3}`;
    localStorage.setItem('luraspark_device_identifier', newId);
    setDeviceId(newId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#18191c] border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <MBLogo size={22} className="h-5 w-5" />
            <h2 className="text-base font-semibold text-white">LuraSpark Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Device Identifier Section */}
          <div className="rounded-2xl bg-[#121315] border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5" />
                Device Identifier
              </span>
              <button
                type="button"
                onClick={handleRegenerateId}
                title="Rotate Device Identifier"
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Rotate ID</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-200">
              <span className="truncate select-all">{deviceId}</span>
              <button
                type="button"
                onClick={handleCopyDeviceId}
                className="ml-2 flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              This persistent identifier uniquely tags your local browser environment for secure session persistence without requiring any login accounts.
            </p>
          </div>

          {/* System & Hardware Environment */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              Environment Specs
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#131417] border border-white/5 space-y-0.5">
                <span className="text-[11px] text-zinc-500 block">Operating System</span>
                <span className="font-medium text-zinc-200">{deviceInfo.os}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131417] border border-white/5 space-y-0.5">
                <span className="text-[11px] text-zinc-500 block">Web Browser</span>
                <span className="font-medium text-zinc-200">{deviceInfo.browser}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131417] border border-white/5 space-y-0.5">
                <span className="text-[11px] text-zinc-500 block">Display Resolution</span>
                <span className="font-medium text-zinc-200">{deviceInfo.screen}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131417] border border-white/5 space-y-0.5">
                <span className="text-[11px] text-zinc-500 block">Locale & Language</span>
                <span className="font-medium text-zinc-200">{deviceInfo.language}</span>
              </div>
            </div>
          </div>

          {/* Engine & Reasoning Preferences */}
          <div className="rounded-2xl bg-[#131417] border border-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Fast Thinking Reasoning</span>
                <span className="text-[11px] text-zinc-400">Multi-step scratchpad derivation before output</span>
              </div>

              <button
                type="button"
                onClick={onToggleThinking}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  enableThinking ? 'bg-sky-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableThinking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data & Cache Management */}
          <div className="rounded-2xl bg-[#131417] border border-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-zinc-500" />
                Local Storage Data
              </span>
              <span className="text-xs text-zinc-400 font-mono">{chatsCount} conversations</span>
            </div>

            {confirmClear ? (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 space-y-2">
                <p className="text-xs text-rose-300 font-medium">Delete all stored chats on this device?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-zinc-300 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Chat History</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/5 bg-[#121315] flex items-center justify-between text-xs text-zinc-500 select-none">
          <span>LuraSpark • Mark Beranio</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
