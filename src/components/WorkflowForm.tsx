import React, { useState } from "react";
import { Link2, Play, Square, Facebook, Loader2, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { FacebookPage } from "../types";

interface WorkflowFormProps {
  googleSheetUrl: string;
  onUrlChange: (url: string) => void;
  isFbConnected: boolean;
  onConnectFb: () => void;
  onDisconnectFb: () => void;
  selectedPages: FacebookPage[];
  isWorkflowRunning: boolean;
  onStartWorkflow: () => void;
  onStopWorkflow: () => void;
  isLoading: boolean;
}

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
}: WorkflowFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validate inputs before starting
  const handleStart = () => {
    setError(null);
    setSuccess(null);

    if (!googleSheetUrl) {
      setError("Please paste a valid Google Sheet URL before triggering the automation.");
      return;
    }
    if (!googleSheetUrl.includes("docs.google.com/spreadsheets")) {
      setError("The URL entered doesn't seem to be a valid Google Sheets path.");
      return;
    }
    if (!isFbConnected) {
      setError("You must link a Facebook account with Fanpages permission enabled first.");
      return;
    }
    if (selectedPages.length === 0) {
      setError("You must select at least one Facebook Fanpage from the Page Selector block.");
      return;
    }

    onStartWorkflow();
    setSuccess("n8n Workflow started successfully! Processing first Google Sheets row...");
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleStop = () => {
    onStopWorkflow();
    setSuccess("Workflow loop suspended. Running jobs shut down gracefully.");
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <div className="bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col gap-5 text-slate-800">
      <h2 className="text-base font-semibold text-slate-900 tracking-tight">Workflow Configuration</h2>

      {/* Google Sheets Endpoint Label & Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#64748B] tracking-wide uppercase">
          GOOGLE SHEET SOURCE URL
        </label>
        <input
          type="text"
          value={googleSheetUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={isWorkflowRunning}
          placeholder="Paste Google Sheets URL"
          className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-lg text-sm bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none transition disabled:opacity-60"
        />
        <span className="text-[10px] text-slate-400 font-medium">
          Drives row extractions. Maps columns: <code>[Topic]</code>, <code>[Status]</code>, <code>[PostedAt]</code>.
        </span>
      </div>

      {/* Facebook OAuth Integration Panel */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#64748B] tracking-wide uppercase">
          GRAPH GATEWAY INTEGRATION
        </label>
        
        {!isFbConnected ? (
          <button
            onClick={onConnectFb}
            disabled={isLoading}
            className="w-full py-2.5 px-4 border border-transparent bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition duration-150 cursor-pointer text-center flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Facebook className="w-4 h-4 fill-current" />
            )}
            <span>Connect Facebook Account</span>
          </button>
        ) : (
          <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Gateway Connected</span>
                <span className="text-[10px] text-[#64748B] block mt-0.5 font-medium">Token Status: Active (Expires in 59d)</span>
              </div>
            </div>
            <button
              onClick={onDisconnectFb}
              disabled={isLoading || isWorkflowRunning}
              className="text-xs font-semibold text-[#DC2626] hover:underline disabled:opacity-30 cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Target Pages Selected Summary Label */}
      <div className="flex flex-col gap-1.5 pt-1">
        <label className="text-xs font-bold text-[#64748B] tracking-wide uppercase">
          DESTINATION FEED TARGETS
        </label>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold flex items-center justify-between text-slate-700">
          <span>Active Targets Selected:</span>
          <span className="font-mono text-slate-900 bg-white border border-slate-200/60 px-2 py-0.5 rounded-md">
            {selectedPages.length} Facebook {selectedPages.length === 1 ? "Page" : "Pages"}
          </span>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Actions Workflow button controls */}
      <div className="flex gap-3 pt-2">
        {!isWorkflowRunning ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-transparent bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition text-center cursor-pointer disabled:opacity-50"
          >
            <span>Start Workflow</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-[#DC2626] text-[#DC2626] bg-white hover:bg-red-50 font-semibold text-xs rounded-lg transition text-center cursor-pointer"
          >
            Stop All
          </button>
        )}
      </div>
    </div>
  );
}
