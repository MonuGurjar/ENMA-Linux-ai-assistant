import { useState, useEffect } from "react";
import { Save, Palette, Check } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function SettingsPage() {
  const { theme: wallpaperTheme, setTheme: setWallpaperTheme } = useTheme();
  const [settings, setSettings] = useState<Record<string, string>>({
    theme: "dark",
    fontSize: "14px",
    dataDir: "~/.void/data",
    ai_base_url: "http://localhost:11434/v1",
    ai_model: ""
  });
  const [models, setModels] = useState<{id: string, name: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${API_URL}/settings/`)
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
      
    fetch(`${API_URL}/ai/models`)
      .then(res => res.json())
      .then(async (data) => {
         let list = data || [];
         if (list.length === 0) {
           try {
             const direct = await fetch("http://localhost:11434/api/tags");
             if (direct.ok) {
               const directData = await direct.json();
               list = (directData.models || []).map((m: any) => ({ id: m.name, name: m.name }));
             }
           } catch (e) {}
         }
         setModels(list);
         if (list.length > 0 && !settings.ai_model) {
            setSettings(prev => ({ ...prev, ai_model: list[0].id }));
         }
      })
      .catch(err => console.error("Failed to load models:", err));
  }, [API_URL]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/settings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      document.documentElement.className = settings.theme;
      document.documentElement.style.fontSize = settings.fontSize;
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-8 text-white h-full overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">Configure your VOID AI Assistant and local LLM endpoints.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-lg disabled:opacity-50 hover:bg-emerald-400 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
      
      <div className="space-y-6">
        <section className="bg-[#12181F] border border-emerald-500/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-3 flex items-center justify-between font-mono">
            <span>Appearance &amp; System Theme</span>
            <Palette className="w-4 h-4 text-emerald-400" />
          </h2>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-400">Color System</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setWallpaperTheme("cosmic")}
                className={`relative rounded-2xl p-4 border text-left transition-all overflow-hidden group cursor-pointer ${
                  wallpaperTheme === "cosmic"
                    ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "border-white/10 bg-white/5 hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400">Cyber Emerald Dark</span>
                  {wallpaperTheme === "cosmic" && (
                    <span className="p-1 rounded-full bg-emerald-500 text-black">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  Pure matte dark theme with emerald green accents.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setWallpaperTheme("obsidian")}
                className={`relative rounded-2xl p-4 border text-left transition-all overflow-hidden group cursor-pointer ${
                  wallpaperTheme === "obsidian"
                    ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "border-white/10 bg-white/5 hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-200">Monochrome Slate</span>
                  {wallpaperTheme === "obsidian" && (
                    <span className="p-1 rounded-full bg-emerald-500 text-black">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  Monochromatic dark slate layout with high contrast.
                </p>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Mode</label>
              <select 
                value={settings.theme}
                onChange={e => setSettings({...settings, theme: e.target.value})}
                className="w-full bg-[#0B0F12] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-white font-medium outline-none cursor-pointer"
              >
                <option value="dark" className="bg-[#0B0F12]">Dark Mode</option>
                <option value="light" className="bg-[#0B0F12]">Light Mode</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Font Size</label>
              <select 
                value={settings.fontSize}
                onChange={e => setSettings({...settings, fontSize: e.target.value})}
                className="w-full bg-[#0B0F12] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-white font-medium outline-none cursor-pointer"
              >
                <option value="12px" className="bg-[#0B0F12]">Small (12px)</option>
                <option value="14px" className="bg-[#0B0F12]">Medium (14px)</option>
                <option value="16px" className="bg-[#0B0F12]">Large (16px)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-[#12181F] border border-emerald-500/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-3 font-mono">Local AI Integration</h2>
          
          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Base URL</label>
              <input 
                type="text" 
                value={settings.ai_base_url || ""}
                onChange={e => setSettings({...settings, ai_base_url: e.target.value})}
                placeholder="http://localhost:11434/v1"
                className="w-full bg-[#0B0F12] border border-emerald-500/30 rounded-xl p-2.5 text-xs font-mono outline-none text-white"
              />
              <p className="text-[11px] text-gray-500">Ollama: http://localhost:11434/v1 | LM Studio: http://localhost:1234/v1</p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Default Model</label>
              <select 
                value={settings.ai_model || ""}
                onChange={e => setSettings({...settings, ai_model: e.target.value})}
                className="w-full bg-[#0B0F12] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-white font-medium outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-[#0B0F12]">Select a model</option>
                {models.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0B0F12]">{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-[#12181F] border border-emerald-500/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-3 font-mono">Application Info</h2>
          <div className="grid gap-4 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium">Version</span>
              <span className="font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[11px]">1.0.0-beta</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Data Directory</label>
              <input 
                type="text" 
                value={settings.dataDir}
                onChange={e => setSettings({...settings, dataDir: e.target.value})}
                className="w-full bg-[#0B0F12] border border-emerald-500/30 rounded-xl p-2.5 text-xs font-mono outline-none text-white"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
