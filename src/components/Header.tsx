import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  Brain,
  Check,
  BookOpen,
  Calculator,
  Settings,
} from 'lucide-react';
import { ModelType } from '../types';
import { MBLogo } from './MBLogo';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentModel: ModelType;
  onChangeModel: (model: ModelType) => void;
  enableThinking: boolean;
  onToggleThinking: () => void;
  onOpenDocs: () => void;
  onOpenMathSolver: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentModel,
  onChangeModel,
  enableThinking,
  onToggleThinking,
  onOpenDocs,
  onOpenMathSolver,
  onOpenSettings,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 px-4 sm:px-6 flex items-center justify-between bg-[#131314] select-none sticky top-0 z-30">
      {/* Left: Sidebar Toggle + Brand + Model Picker */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Toggle navigation"
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand & Model Picker */}
        <div className="relative" ref={modelDropdownRef}>
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <MBLogo size={26} className="h-6 w-6" />
              <span className="text-lg font-medium tracking-tight text-[#E3E3E3] flex items-center gap-2">
                <span className="font-semibold bg-gradient-to-r from-[#4485F6] via-[#A87FFB] to-[#F37280] bg-clip-text text-transparent">
                  LuraSpark
                </span>
              </span>
              <span className="text-xs text-zinc-400 font-normal">
                {currentModel.includes('pro') ? 'Pro Reasoning' : 'Turbo Fast'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
          </button>

          {/* Model Dropdown */}
          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl p-2 z-50">
              <button
                type="button"
                onClick={() => {
                  onChangeModel('gemini-3.8-flash');
                  setModelDropdownOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                  currentModel === 'gemini-3.8-flash'
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-white font-bold text-xs">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">LuraSpark Turbo</span>
                    {currentModel === 'gemini-3.8-flash' && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                    Blazing-fast reasoning engine with zero latency and high quotas.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onChangeModel('gemini-3.1-pro-preview');
                  setModelDropdownOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                  currentModel === 'gemini-3.1-pro-preview'
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <MBLogo size={18} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">LuraSpark Pro</span>
                    {currentModel === 'gemini-3.1-pro-preview' && (
                      <Check className="h-4 w-4 text-sky-400" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                    Advanced analytical problem solving and deep code synthesis.
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Math Solver Button */}
        <button
          type="button"
          onClick={onOpenMathSolver}
          title="Open Math Problem Solver"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
        >
          <Calculator className="h-3.5 w-3.5 text-emerald-400" />
          <span>Math Solver</span>
        </button>

        {/* Thinking Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleThinking}
          title="Toggle Fast Thinking reasoning"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
            enableThinking
              ? 'bg-[#1b2b40] text-sky-300 hover:bg-[#20344d]'
              : 'bg-[#1e1f20] text-zinc-400 hover:text-white hover:bg-[#282a2d]'
          }`}
        >
          <Brain className={`h-3.5 w-3.5 ${enableThinking ? 'text-sky-400' : 'text-zinc-500'}`} />
          <span className="hidden md:inline">Thinking</span>
          <span className={`text-[11px] ${enableThinking ? 'text-sky-300 font-semibold' : 'text-zinc-500'}`}>
            {enableThinking ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Docs Button */}
        <button
          type="button"
          onClick={onOpenDocs}
          title="View LuraSpark Documentation by Mark Beranio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-[#1e1f20] hover:bg-[#282a2d] transition-colors cursor-pointer"
        >
          <BookOpen className="h-3.5 w-3.5 text-sky-400" />
          <span className="hidden sm:inline">Docs</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Open Device & System Settings"
          className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* MB Logo Profile Circle */}
        <div
          onClick={onOpenSettings}
          title="Device Settings & Profile (Mark Beranio, Davao del Sur)"
          className="cursor-pointer"
        >
          <MBLogo size={32} className="h-8 w-8" />
        </div>
      </div>
    </header>
  );
};
