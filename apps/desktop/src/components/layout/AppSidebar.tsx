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
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { VoidLogo } from "@/components/ui/VoidLogo";

interface Conversation {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const fetchConversations = () => {
    fetch(`${API_URL}/conversations/`)
      .then((res) => res.json())
      .then((data: Conversation[]) => {
        if (Array.isArray(data)) {
          setConversations(data.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch(`${API_URL}/ai/system/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.os) setOsName(data.os);
      })
      .catch(() => {});

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [API_URL, location.pathname]);

  const handleDeleteConversation = async (e: React.MouseEvent, convId: number) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/conversations/${convId}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (location.pathname.includes(`/chat/${convId}`)) {
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
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

  const activeChatId = location.pathname.startsWith("/chat/") 
    ? Number(location.pathname.split("/chat/")[1]) 
    : null;

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
        className="h-full flex flex-col justify-between p-4"
      >
        {/* Resize handle */}
        {open && onResizeStart && (
          <div
            onMouseDown={onResizeStart}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#7CFF9B]/40 transition-colors z-30 flex items-center justify-center"
            title="Drag to resize sidebar"
          >
            <div className="w-0.5 h-8 bg-white/20 rounded-full" />
          </div>
        )}

        {/* Top Header Controls - Hooded Logo & VOID Title */}
        <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-[#7CFF9B]/15 pb-3">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-1 rounded-2xl bg-[#7CFF9B]/10 border border-[#7CFF9B]/30 shadow-[0_0_15px_rgba(124,255,155,0.2)]">
              <VoidLogo className="w-7 h-7 text-[#7CFF9B]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white group-hover:text-[#7CFF9B] transition-colors">
                VOID
              </span>
              <span className="text-[10px] text-[#7CFF9B]/90 font-medium leading-none">
                Linux AI Assistant
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Prominent + New Chat Button */}
        <button
          onClick={() => {
            navigate("/");
          }}
          className="w-full mb-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#7CFF9B] to-[#35D6A0] text-[#060B0E] font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_16px_rgba(124,255,155,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#060B0E] stroke-[2.5]" />
          <span>New Chat</span>
        </button>

        {/* Main Vertical Scroll Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 py-1">
          {/* Navigation Items */}
          <div className="space-y-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#7CFF9B]/15 border border-[#7CFF9B]/35 text-[#7CFF9B] shadow-[0_0_16px_rgba(124,255,155,0.2)] font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-[#7CFF9B] drop-shadow-[0_0_8px_rgba(124,255,155,0.8)]" : "text-gray-400"}`} />
                  <span className="truncate tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recent Chat History List */}
          {conversations.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="px-3 pb-1 flex items-center justify-between text-[10px] font-mono tracking-wider text-[#7CFF9B]/80 uppercase">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#7CFF9B]" /> Recent Chats
                </span>
                <span className="text-gray-500 font-sans">{conversations.length}</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                {conversations.map((conv) => {
                  const isActive = activeChatId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => navigate(`/chat/${conv.id}`)}
                      className={`group/conv w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#7CFF9B]/15 border border-[#7CFF9B]/30 text-[#7CFF9B] font-bold"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#7CFF9B]" : "text-gray-500"}`} />
                        <span className="truncate">{conv.title || `Chat #${conv.id}`}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover/conv:opacity-100 p-1 hover:text-rose-400 text-gray-500 transition-all cursor-pointer rounded-lg hover:bg-rose-500/10"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Glass System Online Widget */}
        <div className="mt-2 p-3.5 rounded-2xl glass-card-futuristic space-y-1.5 shadow-xl border border-[#7CFF9B]/20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CFF9B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#7CFF9B] shadow-[0_0_8px_rgba(124,255,155,0.8)]" />
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              System Online
            </span>
          </div>
          <div className="text-[11px] font-medium text-[#7CFF9B] font-mono">
            {osName}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono pt-1 border-t border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7CFF9B]" />
            <span>100% Private • Offline</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

