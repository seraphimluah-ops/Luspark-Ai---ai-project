import { marked } from 'marked';

// Configure marked options for clean formatting
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    return marked.parse(content) as string;
  } catch (e) {
    return content;
  }
}
