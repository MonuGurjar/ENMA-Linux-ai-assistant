import { MessageSquare, Terminal, Search, Brain } from "lucide-react";
import { VoidLogo } from "@/components/ui/VoidLogo";

interface WelcomeGridProps {
  onSelectAction?: (action: string, promptText?: string) => void;
}

export function WelcomeGrid({ onSelectAction }: WelcomeGridProps) {
  const cards = [
    {
      id: "start_chat",
      title: "Start a Chat",
      description: "Talk to VOID in natural language",
      icon: MessageSquare,
      prompt: "Hello VOID! What can you help me with on my Linux system?",
    },
    {
      id: "run_command",
      title: "Run Command",
      description: "Execute commands on your system",
      icon: Terminal,
      prompt: "Show system info and current resource usage",
    },
    {
      id: "search_files",
      title: "Search Files",
      description: "Find files and content instantly",
      icon: Search,
      prompt: "List all files in my Pictures directory",
    },
    {
      id: "access_knowledge",
      title: "Access Knowledge",
      description: "Get answers from your local knowledge base",
      icon: Brain,
      prompt: "Explain how VOID's tool system and security permissions work",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full w-full max-w-4xl mx-auto px-6 py-8 select-none">
      {/* Top / Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
        {/* Orbital Rings around Hooded Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer glowing orbital ring */}
          <div className="absolute w-36 h-36 rounded-full border border-emerald-500/20 animate-[spin_12s_linear_infinite]" />
          <div className="absolute w-32 h-32 rounded-full border border-dashed border-emerald-400/40 animate-[spin_8s_linear_infinite_reverse]" />
          <div className="w-24 h-24 rounded-full bg-emerald-950/60 border border-emerald-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <VoidLogo className="w-14 h-14 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          Hello, I'm <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">VOID</span>
          <br />
          Your Linux AI Assistant
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm md:text-base text-gray-400 max-w-lg leading-relaxed font-medium mb-8">
          I can help you with tasks, answer questions, and automate your Linux experience.
        </p>

        {/* 4 Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 w-full">
          {cards.map((card) => {
            const IconComp = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onSelectAction && onSelectAction(card.id, card.prompt)}
                className="flex flex-col items-start text-left p-4 rounded-2xl bg-[#12181F] border border-emerald-500/20 hover:border-emerald-400/60 hover:bg-emerald-950/30 transition-all duration-200 cursor-pointer group shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                  <IconComp className="w-5 h-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer text */}
      <div className="text-[11px] font-mono text-gray-500 pt-4 flex items-center gap-2">
        <span>VOID v1.0.0</span>
        <span>•</span>
        <span>Offline &amp; Private</span>
        <span>•</span>
        <span>Built for Linux 💚</span>
      </div>
    </div>
  );
}

