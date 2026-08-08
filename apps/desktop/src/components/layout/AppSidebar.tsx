import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  Home,
  MessageSquare,
  Folder,
  BookOpen,
  Terminal,
  CheckSquare,
  Activity,
  Settings,
  ShieldCheck,
  PanelLeftClose,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface AppSidebarProps {
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
  onSelectNav?: (navId: string) => void;
}

export function AppSidebar({ width = 240, onResizeStart, onSelectNav }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, toggleSidebar } = useSidebar();
  const [osName, setOsName] = useState("Garuda Linux");
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${API_URL}/ai/system/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.os) setOsName(data.os);
      })
      .catch(() => {});
  }, [API_URL]);

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "chat", label: "Chat", icon: MessageSquare, path: "/" },
    { id: "files", label: "Files", icon: Folder, path: "/files" },
    { id: "knowledge", label: "Knowledge", icon: BookOpen, path: "/knowledge" },
    { id: "terminal", label: "Terminal", icon: Terminal, path: "/terminal" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/tasks" },
    { id: "system", label: "System", icon: Activity, path: "/system" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  const currentNav = location.pathname === "/" 
    ? "home" 
    : location.pathname.replace("/", "");

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
      className="shrink-0 h-full rounded-2xl border border-emerald-500/20 bg-[#0B0F12] shadow-2xl overflow-hidden select-none relative z-20"
    >
      <div
        style={{ width: `${width}px` }}
        className="h-full flex flex-col justify-between p-3"
      >
        {/* Resize handle */}
        {open && onResizeStart && (
          <div
            onMouseDown={onResizeStart}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-400/50 transition-colors z-30 flex items-center justify-center"
            title="Drag to resize sidebar"
          >
            <div className="w-0.5 h-8 bg-white/20 rounded-full" />
          </div>
        )}

        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400/70 font-semibold">
            NAVIGATION
          </span>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Main Vertical Navigation Menu */}
        <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = currentNav === item.id || (item.id === "home" && location.pathname === "/");

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onSelectNav) onSelectNav(item.id);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "text-gray-400"}`} />
                <span className="truncate tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom System Status Box */}
        <div className="mt-4 p-3 rounded-xl bg-[#12181F] border border-emerald-500/20 space-y-1.5 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              System Online
            </span>
          </div>
          <div className="text-[11px] font-medium text-emerald-400/90 font-mono">
            {osName}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono pt-1 border-t border-white/5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% Private • Offline</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

