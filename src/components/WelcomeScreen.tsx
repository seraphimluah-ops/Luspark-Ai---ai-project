import React from 'react';
import { Code2, Compass, Lightbulb, Binary } from 'lucide-react';
import { MBLogo } from './MBLogo';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenDocs?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt, onOpenDocs }) => {
  const suggestions = [
    {
      icon: Binary,
      title: 'Compare architectures',
      description: 'Break down Monolith vs Microservices tradeoffs and latency math',
      prompt: 'Compare monolithic vs microservices architectures with an in-depth breakdown of network latency, operational overhead, failure domains, and scalability math.',
    },
    {
      icon: Code2,
      title: 'Write TypeScript code',
      description: 'Implement a debounce and throttle utility with strict generic types',
      prompt: 'Write clean, robust TypeScript implementations for both `useDebounce` and `useThrottle` custom hooks with full type safety and edge-case handling.',
    },
    {
      icon: Lightbulb,
      title: 'Brainstorm strategy',
      description: 'Draft a technical roadmap for deploying autonomous AI agents',
      prompt: 'Create a comprehensive technical roadmap for migrating a legacy web app to an autonomous agentic AI architecture, including milestone metrics and risk mitigation.',
    },
    {
      icon: Compass,
      title: 'Explore deep science',
      description: 'Explain quantum entanglement and Bell inequalities intuitively',
      prompt: 'Explain quantum entanglement and the significance of Bell’s Theorem in clear intuitive terms with concrete analogies and real-world quantum computing implications.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-10 max-w-4xl mx-auto w-full select-none">
      {/* MB Brand Insignia & Large Typography */}
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-3">
          <MBLogo size={44} className="h-11 w-11" />
          {onOpenDocs && (
            <button
              type="button"
              onClick={onOpenDocs}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              Docs by Mark Beranio 🇵🇭
            </button>
          )}
        </div>

        <h1 className="text-5xl sm:text-6xl font-normal tracking-tight">
          <span className="bg-gradient-to-r from-[#4485F6] via-[#A87FFB] to-[#F37280] bg-clip-text text-transparent">
            Hello
          </span>
        </h1>
        <h2 className="text-4xl sm:text-5xl font-normal text-[#444746] tracking-tight mt-1">
          How can I help you today?
        </h2>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {suggestions.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="text-left p-4 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2d] transition-all duration-200 group flex flex-col justify-between h-[150px] cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-[#E3E3E3] group-hover:text-white transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex justify-end w-full">
                <div className="h-7 w-7 rounded-full bg-[#131314] flex items-center justify-center text-zinc-400 group-hover:text-sky-400 group-hover:bg-[#23272e] transition-colors">
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
