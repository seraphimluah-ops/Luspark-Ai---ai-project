import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Code2, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normalizedLang = (language || 'text').toLowerCase();
  const isTerminal = ['bash', 'sh', 'shell', 'zsh', 'terminal', 'cmd'].includes(normalizedLang);

  // Human-friendly display label
  const displayLabels: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript (React)',
    js: 'JavaScript',
    jsx: 'JavaScript (React)',
    py: 'Python',
    python: 'Python',
    rb: 'Ruby',
    rs: 'Rust',
    rust: 'Rust',
    go: 'Go',
    golang: 'Go',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    sql: 'SQL',
    yaml: 'YAML',
    yml: 'YAML',
    bash: 'Bash',
    sh: 'Shell',
    shell: 'Shell',
    dockerfile: 'Dockerfile',
    markdown: 'Markdown',
    md: 'Markdown',
  };

  const label = displayLabels[normalizedLang] || normalizedLang.toUpperCase();

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#141517] shadow-lg">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1c1d20] border-b border-white/5 select-none text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          {isTerminal ? (
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Code2 className="h-3.5 w-3.5 text-sky-400" />
          )}
          <span className="font-mono font-medium text-zinc-300">{label}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Body */}
      <div className="text-[13.5px] leading-relaxed overflow-x-auto font-mono">
        <SyntaxHighlighter
          language={normalizedLang || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#121315',
            fontSize: '13.5px',
            lineHeight: '1.6',
            borderRadius: 0,
          }}
          codeTagProps={{
            style: {
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            },
          }}
        >
          {value.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
