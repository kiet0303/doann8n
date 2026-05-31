import React from "react";
import { Users, FileText, CheckCircle, Activity, ArrowUpRight } from "lucide-react";
import { WorkflowStats } from "../types";

interface DashboardCardsProps {
  stats: WorkflowStats;
  isWorkflowRunning: boolean;
  isFbConnected: boolean;
  onTabChange: (tab: string) => void;
}

export default function DashboardCards({ stats, isWorkflowRunning, isFbConnected, onTabChange }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Connected Pages */}
      <div 
        onClick={() => onTabChange("fanpages")}
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer hover:border-blue-400 transition"
      >
        <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
          Connected Pages
        </div>
        <div className="text-2xl font-bold mt-1 text-slate-800">
          {isFbConnected ? stats.connectedPagesCount : "0"} Pages
        </div>
        <div className="text-xs text-emerald-500 font-semibold mt-1">
          ↑ 2 from last week
        </div>
      </div>

      {/* Card 2: Pending Posts */}
      <div 
        onClick={() => onTabChange("dashboard")}
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer hover:border-blue-400 transition"
      >
        <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
          Pending Posts
        </div>
        <div className="text-2xl font-bold mt-1 text-slate-800">
          {stats.pendingPostsCount} Queue
        </div>
        <div className="text-xs text-blue-500 font-semibold mt-1">
          Synced from Sheets
        </div>
      </div>

      {/* Card 3: Posted Today */}
      <div 
        onClick={() => onTabChange("logs")}
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer hover:border-blue-400 transition"
      >
        <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
          Posted Today
        </div>
        <div className="text-2xl font-bold mt-1 text-slate-800">
          {stats.postedContentCount} Sent
        </div>
        <div className="text-xs text-slate-500 font-medium mt-1">
          Next run: 15 seconds
        </div>
      </div>

      {/* Card 4: Workflow Status */}
      <div 
        onClick={() => onTabChange("settings")}
        className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer hover:border-blue-400 transition"
      >
        <div className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
          Workflow Status
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isWorkflowRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-350"}`}></div>
          <span className={`font-bold text-xs ${isWorkflowRunning ? "text-emerald-600" : "text-slate-500"}`}>
            {isWorkflowRunning ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          v2.4 Production
        </div>
      </div>
    </div>
  );
}

// Simple clock icon replacement fallback
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
