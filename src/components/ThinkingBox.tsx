import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface ThinkingBoxProps {
  thoughts: string;
  isStreamingReasoning?: boolean;
  hasStartedFinalAnswer?: boolean;
}

export const ThinkingBox: React.FC<ThinkingBoxProps> = ({
  thoughts,
  isStreamingReasoning = false,
  hasStartedFinalAnswer = false,
}) => {
  const [isOpen, setIsOpen] = useState(isStreamingReasoning && !hasStartedFinalAnswer);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isStreamingReasoning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreamingReasoning]);

  useEffect(() => {
    if (hasStartedFinalAnswer && isStreamingReasoning) {
      setIsOpen(false);
    }
  }, [hasStartedFinalAnswer, isStreamingReasoning]);

  if (!thoughts && !isStreamingReasoning) return null;

  const estimatedSeconds = seconds > 0
    ? seconds
    : Math.max(1, Math.round(thoughts.split(/\s+/).length / 28));

  return (
    <div className="my-3 transition-all duration-300">
      {/* LuraSpark Styled Thought Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer select-none ${
          isStreamingReasoning && !hasStartedFinalAnswer
            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10'
            : 'bg-[#1b1c1e] text-zinc-400 hover:text-zinc-200 hover:bg-[#25272a] border border-white/5'
        }`}
      >
        <div className="flex items-center gap-2">
          {isStreamingReasoning && !hasStartedFinalAnswer ? (
            <div className="relative flex items-center justify-center">
              <span className="absolute h-2.5 w-2.5 rounded-full bg-sky-400 opacity-75 animate-ping" />
              <Sparkles className="h-3.5 w-3.5 text-sky-400 relative z-10 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-zinc-400 group-hover:text-sky-400 transition-colors" />
          )}

          <span className="font-medium">
            {isStreamingReasoning && !hasStartedFinalAnswer
              ? `Thinking... (${seconds}s)`
              : `Thought for ${estimatedSeconds} seconds`}
          </span>
        </div>

        <div className="flex items-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Expanded Reasoning Panel */}
      {isOpen && (
        <div className="mt-2.5 rounded-2xl border border-sky-500/20 bg-[#161a22]/80 backdrop-blur-md p-4 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-500/10 text-[11px] text-sky-400/80 font-mono">
            <span className="uppercase tracking-wider font-semibold">LuraSpark Deep Reasoning Chain</span>
            <span>{thoughts.split(/\s+/).filter(Boolean).length} tokens</span>
          </div>

          <div className="font-mono text-[12.5px] leading-relaxed text-sky-200/90 whitespace-pre-wrap max-h-96 overflow-y-auto selection:bg-sky-500/30 pr-2">
            {thoughts || 'Formulating logical steps, evaluating edge cases, and synthesizing response...'}
            {isStreamingReasoning && !hasStartedFinalAnswer && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-sky-400 animate-pulse align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
