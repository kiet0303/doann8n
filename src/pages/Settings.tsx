import React, { useState } from "react";
import { Server, ShieldCheck, Facebook, KeyRound, Copy } from "lucide-react";

interface SettingsProps {
  googleSheetUrl: string;
  onUrlChange: (url: string) => void;
  isFbConnected: boolean;
  onDisconnectFb: () => void;
  onReset: () => void;
  isWorkflowRunning: boolean;
}

export default function Settings({
  googleSheetUrl,
  onUrlChange,
  isFbConnected,
  onDisconnectFb,
  onReset,
  isWorkflowRunning,
}: SettingsProps) {
  const [copied, setCopied] = useState(false);
  const n8nWebhookUrl = "https://doann8n.vercel.app/api/webhooks/facebook-publish";

  const handleCopy = () => {
    navigator.clipboard.writeText(n8nWebhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title block */}
      <div className="bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm text-left">
        <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider block">Configuration Portal</span>
        <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight mt-1">
          System Settings
        </h2>
        <p className="text-[#64748B] text-xs">
          Manage system configurations, integration variables, and connection gateways.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left column: n8n configurations */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col gap-5 text-left">
          <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#2563EB]" />
            <span>n8n Webhook Endpoint</span>
          </h3>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Target Webhook URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={n8nWebhookUrl}
                className="flex-1 px-3 py-2.5 border border-[#CBD5E1] bg-[#F8FAFC] text-slate-600 rounded-lg font-mono text-xs outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                title="Copy Webhook Endpoint"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              This Vercel proxy coordinates campaign workflows, receives data feeds, and dispatches requests to n8n servers.
            </p>
          </div>
        </div>

        {/* Right column: API & Platform services status */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col gap-5 text-left">
          <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Service Integration Status</span>
          </h3>

          <div className="flex flex-col gap-4">
            {/* Groq API Status Indicator */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Groq AI Status</span>
                  <span className="text-[10px] uppercase font-mono text-slate-500">API connection active</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Ready</span>
              </span>
            </div>

            {/* Facebook Connection Status Indicator */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Facebook className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Facebook Link</span>
                  {isFbConnected ? (
                    <span className="text-[10px] text-slate-500 font-medium">Gateway verified and connected</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">No linked user account</span>
                  )}
                </div>
              </div>
              {isFbConnected ? (
                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Linked</span>
                  </span>
                  <button
                    onClick={onDisconnectFb}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                  <span>Inactive</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
