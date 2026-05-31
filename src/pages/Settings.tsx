import React, { useState } from "react";
import { FileSpreadsheet, Server, RefreshCw, Layers, Lock } from "lucide-react";

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
  const [redirectUri, setRedirectUri] = useState("https://doann8n.vercel.app");

  return (
    <div className="space-y-6 text-slate-850">
      {/* Settings Title container */}
      <div className="bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm">
        <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider block">Configuration Console</span>
        <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight mt-1">
          System Settings & Architecture
        </h2>
        <p className="text-[#64748B] text-xs">
          Review secured API integrations, inspect proxy gateway variables, and visualize pipeline delivery structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Parameters Form Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Parameters Sheet Block */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#2563EB]" />
              <span>Google Sheets Credentials</span>
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Google Sheet Source Link</label>
                <input
                  type="text"
                  value={googleSheetUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  disabled={isWorkflowRunning}
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-lg text-xs bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none transition disabled:opacity-60"
                />
                <span className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Maps row content elements to target publishing outputs. Mandatory columns: <code>[Topic]</code>, <code>[Status]</code>, <code>[PostedAt]</code>.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Sync Daemon Loop Interval</label>
                  <select
                    disabled
                    className="w-full px-3 py-2.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg text-xs text-slate-600 font-sans font-semibold outline-none"
                  >
                    <option>Continuous Polling (Every 15s)</option>
                    <option>On-Demand Manual Ingestion</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Content Moderation Layer</label>
                  <select
                    disabled
                    className="w-full px-3 py-2.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg text-xs text-slate-600 font-sans font-semibold outline-none"
                  >
                    <option>OpenAI Content Safety + Gemini Filter</option>
                    <option>Pass-Through (No safety assessment)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Integration variables */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2563EB]" />
              <span>Proxy API Gateway Parameters</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">n8n Gateway Endpoint</label>
                <input
                  type="text"
                  disabled
                  value="https://n8n.cloud.instance/webhook-fb-syndication-router"
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] bg-[#F8FAFC] text-slate-500 rounded-lg font-mono text-[11px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Facebook OAuth Redirect URI</label>
                <input
                  type="text"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] text-slate-800 rounded-lg font-mono text-[11px] outline-none transition"
                  placeholder="https://autofb.vercel.app/"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide font-mono">App Client identity</label>
                <input
                  type="text"
                  disabled
                  value="1264658318811886"
                  className="w-full px-3 py-2.5 border border-[#CBD5E1] bg-[#F8FAFC] text-slate-500 rounded-lg font-mono text-[11px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Graph Token Expiration</label>
                <span className="block px-3 py-2.5 border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-slate-700 font-semibold rounded-lg leading-snug">
                  {isFbConnected ? "Expires in 59 Days (Long-Lived Graph Token Active)" : "No Valid Integration Token Found"}
                </span>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">OAuth Access Controls</label>
                {isFbConnected ? (
                  <button
                    onClick={onDisconnectFb}
                    className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 text-[#DC2626] border border-[#DC2626] font-semibold text-xs rounded-lg transition duration-150 cursor-pointer text-center"
                  >
                    Revoke Facebook Profile Token
                  </button>
                ) : (
                  <span className="block text-xs text-slate-400 p-2.5 border border-slate-100 bg-slate-50 rounded-lg">
                    Tokens are currently clean. No active credentials.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Security info + Architecture Chart details */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Gemini Lock security compliance info */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-md text-[#E2E8F0] text-left flex flex-col gap-4">
            <div className="p-2 w-fit bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-lg">
              <Lock className="w-5 h-5 text-[#2563EB]" />
            </div>

            <div>
              <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider">Secured Key Vault</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-2 font-semibold">
                Our backend isolates sensitive API secrets server-side. Your **Gemini API Key** and Graph Webhook headers are encrypted dynamically to process campaigns with absolute data safety.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-center gap-2 text-[10px] text-[#64748B] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>VAULT SECURE — AES-256</span>
            </div>
          </div>

          {/* Informational Database resets */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm text-left">
            <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">Diagnostic Tools</h4>
            <p className="text-[#64748B] text-xs font-semibold mb-4 leading-relaxed">
              Reset database memory states back to default baseline mock structures and testing payloads instantly.
            </p>
            <button
              onClick={onReset}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer transition border border-transparent"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hydrate Database Baseline</span>
            </button>
          </div>

          {/* Active n8n Dispatch Payload Section (#15 Requirement) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm text-left">
            <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
              Active n8n Webhook Payload
            </h4>
            <p className="text-[#64748B] text-[11px] font-semibold mb-3 leading-relaxed">
              Dynamic payload structure transmitted to the backend/n8n gateway when the workflow is active:
            </p>
            <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto border border-slate-900 leading-normal select-all">
{JSON.stringify({
  sheetUrl: googleSheetUrl || "https://docs.google.com/spreadsheets/...",
  redirectUri: redirectUri,
  selectedPages: isFbConnected ? [
    { id: "pg_1", name: "TechCraft Insights", access_token: "EAAUxb..." },
    { id: "pg_3", name: "AI Automation Hub", access_token: "EAAUxb..." }
  ] : []
}, null, 2)}
            </pre>
            <span className="text-[10px] text-slate-400 font-medium block mt-2">
              Note: Page access tokens are automatically passed through server-side secret stores securely.
            </span>
          </div>
        </div>
      </div>

      {/* Modern visual workflow pipeline section */}
      <div className="bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm text-left">
        <h3 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span>Automated Publishing Route Schema</span>
        </h3>

        {/* Responsive flowchart items */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          
          {/* Step 1 */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg relative self-stretch flex flex-col justify-between">
            <span className="font-mono text-[10px] font-bold text-[#64748B]">STEP 01</span>
            <h4 className="font-bold text-xs text-slate-950 mt-2">Row Extraction</h4>
            <p className="text-[10px] text-[#64748B] leading-relaxed mt-1 font-semibold">n8n queries connected spreadsheet for raw topic idea records.</p>
          </div>

          {/* Link arrow */}
          <div className="hidden md:flex justify-center text-slate-350 font-bold">
            →
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg relative self-stretch flex flex-col justify-between">
            <span className="font-mono text-[10px] font-bold text-[#2563EB]">STEP 02</span>
            <h4 className="font-bold text-xs text-slate-950 mt-2">AI Campaign Synthesis</h4>
            <p className="text-[10px] text-[#64748B] leading-relaxed mt-1 font-semibold">Gemini analyzes the raw topic prompts and drafts compliant hashtags.</p>
          </div>

          {/* Link arrow */}
          <div className="hidden md:flex justify-center text-slate-350 font-bold">
            →
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0]/85 rounded-lg relative self-stretch flex flex-col justify-between">
            <span className="font-mono text-[10px] font-bold text-emerald-600">STEP 03</span>
            <h4 className="font-bold text-xs text-slate-950 mt-2">Graph Syndication</h4>
            <p className="text-[10px] text-[#64748B] leading-relaxed mt-1 font-semibold">The backend publishes generated copy concurrently across selected Fanpages.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
