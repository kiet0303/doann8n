import React, { useState } from "react";
import { Terminal, Trash2, Filter, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, AlertCircle, Info, RefreshCw, Copy, Clock, Sparkles } from "lucide-react";
import { WorkflowLog } from "../types";

interface LogsPanelProps {
  logs: WorkflowLog[];
  onClearLogs: () => void;
  isWorkflowRunning: boolean;
  onRefresh: () => void;
}

export default function LogsPanel({ logs, onClearLogs, isWorkflowRunning, onRefresh }: LogsPanelProps) {
  const [filterType, setFilterType] = useState<"all" | "info" | "success" | "warning_error">("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    if (filterType === "all") return true;
    if (filterType === "info") return log.type === "info";
    if (filterType === "success") return log.type === "success";
    if (filterType === "warning_error") return log.type === "warning" || log.type === "error";
    return true;
  });

  const toggleExpand = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  const getLogColors = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50/50 border-green-100",
          text: "text-green-800",
          accent: "border-green-500",
          icon: CheckCircle,
          iconColor: "text-green-500"
        };
      case "warning":
        return {
          bg: "bg-amber-50/50 border-amber-100",
          text: "text-amber-800",
          accent: "border-amber-500",
          icon: AlertTriangle,
          iconColor: "text-amber-500"
        };
      case "error":
        return {
          bg: "bg-red-50/50 border-slate-150",
          text: "text-red-800",
          accent: "border-red-500",
          icon: AlertCircle,
          iconColor: "text-red-500"
        };
      default:
        return {
          bg: "bg-slate-50 border-slate-100",
          text: "text-slate-700",
          accent: "border-slate-300",
          icon: Info,
          iconColor: "text-slate-400"
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-lg text-slate-300 overflow-hidden font-sans">
      {/* Upper control header */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800 text-blue-400 rounded-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-medium text-base text-white tracking-tight flex items-center gap-2">
              <span>n8n Workflow Execution Audit</span>
              {isWorkflowRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">Real-time status updates, Groq AI caption payloads, & safety evaluations</p>
          </div>
        </div>

        {/* Clear and Refresh controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
          <button
            onClick={onRefresh}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition-all duration-150 cursor-pointer"
            title="Fetch latest log sequence"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            onClick={onClearLogs}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800/40 hover:bg-red-900/30 hover:text-red-300 border border-slate-800 hover:border-red-900/60 text-slate-400 rounded-lg transition-all duration-150 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear audit logs</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar row */}
      <div className="px-5 py-2.5 bg-slate-950/30 border-b border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span>Filter audit feeds:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              filterType === "all" ? "bg-slate-800 text-white" : "hover:text-slate-300"
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setFilterType("success")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              filterType === "success" ? "bg-green-950/40 text-green-400 border border-green-900/35" : "hover:text-slate-300"
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setFilterType("warning_error")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              filterType === "warning_error" ? "bg-rose-950/40 text-rose-400 border border-rose-900/35" : "hover:text-slate-300"
            }`}
          >
            Warnings & Errors
          </button>
          <button
            onClick={() => setFilterType("info")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              filterType === "info" ? "bg-blue-900/20 text-blue-400" : "hover:text-slate-300"
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* Logs stream viewport list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Terminal className="w-12 h-12 text-slate-800 mb-2.5 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-600">No matching audit logs</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">No activity recorded for this category yet. Start the automator engine above to trigger live logs.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const logStyles = getLogColors(log.type);
            const LogIcon = logStyles.icon;
            
            // Format time string nicely to HH:mm:ss for professional developer aesthetic
            let timeString = "";
            try {
              const d = new Date(log.timestamp);
              timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            } catch (e) {
              timeString = "00:00:00";
            }

            return (
              <div
                key={log.id}
                className={`border rounded-xl transition-all ${
                  isExpanded ? "bg-slate-900/80 border-slate-750" : "border-slate-850/60 hover:bg-slate-850/20 hover:border-slate-800"
                }`}
              >
                {/* Header row clickable summary */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Timestamp bullet */}
                    <span className="font-mono text-[10px] text-slate-500 mt-0.5 shrink-0 bg-slate-950 px-2 py-0.5 rounded leading-none">
                      {timeString}
                    </span>

                    {/* Level icon */}
                    <div className={`${logStyles.iconColor} mt-0.5 shrink-0`}>
                      <LogIcon className="w-4.5 h-4.5" />
                    </div>

                    {/* Logging message title */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium leading-relaxed truncate ${isExpanded ? "text-white font-semibold" : "text-slate-300"}`}>
                        {log.message}
                      </p>
                    </div>
                  </div>

                  {/* Expand indicators */}
                  <div className="ml-3 pl-2 text-slate-500 border-l border-slate-800 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-350" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-450" />
                    )}
                  </div>
                </div>

                {/* Expanded Details metadata panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-800 bg-slate-950/80 rounded-b-xl text-left">
                    {/* Multi-badge details header */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.type === "success" ? "bg-emerald-900/40 text-emerald-350 border border-emerald-800/40" :
                        log.type === "error" ? "bg-rose-950/40 text-rose-350 border border-rose-800/40" :
                        "bg-blue-950/40 text-blue-350 border border-blue-800/40"
                      }`}>
                        Status: {
                          log.type === "success" ? "posted" :
                          log.type === "error" ? "failed" :
                          "pending"
                        }
                      </span>

                      {/* Workflow Type Badge */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800">
                        Type: {
                          (log.message + " " + (log.details || "")).toLowerCase().includes("trend") 
                            ? "Google Trends Posting" 
                            : "Google Sheet Posting"
                        }
                      </span>

                      {/* AI Tone Style Badge */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-955/40 text-violet-300 border border-violet-800/40 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Style: {
                          (() => {
                            const combined = (log.message + " " + (log.details || "")).toLowerCase();
                            if (combined.includes("gen z")) return "Gen Z style";
                            if (combined.includes("professional")) return "Professional standard";
                            if (combined.includes("funny")) return "Funny / Witty";
                            if (combined.includes("luxury")) return "Luxury branding";
                            if (combined.includes("minimal")) return "Minimalist style";
                            if (combined.includes("sales")) return "Sales pitch";
                            return "Standard copy";
                          })()
                        }</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Log description metadata */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>TIMELINE SCHEDULE</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Scheduled Time</span>
                              <span className="text-slate-300">
                                {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Posted Time</span>
                              <span className="text-slate-300">
                                {log.type === "success" 
                                  ? `${new Date(log.timestamp).toLocaleDateString()} ${new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}`
                                  : "Awaiting Dispatch"
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Payload Content / Response:</span>
                          <p className="p-3.5 bg-slate-900 border border-slate-850 text-xs font-mono text-slate-300 rounded-xl whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto">
                            {log.details || "No supplementary JSON payload transmitted for this execution step."}
                          </p>
                        </div>
                      </div>

                      {/* Mock Interactive Post Preview Card */}
                      <div className="lg:col-span-5 flex flex-col">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Facebook Draft Caption Preview:</span>
                        <div className="flex-1 bg-slate-900/85 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between text-left shadow-inner">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                                F
                              </div>
                              <div>
                                <h5 className="text-[11px] font-bold text-white leading-tight">Selected Page Dispatcher</h5>
                                <span className="text-[9px] text-slate-500 flex items-center gap-0.5 leading-none mt-0.5">
                                  <span>Generated by Groq AI</span>
                                  <span>• Public</span>
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-slate-300 text-xs line-clamp-5 leading-normal italic select-all cursor-pointer font-sans">
                              {log.details && log.details.length > 10 ? (
                                log.details.includes("{") ? "Draft caption nested in API JSON payload details..." : log.details
                              ) : log.message || "Awaiting drafting parameters..."}
                            </p>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-slate-850 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-mono">1 Likes • 0 Comments</span>
                            <button
                              onClick={() => {
                                const caption = log.details || log.message;
                                navigator.clipboard.writeText(caption);
                                alert("Success: Caption copied to clipboard!");
                              }}
                              className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 hover:text-white transition rounded-md text-[10px] font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Draft</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-500 mt-4 pt-3.5 border-t border-slate-900 font-mono">
                      <span>FLOW RUN ID: <strong className="text-slate-450 uppercase">{log.id}</strong></span>
                      <span>STATUS LEVEL: <span className="text-slate-400 font-bold uppercase">{log.type}</span></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer status info */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isWorkflowRunning ? "bg-green-500" : "bg-slate-600"}`} />
          <span>Active Daemon: <code>AutoFB v1.0.3</code></span>
        </div>
        <div className="mt-1 sm:mt-0 font-mono text-[10px]">
          Showing {filteredLogs.length} logs · n8n webhook active
        </div>
      </div>
    </div>
  );
}
