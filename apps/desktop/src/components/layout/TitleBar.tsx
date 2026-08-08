import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Sun, Moon, Bell, PictureInPicture2, Minus, Square, X, PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { VoidLogo } from '@/components/ui/VoidLogo';
import { useTheme } from '@/hooks/useTheme';
import { useModelSelection } from '@/hooks/useModelSelection';

interface TitleBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function TitleBar({ activeTab = 'chat', onTabChange }: TitleBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { selectedModel, models } = useModelSelection();
  let toggleSidebar = () => {};
  try {
    const sidebar = useSidebar();
    toggleSidebar = sidebar.toggleSidebar;
  } catch (e) {
    // Graceful fallback if mounted outside SidebarProvider
  }
  const [isMaximized, setIsMaximized] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        const maximized = await getCurrentWindow().isMaximized();
        setIsMaximized(maximized);
      } catch (e) {}
    };
    checkMaximized();

    const checkBackend = () => {
      fetch(`${API_URL}/ai/health`)
        .then(res => setIsBackendConnected(res.ok))
        .catch(() => setIsBackendConnected(false));
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, [API_URL]);

  const activeModelDisplay = selectedModel || (models.length > 0 ? models[0].id : "void:latest");

  const handleMinimize = () => getCurrentWindow().minimize();
  const handleMaximize = async () => {
    const win = getCurrentWindow();
    if (await win.isMaximized()) {
      await win.unmaximize();
      setIsMaximized(false);
    } else {
      await win.maximize();
      setIsMaximized(true);
    }
  };
  const handleClose = () => getCurrentWindow().close();

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'chat', label: 'AI Chat', path: '/' },
    { id: 'tools', label: 'Tools', path: '/tools' },
    { id: 'knowledge', label: 'Knowledge', path: '/knowledge' },
    { id: 'system', label: 'System', path: '/system' },
  ];

  return (
    <div
      data-tauri-drag-region
      className="h-14 flex justify-between items-center bg-[#0B0F12] border-b border-emerald-500/20 px-3 select-none sticky top-0 z-50 shadow-lg"
    >
      {/* Left: Logo & Sidebar Toggle */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-all"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative">
            <VoidLogo className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wider text-white group-hover:text-emerald-400 transition-colors">
              VOID
            </span>
            <span className="text-[10px] text-emerald-400/80 font-medium leading-none">
              Linux AI Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Center: Top Navigation Pills */}
      <div className="flex items-center gap-1.5 pointer-events-auto bg-[#12181F] p-1 rounded-full border border-white/10 shadow-inner">
        {navTabs.map((tab) => {
          const isActive = (activeTab || 'chat') === tab.id || (tab.id === 'chat' && location.pathname.startsWith('/chat'));
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (onTabChange) onTabChange(tab.id);
                navigate(tab.path);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/40 to-emerald-500/30 border border-emerald-400/60 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Utility Icons & Window Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Model Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12181F] border border-emerald-500/30 text-[11px] font-mono text-emerald-400 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="max-w-[120px] truncate">{activeModelDisplay}</span>
        </div>

        {/* Sun / Moon Theme Toggle */}
        <div className="flex items-center bg-[#12181F] p-0.5 rounded-full border border-white/10">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full transition-all ${theme === 'cosmic' ? 'text-amber-400 bg-white/10' : 'text-gray-400 hover:text-white'}`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full transition-all ${theme !== 'cosmic' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' : 'text-gray-400 hover:text-white'}`}
            title="Dark Emerald Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Canvas / PIP Icon */}
        <button
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="Picture in Picture Mode"
        >
          <PictureInPicture2 className="w-4 h-4" />
        </button>

        {/* Bell Notifications Icon */}
        <button
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </button>

        {/* User Profile Avatar "V" */}
        <div className="relative cursor-pointer" onClick={() => navigate('/settings')}>
          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-400/60 flex items-center justify-center font-bold text-xs text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform">
            V
          </div>
        </div>

        {/* Window Control Buttons */}
        <div className="flex items-center gap-0.5 ml-2 border-l border-white/10 pl-2">
          <button
            onClick={handleMinimize}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center rounded-lg active:scale-95"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center rounded-lg active:scale-95"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="h-7 w-7 hover:bg-rose-600 hover:text-white text-gray-400 transition-all flex items-center justify-center rounded-lg active:scale-95"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

