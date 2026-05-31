import React from "react";
import LogsPanel from "../components/LogsPanel";
import { WorkflowLog } from "../types";
import { HelpCircle } from "lucide-react";

interface WorkflowLogsProps {
  logs: WorkflowLog[];
  onClearLogs: () => void;
  isWorkflowRunning: boolean;
  onRefresh: () => void;
}

export default function WorkflowLogs({
  logs,
  onClearLogs,
  isWorkflowRunning,
  onRefresh,
}: WorkflowLogsProps) {
  
  const successCount = logs.filter((l) => l.type === "success").length;
  const warningCount = logs.filter((l) => l.type === "warning" || l.type === "error").length;

  return (
    <div className="space-y-6 text-slate-850">
      {/* Logs view overview card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider block">Audit Portal</span>
          <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight mt-1">
            Workflow Audit Logs Stream
          </h2>
          <p className="text-[#64748B] text-xs">
            Inspect downstream scheduler status, Gemini content payloads, safety checks, and feed dispatch payloads.
          </p>
        </div>

        {/* Rapid Stat metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold shrink-0">
          <div className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] text-slate-800">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase tracking-wide">Captured Blocks</span>
            <span className="font-mono text-base font-bold text-slate-900 mt-0.5 block">{logs.length} Rows</span>
          </div>
          <div className="px-4 py-2 bg-[#EFF6FF] rounded-xl border border-blue-100 text-[#2563EB]">
            <span className="text-[10px] text-[#2563EB] font-bold block uppercase tracking-wide">Successful Jobs</span>
            <span className="font-mono text-base font-bold text-[#2563EB] mt-0.5 block">{successCount} Posts</span>
          </div>
        </div>
      </div>

      {/* Primary logs execution frame */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-3">
          <LogsPanel
            logs={logs}
            onClearLogs={onClearLogs}
            isWorkflowRunning={isWorkflowRunning}
            onRefresh={onRefresh}
          />
        </div>

        {/* Decoder Helper card */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Deciphering Log Feeds</span>
            </h4>
            
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-bold text-slate-700 uppercase font-mono text-[10px] block">SYSTEM INFO</span>
                <p className="mt-1 text-[#64748B] leading-relaxed font-semibold">Recorded during n8n daemon triggers and initialization checks.</p>
              </div>

              <div className="p-3 bg-[#EFF6FF] rounded-lg border border-blue-100">
                <span className="font-bold text-[#2563EB] uppercase font-mono text-[10px] block">SUCCESS EXECUTION</span>
                <p className="mt-1 text-slate-700 leading-relaxed font-semibold">AI caption curated gracefully and dispatched to target Fanpages.</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100/70">
                <span className="font-bold text-amber-700 uppercase font-mono text-[10px] block">WARNING / EVAL</span>
                <p className="mt-1 text-slate-750 leading-relaxed font-semibold">Google Sheets column formatting or network delays detected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
