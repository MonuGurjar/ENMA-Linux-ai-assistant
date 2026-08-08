import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Folder,
  Terminal,
  Activity,
  Wrench,
  BookOpen,
  CheckSquare,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Search,
  HardDrive,
  Cpu,
} from "lucide-react";

export function FeatureViewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.replace("/", "");
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // System view data
  const [telemetry, setTelemetry] = useState<any>(null);
  // Files view data
  const [files, setFiles] = useState<any[]>([]);
  const [searchPath, setSearchPath] = useState("Pictures");
  // Tools view data
  const [toolsList, setToolsList] = useState<any[]>([]);
  // Terminal view data
  const [command, setCommand] = useState("uname -a && free -h");
  const [cmdOutput, setCmdOutput] = useState<string | null>(null);
  const [cmdLoading, setCmdLoading] = useState(false);

  // Fetch telemetry for System view
  useEffect(() => {
    if (path === "system") {
      fetch(`${API_URL}/ai/system/status`)
        .then((res) => res.json())
        .then((data) => setTelemetry(data))
        .catch(() => {});
    } else if (path === "tools") {
      fetch(`${API_URL}/tools/`)
        .then((res) => res.json())
        .then((data) => setToolsList(data))
        .catch(() => {});
    } else if (path === "files") {
      fetchFiles(searchPath);
    }
  }, [path, API_URL]);

  const fetchFiles = (dir: string) => {
    fetch(`${API_URL}/tools/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool_name: "filesystem_list",
        arguments: { directory: dir, recursive: true },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.files) setFiles(data.files);
      })
      .catch(() => {});
  };

  const handleRunCommand = () => {
    if (!command.trim() || cmdLoading) return;
    setCmdLoading(true);
    setCmdOutput(null);

    fetch(`${API_URL}/tools/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool_name: "terminal_execute",
        arguments: { command: command.trim() },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCmdOutput(data.stdout || data.stderr || data.error || "Execution completed.");
      })
      .catch((err) => setCmdOutput(`Error: ${err.message}`))
      .finally(() => setCmdLoading(false));
  };

  // Render System View
  if (path === "system") {
    return (
      <div className="flex flex-col h-full w-full bg-[#0B0F12] text-white p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-[#12181F] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                System Monitor &amp; Telemetry
              </h1>
              <p className="text-xs text-gray-400">Real-time Linux system hardware telemetry</p>
            </div>
          </div>
          <button
            onClick={() => {
              fetch(`${API_URL}/ai/system/status`).then((res) => res.json()).then((d) => setTelemetry(d));
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-950 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Refresh
          </button>
        </div>

        {telemetry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#12181F] border border-emerald-500/20 space-y-2">
              <span className="text-xs font-mono text-emerald-400">OPERATING SYSTEM</span>
              <div className="text-lg font-bold text-white">{telemetry.os}</div>
              <div className="text-xs text-gray-400 font-mono">{telemetry.kernel}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12181F] border border-emerald-500/20 space-y-2">
              <span className="text-xs font-mono text-emerald-400">SYSTEM UPTIME</span>
              <div className="text-lg font-bold text-white">{telemetry.uptime}</div>
              <div className="text-xs text-gray-400">Continuous runtime</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12181F] border border-emerald-500/20 space-y-2">
              <span className="text-xs font-mono text-emerald-400">MEMORY LOAD</span>
              <div className="text-lg font-bold text-white">
                {telemetry.memory?.used_gb} GB / {telemetry.memory?.total_gb} GB
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${telemetry.memory?.percent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Files View
  if (path === "files") {
    return (
      <div className="flex flex-col h-full w-full bg-[#0B0F12] text-white p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-[#12181F] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-emerald-400" />
                Filesystem Explorer
              </h1>
              <p className="text-xs text-gray-400">Browse real system files and documents</p>
            </div>
          </div>
        </div>

        {/* Directory Selector Bar */}
        <div className="flex items-center gap-3 bg-[#12181F] p-2 rounded-2xl border border-emerald-500/20">
          <Search className="w-4 h-4 text-emerald-400 ml-2" />
          <input
            type="text"
            value={searchPath}
            onChange={(e) => setSearchPath(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchFiles(searchPath)}
            placeholder="Directory path (e.g. Pictures, Downloads, Documents)"
            className="flex-1 bg-transparent text-sm text-white outline-none font-mono"
          />
          <button
            onClick={() => fetchFiles(searchPath)}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer"
          >
            Scan Directory
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.length > 0 ? (
            files.slice(0, 30).map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-[#12181F] border border-white/5 font-mono text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate text-gray-200">{f.name || f}</span>
                </div>
                {f.size_formatted && (
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20">
                    {f.size_formatted}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-gray-400 text-xs font-mono">
              Click "Scan Directory" to list files in <code className="text-emerald-400">{searchPath}</code>.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Tools View
  if (path === "tools") {
    return (
      <div className="flex flex-col h-full w-full bg-[#0B0F12] text-white p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-[#12181F] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                Active Registered Tools ({toolsList.length})
              </h1>
              <p className="text-xs text-gray-400">Live backend tool registry &amp; permissions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toolsList.map((t, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#12181F] border border-emerald-500/20 space-y-2 hover:border-emerald-400/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400 font-mono">{t.name}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                  {t.requires_approval ? "Approval Required" : "Auto Safe"}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Terminal View
  if (path === "terminal") {
    return (
      <div className="flex flex-col h-full w-full bg-[#0B0F12] text-white p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-[#12181F] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                Terminal Executor
              </h1>
              <p className="text-xs text-gray-400">Safely execute Linux bash commands</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunCommand()}
            className="flex-1 bg-[#12181F] border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white font-mono outline-none"
            placeholder="Type bash command..."
          />
          <button
            onClick={handleRunCommand}
            disabled={cmdLoading}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer"
          >
            {cmdLoading ? "Executing..." : "Run Command"}
          </button>
        </div>

        {cmdOutput && (
          <div className="p-4 rounded-2xl bg-black border border-emerald-500/30 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
            <pre>{cmdOutput}</pre>
          </div>
        )}
      </div>
    );
  }

  // Render Coming Soon View for Knowledge / Tasks
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#0B0F12] text-white p-8 text-center select-none">
      <div className="w-20 h-24 mb-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        {path === "knowledge" ? (
          <BookOpen className="w-10 h-10 text-emerald-400 animate-pulse" />
        ) : (
          <CheckSquare className="w-10 h-10 text-emerald-400 animate-pulse" />
        )}
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold mb-4">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        COMING SOON
      </div>

      <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
        {path === "knowledge" ? "Local Knowledge Engine (RAG)" : "Automated Tasks &amp; Cron Jobs"}
      </h1>

      <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-6 font-medium">
        {path === "knowledge"
          ? "The local Qdrant vector database knowledge retrieval system is scheduled for Phase 4."
          : "Automated cron scheduling, maintenance jobs, and background workflow pipelines are scheduled for Phase 5."}
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow-lg"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
