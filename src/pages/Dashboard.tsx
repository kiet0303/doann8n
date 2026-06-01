import React from "react";
import DashboardCards from "../components/DashboardCards";
import WorkflowForm from "../components/WorkflowForm";
import PageSelector from "../components/PageSelector";
import LogsPanel from "../components/LogsPanel";
import WorkflowSteps from "../components/WorkflowSteps";
import { FacebookPage, WorkflowLog, WorkflowStats } from "../types";
import { Sparkles, ArrowRight, ExternalLink } from "lucide-react";

interface DashboardProps {
  stats: WorkflowStats;
  isWorkflowRunning: boolean;
  isFbConnected: boolean;
  googleSheetUrl: string;
  onUrlChange: (url: string) => void;
  onConnectFb: () => void;
  onDisconnectFb: () => void;
  pages: FacebookPage[];
  selectedPageIds: string[];
  onTogglePage: (id: string) => void;
  onStartWorkflow: (config?: {
    mode: "sheet" | "trend";
    trendKeyword?: string;
    numPosts?: number;
    aiStyle?: string;
    scheduleTime?: string;
  }) => void;
  onStopWorkflow: () => void;
  logs: WorkflowLog[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
  isLoading: boolean;
  setTab: (tab: string) => void;
}

export default function Dashboard({
  stats,
  isWorkflowRunning,
  isFbConnected,
  googleSheetUrl,
  onUrlChange,
  onConnectFb,
  onDisconnectFb,
  pages,
  selectedPageIds,
  onTogglePage,
  onStartWorkflow,
  onStopWorkflow,
  logs,
  onClearLogs,
  onRefreshLogs,
  isLoading,
  setTab,
}: DashboardProps) {
  
  const selectedPages = pages.filter((p) => selectedPageIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Upper overview header matching layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm">
        <div>
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider block">Automation Studio</span>
          <h1 className="font-sans font-bold text-xl text-slate-800 tracking-tight mt-1">
            Automation Overview
          </h1>
          <p className="text-[#64748B] text-xs mt-1">
            Bespoke Facebook Fanpage broadcasting. Concurrently push high-fidelity AI-generated campaigns from Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://facebook.com/pages"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition rounded-lg"
          >
            <span>Manage Fanpages</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setTab("settings")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-xs font-semibold text-white transition rounded-lg"
          >
            <span>Technical Settings</span>
          </button>
        </div>
      </div>

      {/* Core statistics cards */}
      <DashboardCards
        stats={stats}
        isWorkflowRunning={isWorkflowRunning}
        isFbConnected={isFbConnected}
        onTabChange={setTab}
      />

      {/* Primary configuration, Logs, and Page Selector grid matching spec */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] auto-rows-min gap-6 items-start">
        
        {/* Left Column Stack */}
        <div className="flex flex-col gap-6">
          {/* 1. Workflow Config Panel */}
          <WorkflowForm
            googleSheetUrl={googleSheetUrl}
            onUrlChange={onUrlChange}
            isFbConnected={isFbConnected}
            onConnectFb={onConnectFb}
            onDisconnectFb={onDisconnectFb}
            selectedPages={selectedPages}
            isWorkflowRunning={isWorkflowRunning}
            onStartWorkflow={onStartWorkflow}
            onStopWorkflow={onStopWorkflow}
            isLoading={isLoading}
            pages={pages}
          />

          {/* 2. AI Workflow Status Monitor */}
          <WorkflowSteps
            isWorkflowRunning={isWorkflowRunning}
            logs={logs}
          />

          {/* 3. Real-time log stream */}
          <LogsPanel
            logs={logs}
            onClearLogs={onClearLogs}
            isWorkflowRunning={isWorkflowRunning}
            onRefresh={onRefreshLogs}
          />
        </div>

        {/* Right Column (Select Pages selector catalog) */}
        <div className="lg:sticky lg:top-20">
          <PageSelector
            pages={pages}
            selectedPageIds={selectedPageIds}
            onTogglePage={onTogglePage}
            isFbConnected={isFbConnected}
          />
        </div>

      </div>
    </div>
  );
}
