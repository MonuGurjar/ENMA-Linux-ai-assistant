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

  const activeModelDisplay = selectedModel || (models.length > 0 ? models[0].id : "enma:latest");

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
      className="h-14 flex justify-between items-center bg-transparent px-5 select-none sticky top-0 z-50 pt-2 pb-1"
    >
      {/* Left: Window Drag Region & Sidebar Toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-full bg-[#0D151A]/80 border border-[#7CFF9B]/15 text-gray-400 hover:text-[#7CFF9B] hover:border-[#7CFF9B]/40 transition-all flex items-center justify-center backdrop-blur-md cursor-pointer"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Floating Translucent Pill Navigation */}
      <div className="flex items-center gap-1.5 pointer-events-auto bg-[#0D151A]/70 backdrop-blur-xl p-1 rounded-full border border-[#7CFF9B]/15 shadow-xl">
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
                  ? 'bg-[#7CFF9B]/15 border border-[#7CFF9B]/40 text-[#7CFF9B] shadow-[0_0_14px_rgba(124,255,155,0.25)] font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Circular Glass Utility Buttons & Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Active Model Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0D151A]/80 border border-[#7CFF9B]/20 text-[11px] font-mono text-[#7CFF9B] backdrop-blur-md shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF9B] animate-pulse shadow-[0_0_6px_rgba(124,255,155,0.8)]" />
          <span className="max-w-[120px] truncate">{activeModelDisplay}</span>
        </div>

        {/* Sun / Moon Theme Toggle */}
        <div className="flex items-center bg-[#0D151A]/80 p-0.5 rounded-full border border-[#7CFF9B]/15 backdrop-blur-md">
          <button
            onClick={toggleTheme}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${theme === 'cosmic' ? 'text-amber-400 bg-white/10' : 'text-gray-400 hover:text-white'}`}
            title="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleTheme}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${theme !== 'cosmic' ? 'text-[#7CFF9B] bg-[#7CFF9B]/15 border border-[#7CFF9B]/30' : 'text-gray-400 hover:text-white'}`}
            title="Dark Glass Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PIP Icon */}
        <button
          className="w-8 h-8 rounded-full bg-[#0D151A]/80 border border-[#7CFF9B]/15 text-gray-400 hover:text-[#7CFF9B] hover:border-[#7CFF9B]/40 transition-all flex items-center justify-center backdrop-blur-md cursor-pointer"
          title="Picture in Picture Mode"
        >
          <PictureInPicture2 className="w-4 h-4" />
        </button>

        {/* Bell Notifications Icon */}
        <button
          className="w-8 h-8 rounded-full bg-[#0D151A]/80 border border-[#7CFF9B]/15 text-gray-400 hover:text-[#7CFF9B] hover:border-[#7CFF9B]/40 transition-all flex items-center justify-center backdrop-blur-md cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7CFF9B] shadow-[0_0_6px_rgba(124,255,155,0.8)]" />
        </button>

        {/* User Profile Avatar "V" */}
        <div className="relative cursor-pointer" onClick={() => navigate('/settings')}>
          <div className="w-8 h-8 rounded-full bg-[#0D151A] border border-[#7CFF9B]/50 flex items-center justify-center font-bold text-xs text-[#7CFF9B] shadow-[0_0_12px_rgba(124,255,155,0.3)] hover:scale-105 transition-transform backdrop-blur-md">
            V
          </div>
        </div>

        {/* Window Control Buttons */}
        <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
          <button
            onClick={handleMinimize}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center rounded-full active:scale-95 cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center rounded-full active:scale-95 cursor-pointer"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="h-7 w-7 hover:bg-rose-600 hover:text-white text-gray-400 transition-all flex items-center justify-center rounded-full active:scale-95 cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

