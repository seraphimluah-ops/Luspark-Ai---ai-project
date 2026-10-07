import React from 'react';
import {
  ArrowLeft,
  Brain,
  Code2,
  Cpu,
  MapPin,
  Sparkles,
  User,
  Shield,
  Zap,
} from 'lucide-react';
import { MBLogo } from './MBLogo';

interface DocsPageProps {
  onBackToChat: () => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ onBackToChat }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#131314] text-[#E3E3E3]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#131314]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between select-none">
        <button
          type="button"
          onClick={onBackToChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-sky-400" />
          <span>Back to Chat</span>
        </button>

        <div className="flex items-center gap-2">
          <MBLogo size={24} className="h-6 w-6" />
          <span className="text-sm font-semibold text-white">LuraSpark Documentation</span>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono">v1.2 // Production</div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#1c1d22] to-[#151619] border border-white/10 p-6 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
            <MBLogo size={180} />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official System Documentation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              LuraSpark Intelligence
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              An autonomous, high-reasoning conversational intelligence engineered with multi-stage reasoning token synthesis, syntax-highlighted code output, and instant local session persistence.
            </p>
          </div>
        </div>

        {/* Developer Profile Card */}
        <section className="rounded-2xl bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 text-sky-400">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Lead AI Developer & Architect</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
            <div className="h-16 w-16 rounded-2xl p-[2px] shrink-0 shadow-md">
              <MBLogo size={64} className="h-16 w-16" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Mark Beranio</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <span className="flex items-center gap-1 text-sky-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Davao del Sur, Philippines 🇵🇭
                </span>
                <span>•</span>
                <span>Founder & Creator of LuraSpark</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                Engineered with dedication from Davao del Sur, Philippines. Mark Beranio designed LuraSpark to bring state-of-the-art multimodal reasoning, high thinking synthesis, and real-time developer workflows into a distraction-free, zero-friction interface.
              </p>
            </div>
          </div>
        </section>

        {/* Core Architecture */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-sky-400">
            <Cpu className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Engine Foundations & Models</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#18191c] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  LuraSpark Pro
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-sky-300 border border-blue-500/20 font-mono">
                  Neural Pro
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The flagship deep-reasoning model optimized for complex STEM challenges, intricate software architecture, math derivations, and multi-turn contextual nuance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#18191c] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  LuraSpark Turbo
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-mono">
                  Turbo Speed
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ultra-low latency inference engine designed for rapid everyday Q&A, drafting, document parsing, and instant feedback with zero quota constraints.
              </p>
            </div>
          </div>
        </section>

        {/* High Thinking Mechanism */}
        <section className="rounded-2xl bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-sky-400">
            <Brain className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">High Thinking Reasoning Mode</h2>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            When <strong>High Thinking</strong> is toggled on, LuraSpark configures its underlying cognitive engine for maximum analytical depth. Instead of emitting superficial answers, the model:
          </p>

          <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside leading-relaxed pl-1">
            <li>
              <strong>Unpacks Structural Constraints</strong>: Systematically verifies premises and edge cases before output generation.
            </li>
            <li>
              <strong>Self-Corrects in the Scratchpad</strong>: Formulates hypotheses and refines them internally within its reasoning tokens.
            </li>
            <li>
              <strong>Displays Live Thinking Tokens</strong>: The thought process is streamed into the collapsible &quot;Thought process&quot; drawer, giving you complete visibility into the cognitive chain.
            </li>
          </ul>
        </section>

        {/* Code & Syntax Highlighting */}
        <section className="rounded-2xl bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-sky-400">
            <Code2 className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Syntax Highlighting & Developer Tools</h2>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            LuraSpark integrates <code className="text-sky-300 bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px]">react-syntax-highlighter</code> powered by the Prism syntax coloring engine and the VS Code Dark theme.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-zinc-300">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="font-semibold text-white block mb-1">50+ Languages</span>
              <span className="text-zinc-400">Full parsing for TypeScript, Python, Rust, Go, C++, SQL, Bash, and HTML.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="font-semibold text-white block mb-1">One-Click Copy</span>
              <span className="text-zinc-400">Header buttons allow copying raw snippets directly to your clipboard.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
              <span className="font-semibold text-white block mb-1">Language Labels</span>
              <span className="text-zinc-400">Every code snippet displays clear language badges and terminal indicators.</span>
            </div>
          </div>
        </section>

        {/* Privacy & Session Persistence */}
        <section className="rounded-2xl bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-400">
            <Shield className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Privacy & Local Storage</h2>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            LuraSpark is completely free of forced login walls. All conversations, pinned threads, and message histories are stored directly in your browser&apos;s local storage with your persistent Device Identifier.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center gap-2">
            <MBLogo size={20} className="h-5 w-5" />
            <span>LuraSpark AI • Crafted by Mark Beranio</span>
          </div>
          <span>Davao del Sur, Philippines</span>
        </footer>
      </main>
    </div>
  );
};
