import { User, Bell, CheckCircle2, CloudLightning, HelpCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface TopbarProps {
  isWorkflowRunning: boolean;
  isFbConnected: boolean;
  pageTitle: string;
}

export default function Topbar({ isWorkflowRunning, isFbConnected, pageTitle }: TopbarProps) {
  // Sourced from metadata context
  const userEmail = "kiet0123745@gmail.com";
  const userNick = "Alex Thompson"; // Primary design spec name or fallback

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-8 bg-white border-b border-[#E2E8F0]">
      {/* Dynamic View Title */}
      <div className="flex items-center gap-3">
        <h2 className="font-sans font-semibold text-lg text-slate-800 tracking-tight capitalize">
          {pageTitle === "dashboard" ? "Automation Overview" : pageTitle}
        </h2>
        
        {/* Active Engine Indicator Badge */}
        <div className="hidden sm:block">
          <StatusBadge status={isWorkflowRunning ? "running" : isFbConnected ? "idle" : "disconnected"} />
        </div>
      </div>

      {/* Profile & Controls and Integrations */}
      <div className="flex items-center gap-5">
        
        {/* Live gateway sync ping indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 font-mono text-[11px] font-medium select-none">
          <CloudLightning className={`w-3.5 h-3.5 ${isWorkflowRunning ? "text-green-500" : "text-blue-500"}`} />
          <span>n8n Webhook: {isWorkflowRunning ? "STREAMING" : "IDLE"}</span>
        </div>

        {/* Informative info pop triggers */}
        <button className="p-1.5 text-slate-450 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer hidden sm:block">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notification bells */}
        <button className="relative p-1.5 text-slate-450 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Custom User Avatar Box matching design spec */}
        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800 leading-tight">
              {userNick}
            </div>
            <div className="text-[11px] text-[#64748B] font-medium leading-none mt-0.5" title={userEmail}>
              Enterprise Admin
            </div>
          </div>
          <div className="w-9 h-9 bg-[#E2E8F0] border border-slate-200 rounded-full flex items-center justify-center font-semibold text-slate-600 text-xs shadow-sm">
            AT
          </div>
        </div>
      </div>
    </header>
  );
}
