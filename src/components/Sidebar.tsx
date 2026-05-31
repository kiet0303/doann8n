import { LayoutDashboard, Users, Terminal, Settings, Sliders, RefreshCw } from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isFbConnected: boolean;
  onReset: () => void;
}

export default function Sidebar({ currentTab, setTab, isFbConnected, onReset }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "fanpages", label: "Fanpages", icon: Users },
    { id: "logs", label: "Workflow Logs", icon: Terminal },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-[#0F172A] text-[#F1F5F9] border-r border-slate-800">
      {/* Brand logo bar */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563EB] text-white font-display font-extrabold text-lg shadow-md shadow-blue-500/20">
          A
        </div>
        <div>
          <h1 className="font-display font-bold text-base text-white tracking-tight leading-none">AutoFB</h1>
          <span className="text-xs text-slate-400 font-medium">Workflow Automation</span>
        </div>
      </div>

      {/* Primary Navigation Menu */}
      <nav className="flex-grow py-5 space-y-1">
        <div className="px-6 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Automation Studio
        </div>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[rgba(37,99,235,0.15)] border-l-4 border-[#2563EB] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? "scale-105 text-[#2563EB]" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {item.id === "fanpages" && isFbConnected && (
                <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Quota Tracker Component */}
      <div className="p-4 bg-white/3 mx-4 mb-4 rounded-xl text-[11px] border border-white/5">
        <div className="opacity-60 font-semibold uppercase tracking-wider mb-2 text-[10px] text-slate-300">
          QUOTA USAGE
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="w-[65%] h-full bg-[#2563EB] rounded-full"></div>
        </div>
        <div className="mt-2.5 flex justify-between text-[11px] font-medium text-slate-350">
          <span>6,500 / 10k posts</span>
          <span>65%</span>
        </div>
      </div>

      {/* Admin Utility panel */}
      <div className="p-4 border-t border-slate-800 bg-[#070b14]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Dev Actions</span>
            <span className="font-mono text-[9px] text-slate-600 bg-slate-900 px-1 py-0.5 rounded">v2.4 Production</span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-400 rounded-lg transition-all duration-150 cursor-pointer"
            title="Hydrate and restore dummy database configs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Developer Reset</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
