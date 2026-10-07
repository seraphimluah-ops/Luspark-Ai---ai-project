import React from 'react';
import { CodeBlock } from './CodeBlock';
import { renderMarkdown } from '../utils/markdown';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Regex to extract ```lang ... ``` blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let keyIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      elements.push(
        <div
          key={`text-${keyIndex++}`}
          className="prose prose-invert max-w-none text-[#E3E3E3] prose-headings:text-[#F0F4F9] prose-p:my-2.5 prose-p:leading-relaxed prose-code:font-mono prose-code:text-sky-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-table:border-collapse prose-th:border prose-th:border-white/15 prose-th:p-2.5 prose-td:border prose-td:border-white/10 prose-td:p-2.5"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(textBefore) }}
        />
      );
    }

    const language = match[1] || 'text';
    const code = match[2];

    elements.push(
      <CodeBlock key={`code-${keyIndex++}`} language={language} value={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  // Any remaining text after the last code block
  const remainingText = content.substring(lastIndex);
  if (remainingText.trim()) {
    elements.push(
      <div
        key={`text-${keyIndex++}`}
        className="prose prose-invert max-w-none text-[#E3E3E3] prose-headings:text-[#F0F4F9] prose-p:my-2.5 prose-p:leading-relaxed prose-code:font-mono prose-code:text-sky-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-table:border-collapse prose-th:border prose-th:border-white/15 prose-th:p-2.5 prose-td:border prose-td:border-white/10 prose-td:p-2.5"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(remainingText) }}
      />
    );
  }

  // If no code blocks found at all, render whole text through markdown
  if (elements.length === 0) {
    return (
      <div
        className="prose prose-invert max-w-none text-[#E3E3E3] prose-headings:text-[#F0F4F9] prose-p:my-2.5 prose-p:leading-relaxed prose-code:font-mono prose-code:text-sky-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-table:border-collapse prose-th:border prose-th:border-white/15 prose-th:p-2.5 prose-td:border prose-td:border-white/10 prose-td:p-2.5"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    );
  }

  return <div className="space-y-1">{elements}</div>;
};
