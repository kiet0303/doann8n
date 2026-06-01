import { LayoutDashboard, Users } from "lucide-react";

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
    </aside>
  );
}
