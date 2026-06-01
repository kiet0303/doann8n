import React from "react";
import WorkflowForm from "../components/WorkflowForm";
import PageSelector from "../components/PageSelector";
import LogsPanel from "../components/LogsPanel";
import WorkflowSteps from "../components/WorkflowSteps";
import { FacebookPage, WorkflowLog } from "../types";

interface DashboardProps {
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
