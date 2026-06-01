import React, { useState, useEffect } from "react";
import { Link2, Play, Square, Facebook, Loader2, AlertCircle, CheckCircle2, ArrowRight, Check, Sparkles } from "lucide-react";
import { FacebookPage } from "../types";

interface WorkflowFormProps {
  googleSheetUrl: string;
  onUrlChange: (url: string) => void;
  isFbConnected: boolean;
  onConnectFb: () => void;
  onDisconnectFb: () => void;
  selectedPages: FacebookPage[];
  isWorkflowRunning: boolean;
  onStartWorkflow: (config?: {
    mode: "sheet" | "trend";
    trendKeyword?: string;
    numPosts?: number;
    aiStyle?: string;
    scheduleTime?: string;
  }) => void;
  onStopWorkflow: () => void;
  isLoading: boolean;
  pages?: FacebookPage[];
}

const AI_STYLES = ["Gen Z", "Professional", "Funny", "Minimal", "Sales"];

export default function WorkflowForm({
  googleSheetUrl,
  onUrlChange,
  isFbConnected,
  onConnectFb,
  onDisconnectFb,
  selectedPages,
  isWorkflowRunning,
  onStartWorkflow,
  onStopWorkflow,
  isLoading,
  pages = [],
}: WorkflowFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localSheetUrl, setLocalSheetUrl] = useState(googleSheetUrl);
  const [isSaved, setIsSaved] = useState(false);

  // Advanced Mode State
  const [workflowMode, setWorkflowMode] = useState<"sheet" | "trend">(
    () => (localStorage.getItem("fb_workflow_mode") as "sheet" | "trend") || "sheet"
  );
  const [trendCategory, setTrendCategory] = useState<string>(
    () => localStorage.getItem("fb_trend_category") || "technology"
  );
  const [aiStyle, setAiStyle] = useState<string>(
    () => localStorage.getItem("fb_ai_style") || "Professional"
  );
  const [scheduleTime, setScheduleTime] = useState<string>(
    () => localStorage.getItem("fb_schedule_time") || ""
  );

  useEffect(() => {
    setLocalSheetUrl(googleSheetUrl);
  }, [googleSheetUrl]);

  // Validate inputs before starting
  const handleStart = () => {
    setError(null);
    setSuccess(null);

    // Common validations
    if (!isFbConnected) {
      setError("Please link a Facebook account first.");
      return;
    }
    if (selectedPages.length === 0) {
      setError("Please select at least one Facebook page.");
      return;
    }

    // Mode-specific validations
    if (workflowMode === "sheet") {
      if (!googleSheetUrl) {
        setError("Please paste a valid Google Sheet URL before triggering the automation.");
        return;
      }
      if (!googleSheetUrl.includes("docs.google.com/spreadsheets")) {
        setError("The URL entered doesn't seem to be a valid Google Sheets path.");
        return;
      }
    } else {
      if (!trendCategory.trim()) {
        setError("Please specify a trend category.");
        return;
      }
    }

    onStartWorkflow({
      mode: workflowMode,
      trendKeyword: workflowMode === "trend" ? trendCategory : undefined,
      numPosts: 1, // simplified to 1 post for stable demo
      aiStyle: workflowMode === "trend" ? aiStyle : undefined,
    });

    if (workflowMode === "sheet") {
      setSuccess("Google Sheets AI Posting started!");
    } else {
      setSuccess(`Google Trends AI Posting triggered for: "${trendCategory}"!`);
    }
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleStop = () => {
    onStopWorkflow();
    setSuccess("Workflow loop suspended.");
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <div id="workflow-cfg-form" className="bg-white p-5 border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col gap-5 text-slate-800 text-left">
      <div id="workflow-cfg-header" className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <span>Campaign Creator</span>
        </h2>
        {/* Minimalist status badge */}
        <span id="workflow-status-badge" className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isWorkflowRunning 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-150 animate-pulse" 
            : "bg-slate-50 text-slate-500 border border-slate-150"
        }`}>
          {isWorkflowRunning ? "Active" : "Idle"}
        </span>
      </div>

      {/* SECTION 1: WORKFLOW MODE */}
      <div id="section-workflow-mode" className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-[#64748B] tracking-wider uppercase">
            1. Workflow Mode
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            id="mode-btn-sheet"
            type="button"
            onClick={() => {
              setWorkflowMode("sheet");
              localStorage.setItem("fb_workflow_mode", "sheet");
            }}
            disabled={isWorkflowRunning}
            className={`p-2.5 rounded-lg border text-left transition relative cursor-pointer ${
              workflowMode === "sheet"
                ? "border-blue-600 bg-blue-50/20 text-slate-900 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white text-slate-600 font-medium"
            } ${isWorkflowRunning ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-xs font-bold ${workflowMode === "sheet" ? "text-blue-900" : "text-slate-800"}`}>
                Google Sheet Posting
              </span>
              <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                workflowMode === "sheet" ? "border-blue-600 bg-blue-600" : "border-slate-300"
              }`}>
                {workflowMode === "sheet" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </div>
          </button>

          <button
            id="mode-btn-trend"
            type="button"
            onClick={() => {
              setWorkflowMode("trend");
              localStorage.setItem("fb_workflow_mode", "trend");
            }}
            disabled={isWorkflowRunning}
            className={`p-2.5 rounded-lg border text-left transition relative cursor-pointer ${
              workflowMode === "trend"
                ? "border-blue-600 bg-blue-50/20 text-slate-900 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white text-slate-600 font-medium"
            } ${isWorkflowRunning ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-xs font-bold ${workflowMode === "trend" ? "text-blue-900" : "text-slate-800"}`}>
                Google Trends Posting
              </span>
              <div className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                workflowMode === "trend" ? "border-blue-600 bg-blue-600" : "border-slate-300"
              }`}>
                {workflowMode === "trend" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: WORKFLOW CONFIGURATION */}
      <div id="section-workflow-config" className="space-y-3 bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl text-left">
        <span className="text-[11px] font-extrabold text-[#64748B] tracking-wider uppercase block">
          2. Workflow Configuration
        </span>

        {workflowMode === "sheet" && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                id="sheet-url-input"
                type="text"
                value={localSheetUrl}
                onChange={(e) => setLocalSheetUrl(e.target.value)}
                disabled={isWorkflowRunning}
                placeholder="Google Sheets Source URL"
                className="flex-grow px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none transition disabled:opacity-60 font-mono"
              />
              <button
                id="save-sheet-url-btn"
                type="button"
                onClick={() => {
                  onUrlChange(localSheetUrl);
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 2000);
                }}
                disabled={localSheetUrl === googleSheetUrl || !localSheetUrl || isWorkflowRunning}
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Required columns: <code>topic</code>, <code>product_info</code>, <code>ai_style</code>, <code>schedule_time</code>, <code>status</code>
            </p>
          </div>
        )}

        {workflowMode === "trend" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Trend Category input */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wide">Category</span>
              <input
                id="trend-category-input"
                type="text"
                value={trendCategory}
                onChange={(e) => {
                  setTrendCategory(e.target.value);
                  localStorage.setItem("fb_trend_category", e.target.value);
                }}
                disabled={isWorkflowRunning}
                placeholder="gaming, technology, beauty..."
                className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-lg text-xs bg-white focus:border-[#2563EB] outline-none transition disabled:opacity-60 font-semibold text-slate-800"
              />
            </div>

            {/* AI Style selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wide">Style</span>
              <select
                id="trend-ai-style-select"
                value={aiStyle}
                onChange={(e) => {
                  setAiStyle(e.target.value);
                  localStorage.setItem("fb_ai_style", e.target.value);
                }}
                disabled={isWorkflowRunning}
                className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded-lg text-xs bg-white focus:border-[#2563EB] outline-none transition disabled:opacity-60 font-semibold text-slate-700 cursor-pointer"
              >
                {AI_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style} Style
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Minimalist workflow visualization line */}
        <div id="workflow-visualization" className="pt-2.5 border-t border-slate-200/50 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold justify-center uppercase">
          {workflowMode === "sheet" ? (
            <>
              <span className="text-slate-500">Google Sheet</span>
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span className="text-blue-600 font-extrabold">Groq AI</span>
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span className="text-slate-500">Facebook Pages</span>
            </>
          ) : (
            <>
              <span className="text-slate-500">Google Trends API</span>
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span className="text-blue-600 font-extrabold">Groq AI</span>
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span className="text-slate-500">Facebook Pages</span>
            </>
          )}
        </div>
      </div>

      {/* SECTION 3: SELECTED FACEBOOK PAGES */}
      <div id="section-selected-pages" className="space-y-2.5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-[#64748B] tracking-wider uppercase">
            3. Selected Facebook Pages
          </span>
          {/* Extremely compact facebook linked status info */}
          {isFbConnected ? (
            <div className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
              <span>Connected as: <strong className="text-slate-600">Admin Account</strong></span>
              <span>•</span>
              <span>{pages.length} loaded</span>
              <span>•</span>
              <button
                type="button"
                onClick={onDisconnectFb}
                disabled={isLoading || isWorkflowRunning}
                className="text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wide">Not Linked</span>
          )}
        </div>

        {isFbConnected ? (
          /* Chips representation of selected pages */
          <div className="p-3 bg-white border border-[#CBD5E1]/40 rounded-xl space-y-2 text-left">
            {selectedPages.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pages selected. Use the Page Selector panel on the right.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedPages.map((page) => (
                  <span
                    key={page.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] rounded-full border border-blue-105/50 leading-none select-none"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>{page.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Minimalist embedded Connect block if disconnected */
          <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-between gap-4 text-left">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Link Facebook Profile</span>
              <span className="text-[10px] text-slate-400 font-medium">Authorizes AI caption broadcasting via Graph Page Tokens</span>
            </div>
            <button
              type="button"
              onClick={onConnectFb}
              disabled={isLoading}
              className="px-3 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Facebook className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Connect FB</span>
            </button>
          </div>
        )}
      </div>

      {/* Error and Success messages */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-105 text-rose-750 text-xs rounded-lg text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-105 text-emerald-750 text-xs rounded-lg text-left">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Execute trigger actions */}
      <div className="pt-1">
        {!isWorkflowRunning ? (
          <button
            id="start-ai-posting-btn"
            type="button"
            onClick={handleStart}
            disabled={isLoading}
            className="w-full py-3 px-4 border border-transparent bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition text-center cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm active:scale-[0.99] select-none"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{workflowMode === "trend" ? "Generate & Post" : "Start AI Posting"}</span>
          </button>
        ) : (
          <button
            id="stop-ai-posting-btn"
            type="button"
            onClick={handleStop}
            disabled={isLoading}
            className="w-full py-3 px-4 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold text-xs rounded-lg transition text-center cursor-pointer inline-flex items-center justify-center gap-2 uppercase tracking-wider select-none"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop Posting</span>
          </button>
        )}
      </div>
    </div>
  );
}
