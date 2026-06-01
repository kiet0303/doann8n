import { CloudLightning } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface TopbarProps {
  isWorkflowRunning: boolean;
  isFbConnected: boolean;
  pageTitle: string;
}

export default function Topbar({ isWorkflowRunning, isFbConnected, pageTitle }: TopbarProps) {
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
      </div>
    </header>
  );
}
