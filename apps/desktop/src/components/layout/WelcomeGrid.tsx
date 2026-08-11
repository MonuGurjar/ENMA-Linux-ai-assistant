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
      {/* Top / Hero AI Core Surface */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
        {/* Concentric Glass Orbital Rings around Hooded Logo */}
        <div className="relative mb-7 flex items-center justify-center">
          {/* Outer glowing orbital ring 1 */}
          <div className="absolute w-40 h-40 rounded-full border border-[#7CFF9B]/15 animate-[spin_14s_linear_infinite] shadow-[0_0_30px_rgba(124,255,155,0.08)]" />
          {/* Middle dashed orbital ring 2 */}
          <div className="absolute w-32 h-32 rounded-full border border-dashed border-[#7CFF9B]/35 animate-[spin_10s_linear_infinite_reverse]" />
          {/* Inner core glass orb */}
          <div className="w-24 h-24 rounded-full bg-[#0D151A]/90 border border-[#7CFF9B]/50 flex items-center justify-center shadow-[0_0_35px_rgba(124,255,155,0.35)] backdrop-blur-xl">
            <VoidLogo className="w-14 h-14 text-[#7CFF9B] drop-shadow-[0_0_14px_rgba(124,255,155,0.9)]" />
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
          Hello, I'm <span className="text-[#7CFF9B] text-green-accent">VOID</span>
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-gray-200 tracking-tight mb-3">
          Your Linux AI Assistant
        </h2>

        {/* Hero Subtitle */}
        <p className="text-xs md:text-sm text-gray-400 max-w-md leading-relaxed font-medium mb-10">
          I can help you with tasks, answer questions, and automate your Linux experience.
        </p>

        {/* 4 Quick Action Glass Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {cards.map((card) => {
            const IconComp = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onSelectAction && onSelectAction(card.id, card.prompt)}
                className="flex flex-col items-start text-left p-5 glass-card-futuristic cursor-pointer group"
              >
                <div className="p-3 rounded-2xl bg-[#7CFF9B]/10 border border-[#7CFF9B]/25 text-[#7CFF9B] mb-3.5 group-hover:scale-110 group-hover:bg-[#7CFF9B]/20 transition-all duration-200 shadow-[0_0_12px_rgba(124,255,155,0.15)]">
                  <IconComp className="w-5 h-5 drop-shadow-[0_0_8px_rgba(124,255,155,0.8)]" />
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#7CFF9B] transition-colors mb-1.5">
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

