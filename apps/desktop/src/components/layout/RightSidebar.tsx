import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Folder,
  Package,
  Activity,
  Globe,
  CheckSquare,
  Plus,
  PanelRightClose,
} from "lucide-react";

interface RightSidebarProps {
  open?: boolean;
  width?: number;
  onToggle?: () => void;
  onResizeStart?: (e: React.MouseEvent) => void;
  onSelectTool?: (toolId: string) => void;
}

interface SystemTelemetry {
  os: string;
  kernel: string;
  uptime: string;
  memory: { used_gb: number; total_gb: number; percent: number };
  cpu: { percent: number };
  storage: { used_gb: number; total_gb: number; percent: number };
}

export function RightSidebar({
  open = true,
  width = 300,
  onToggle,
  onResizeStart,
  onSelectTool,
}: RightSidebarProps) {
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    os: "Garuda Linux",
    kernel: "6.9.7-zen1-1-zen",
    uptime: "2h 34m",
    memory: { used_gb: 5.2, total_gb: 15.4, percent: 34 },
    cpu: { percent: 12 },
    storage: { used_gb: 112, total_gb: 512, percent: 21 },
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // Fetch real system telemetry from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/ai/system/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.os) setTelemetry(data);
        }
      } catch (e) {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [API_URL]);

  const voidTools = [
    {
      id: "system_info",
      title: "System Info",
      description: "Get system information and status",
      icon: Cpu,
    },
    {
      id: "file_manager",
      title: "File Manager",
      description: "Browse and manage your files",
      icon: Folder,
    },
    {
      id: "package_manager",
      title: "Package Manager",
      description: "Install, update and remove packages",
      icon: Package,
    },
    {
      id: "process_monitor",
      title: "Process Monitor",
      description: "Monitor system processes in real-time",
      icon: Activity,
    },
    {
      id: "web_search",
      title: "Web Search",
      description: "Search the web using DuckDuckGo",
      icon: Globe,
    },
    {
      id: "note_taker",
      title: "Note Taker",
      description: "Create and manage your notes",
      icon: CheckSquare,
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: open ? width : 0,
        opacity: open ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 450,
        damping: 36,
        mass: 0.8,
      }}
      className="shrink-0 h-full rounded-3xl glass-panel-futuristic overflow-hidden select-none relative z-20"
    >
      <div
        style={{ width: `${width}px` }}
        className="h-full flex flex-col justify-between p-4 space-y-4 overflow-y-auto no-scrollbar"
      >
        {/* Left Edge Resize Handle */}
        {open && onResizeStart && (
          <div
            onMouseDown={onResizeStart}
            className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#7CFF9B]/40 transition-colors z-30 flex items-center justify-center"
            title="Drag to resize sidebar"
          >
            <div className="w-0.5 h-8 bg-white/20 rounded-full" />
          </div>
        )}

        {/* 1. TOP PANEL: VOID TOOLS */}
        <div className="p-4 rounded-2xl glass-card-futuristic space-y-3 shadow.xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-white">
              VOID Tools
            </span>
            <div className="flex items-center gap-1.5">
              <button
                className="w-7 h-7 rounded-xl bg-[#7CFF9B]/10 border border-[#7CFF9B]/25 text-[#7CFF9B] flex items-center justify-center hover:bg-[#7CFF9B]/20 transition-all cursor-pointer"
                title="Add Custom Tool"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="w-7 h-7 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
                  title="Collapse Panel"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {voidTools.map((tool) => {
              const IconComp = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool && onSelectTool(tool.id)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#0D151A]/60 border border-white/5 hover:border-[#7CFF9B]/35 hover:bg-[#7CFF9B]/10 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#7CFF9B]/10 border border-[#7CFF9B]/25 text-[#7CFF9B] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(124,255,155,0.15)]">
                    <IconComp className="w-4 h-4 drop-shadow-[0_0_6px_rgba(124,255,155,0.8)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-[#7CFF9B] transition-colors">
                      {tool.title}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                      {tool.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. BOTTOM PANEL: SYSTEM STATUS (REAL LIVE TELEMETRY) */}
        <div className="p-4 rounded-2xl glass-card-futuristic space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-white">
              System Status
            </span>
            <span className="text-[10px] font-mono text-[#7CFF9B] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF9B] animate-pulse shadow-[0_0_6px_rgba(124,255,155,0.8)]" />
              LIVE
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* OS */}
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">OS</span>
              <span className="text-white font-bold">{telemetry.os}</span>
            </div>

            {/* Kernel */}
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">Kernel</span>
              <span className="text-[#7CFF9B] text-[11px] truncate max-w-[160px]">
                {telemetry.kernel}
              </span>
            </div>

            {/* Uptime */}
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white">{telemetry.uptime}</span>
            </div>

            {/* Memory Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Memory</span>
                <span className="text-[#7CFF9B] font-bold">
                  {telemetry.memory.used_gb} GB / {telemetry.memory.total_gb} GB ({telemetry.memory.percent}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#070B0E] rounded-full overflow-hidden border border-[#7CFF9B]/15">
                <div
                  className="h-full bg-gradient-to-r from-[#7CFF9B] to-[#35D6A0] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,255,155,0.6)]"
                  style={{ width: `${Math.min(telemetry.memory.percent, 100)}%` }}
                />
              </div>
            </div>

            {/* CPU Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">CPU</span>
                <span className="text-[#7CFF9B] font-bold">{telemetry.cpu.percent}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#070B0E] rounded-full overflow-hidden border border-[#7CFF9B]/15">
                <div
                  className="h-full bg-gradient-to-r from-[#7CFF9B] to-[#35D6A0] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,255,155,0.6)]"
                  style={{ width: `${Math.min(telemetry.cpu.percent, 100)}%` }}
                />
              </div>
            </div>

            {/* Storage Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Storage</span>
                <span className="text-[#7CFF9B] font-bold">
                  {telemetry.storage.used_gb} GB / {telemetry.storage.total_gb} GB ({telemetry.storage.percent}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#070B0E] rounded-full overflow-hidden border border-[#7CFF9B]/15">
                <div
                  className="h-full bg-gradient-to-r from-[#7CFF9B] to-[#35D6A0] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,255,155,0.6)]"
                  style={{ width: `${Math.min(telemetry.storage.percent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

