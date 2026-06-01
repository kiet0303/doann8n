import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { FacebookPage, WorkflowLog, WorkflowStats } from "./types";
import { workflowService } from "./services/api";

// Page View modules
import Dashboard from "./pages/Dashboard";
import Fanpages from "./pages/Fanpages";

export default function App() {
  const [currentTab, setTab] = useState<string>("dashboard");
  const [pages, setPages] = useState<FacebookPage[]>(
    () => {
      const saved = localStorage.getItem("fb_pages");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [isFbConnected, setIsFbConnected] = useState<boolean>(
    () => localStorage.getItem("fb_connected") === "true"
  );
  const [isWorkflowRunning, setIsWorkflowRunning] = useState<boolean>(false);
  const [workflowStatus, setWorkflowStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(
    () => localStorage.getItem("fb_sheet_url") || ""
  );
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>(
    () => {
      const saved = localStorage.getItem("fb_selected_pages");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [stats, setStats] = useState<WorkflowStats>({
    connectedPagesCount: 0,
    pendingPostsCount: 0,
    postedContentCount: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Facebook OAuth flow states for detailed user feedback
  const [oauthStatus, setOauthStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string | null;
  }>({ status: "idle", message: null });

  // Extracted OAuth code state initialized on load
  const [oauthCode, setOauthCode] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get("code");
  });

  // Track if we have already triggered the exchange for this code to prevent dual-firing
  const isExchangeStarted = useRef(false);

  // Unified State Synchronizer
  const syncState = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsLoading(true);
    setApiError(null);
    try {
      const savedConnected = localStorage.getItem("fb_connected") === "true";
      const savedPages = JSON.parse(localStorage.getItem("fb_pages") || "[]");
      const savedSelectedIds = JSON.parse(localStorage.getItem("fb_selected_pages") || "[]");
      const savedSheetUrl = localStorage.getItem("fb_sheet_url") || "";
      
      setIsFbConnected(savedConnected);
      setPages(savedPages);
      setSelectedPageIds(savedSelectedIds);
      setGoogleSheetUrl(savedSheetUrl);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate initial configurations on mount
  useEffect(() => {
    syncState(true);
  }, [syncState]);

  // Handle Facebook OAuth code exchange
  useEffect(() => {
    if (!oauthCode) return;
    if (isExchangeStarted.current) return;
    isExchangeStarted.current = true;

    const exchangeCode = async () => {
      setOauthStatus({
        status: "loading",
        message: "Synchronizing with n8n workflow webhook gateway. Fetching managed Facebook Pages...",
      });
      
      try {
        // 3. Send POST request using axios to doankiet n8n webhook
        const n8nRes = await workflowService.submitFacebookCode(oauthCode);
        
        let pagesList: FacebookPage[] = [];
        if (n8nRes) {
          if (Array.isArray(n8nRes.pages)) {
            pagesList = n8nRes.pages;
          } else if (Array.isArray(n8nRes)) {
            pagesList = n8nRes;
          } else if (n8nRes.success && Array.isArray(n8nRes.pages)) {
            pagesList = n8nRes.pages;
          } else {
            // Check for any nested page structures
            const foundArray = Object.values(n8nRes).find(val => Array.isArray(val));
            if (foundArray) {
              pagesList = foundArray as FacebookPage[];
            }
          }
        }

        if (pagesList && pagesList.length > 0) {
          // Sync with local application memory state and session cache
          const syncRes = await workflowService.saveConnectedPages(pagesList);
          console.log("=== SYNC RES ===", JSON.stringify(syncRes, null, 2));
          
          if (syncRes.success) {
            setIsFbConnected(true);
            setPages(syncRes.pages);
            const allPageIds = syncRes.pages.map((p) => p.id);
            setSelectedPageIds(allPageIds);
            
            localStorage.setItem("fb_connected", "true");
            localStorage.setItem("fb_pages", JSON.stringify(syncRes.pages));
            localStorage.setItem("fb_selected_pages", JSON.stringify(allPageIds));
            
            // Clean up config targets
            await workflowService.updateConfig(googleSheetUrl, allPageIds);
            await syncState(false);
            
            // 4. Remove OAuth code from browser URL of doann8n vercel redirect cleanly
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            setOauthStatus({
              status: "success",
              message: `Successfully authenticated! Connected and loaded ${pagesList.length} Facebook fanpages.`,
            });
            
            // Set tab to render fanpages immediately as requested in specs
            setTab("fanpages");
            setOauthCode(null); // Mark as done to prevent any repeating trigger
          } else {
            throw new Error("Unable to register pages list to the Express local memory storage.");
          }
        } else {
          throw new Error("No active or managed Facebook Pages were returned. Make sure the authenticated user is an administrator of the pages.");
        }
      } catch (err: any) {
        console.error("Facebook OAuth exchange error:", err);
        const errMsg = err.response?.data?.message || err.message || "Failed parsing webhook payload";
        
        setOauthStatus({
          status: "error",
          message: `OAuth Connection Error: ${errMsg}. Ensure that n8n endpoint handles security keys properly.`,
        });
        
        // Clear query code anyway to avoid infinity loop or lockups on manual refresh
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        setOauthCode(null);
      }
    };

    exchangeCode();
  }, [oauthCode, googleSheetUrl, syncState]);

  // Polling scheduler specifically while workflow cycle is active
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isWorkflowRunning) {
      timer = setInterval(() => {
        // Silent update to pull new posts metrics and n8n generation logs
        syncState(false);
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWorkflowRunning, syncState]);

  // Handle Facebook Auth Connect Redirect Handler 
  const handleConnectFb = () => {
    const appId = "1264658318811886";
    const redirectUri = "https://doann8n.vercel.app/";
    const scopes = ["pages_show_list", "pages_manage_posts", "pages_read_engagement", "public_profile"].join(",");
    
    const fbOAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&response_type=code`;

    // Perform direct browser redirect
    window.location.href = fbOAuthUrl;
  };

  // Disconnect Facebook integration
  const handleDisconnectFb = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("fb_connected");
      localStorage.removeItem("fb_pages");
      localStorage.removeItem("fb_selected_pages");
      localStorage.removeItem("fb_sheet_url");

      setIsFbConnected(false);
      setIsWorkflowRunning(false);
      setPages([]);
      setSelectedPageIds([]);
      setGoogleSheetUrl("");
      setWorkflowStatus("idle");
    } catch (err: any) {
      setApiError("Disconnecting Facebook returned an error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sheet URL custom update with backend dispatch persistence
  const handleUrlChange = async (url: string) => {
    setGoogleSheetUrl(url);
    localStorage.setItem("fb_sheet_url", url);
    try {
      // Save directly to Express session state store
      await workflowService.updateConfig(url, selectedPageIds);
    } catch (err) {
      console.error("Failed to commit spreadsheet config:", err);
    }
  };

  // Toggle page targets in local and push updates back immediately
  const handleTogglePage = async (id: string) => {
    let updatedPageIds = [];
    if (selectedPageIds.includes(id)) {
      updatedPageIds = selectedPageIds.filter((pId) => pId !== id);
    } else {
      updatedPageIds = [...selectedPageIds, id];
    }
    setSelectedPageIds(updatedPageIds);
    localStorage.setItem("fb_selected_pages", JSON.stringify(updatedPageIds));
  };

  // Batch update target list
  const handleSelectPages = (ids: string[]) => {
    setSelectedPageIds(ids);
    localStorage.setItem("fb_selected_pages", JSON.stringify(ids));
  };

  // Start automation trigger loop with complete n8n payload structure
  const handleStartWorkflow = async (config?: {
    mode: "sheet" | "trend";
    trendKeyword?: string;
    numPosts?: number;
    aiStyle?: string;
    scheduleTime?: string;
  }) => {
    setApiError(null);
    setWorkflowStatus("running");
    setIsWorkflowRunning(true);
    try {
      // Save state to localStorage to prevent losing it on Serverless reset
      localStorage.setItem("fb_pages", JSON.stringify(pages));
      localStorage.setItem("fb_connected", "true");
      localStorage.setItem("fb_selected_pages", JSON.stringify(selectedPageIds));
      localStorage.setItem("fb_sheet_url", googleSheetUrl);

      const selectedPagesData = pages
        .filter(p => selectedPageIds.includes(p.id))
        .map(p => ({ id: p.id, name: p.name, access_token: (p as any).access_token }));

      const res = await workflowService.startWorkflow({
        mode: config?.mode || "sheet",
        sheetUrl: googleSheetUrl,
        selectedPages: selectedPagesData,
        trendKeyword: config?.trendKeyword,
        numPosts: config?.numPosts,
        aiStyle: config?.aiStyle,
        scheduleTime: config?.scheduleTime,
      });

      if (res && res.success) {
        setWorkflowStatus("success");
      } else {
        setWorkflowStatus("error");
      }
    } catch (err: any) {
      setWorkflowStatus("error");
      setApiError(err.response?.data?.message || "Failed to start workflow engine.");
    } finally {
      setIsWorkflowRunning(false);
    }
  };

  // Stop automation cycle
  const handleStopWorkflow = async () => {
    try {
      const res = await workflowService.stopWorkflow();
      if (res.success) {
        setIsWorkflowRunning(res.isWorkflowRunning);
        await syncState(false);
      }
    } catch (err) {
      setApiError("Failed to issue stop call.");
    }
  };

  // Empty historical streams
  const handleClearLogs = async () => {
    try {
      const res = await workflowService.clearLogs();
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err) {
      setApiError("Could not wipe server registers.");
    }
  };

  // Developer database rehydrate trigger
  const handleDevReset = async () => {
    setIsLoading(true);
    try {
      await workflowService.resetConfig();
      await syncState(false);
      setTab("dashboard");
    } catch (err) {
      setApiError("Database re-hydration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine current page rendering views
  const renderTabView = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard
            isWorkflowRunning={isWorkflowRunning}
            isFbConnected={isFbConnected}
            googleSheetUrl={googleSheetUrl}
            onUrlChange={handleUrlChange}
            onConnectFb={handleConnectFb}
            onDisconnectFb={handleDisconnectFb}
            pages={pages}
            selectedPageIds={selectedPageIds}
            onTogglePage={handleTogglePage}
            onSelectPages={handleSelectPages}
            onStartWorkflow={handleStartWorkflow}
            onStopWorkflow={handleStopWorkflow}
            logs={logs}
            onClearLogs={handleClearLogs}
            onRefreshLogs={() => syncState(false)}
            isLoading={isLoading}
            setTab={setTab}
          />
        );
      case "fanpages":
        return (
          <Fanpages
            pages={pages}
            selectedPageIds={selectedPageIds}
            onTogglePage={handleTogglePage}
            onSelectPages={handleSelectPages}
            isFbConnected={isFbConnected}
            onConnectFb={handleConnectFb}
          />
        );


      default:
        return <div className="text-center py-20">View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* 1. Left Sidebar Navigation rail */}
      <Sidebar
        currentTab={currentTab}
        setTab={setTab}
        isFbConnected={isFbConnected}
        onReset={handleDevReset}
      />

      {/* 2. Main content container view panel */}
      <div className="flex-1 flex flex-col pl-64 min-w-0 min-h-screen">
        
        {/* Top Header bar workspace */}
        <Topbar
          isWorkflowRunning={isWorkflowRunning}
          isFbConnected={isFbConnected}
          pageTitle={currentTab}
        />

        {/* Major status alerts */}
        {apiError && (
          <div className="mx-8 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px]">SYSTEM EXCEPTION LOGGED</h4>
              <p className="mt-1 font-medium leading-relaxed">{apiError}</p>
            </div>
          </div>
        )}

        {/* Workflow Status Banners */}
        {workflowStatus !== "idle" && (
          <div className="mx-8 mt-6">
            {workflowStatus === "running" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-700 text-xs shadow-sm shadow-blue-100/50">
                <Loader2 className="w-5 h-5 text-blue-500 shrink-0 animate-spin" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-blue-800">Workflow Running</h4>
                  <p className="mt-1 font-medium leading-relaxed text-blue-600">The automation studio is currently executing your Facebook campaigns...</p>
                </div>
              </div>
            )}
            {workflowStatus === "success" && (
              <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-start gap-3 text-emerald-700 text-xs shadow-sm shadow-emerald-100/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">Workflow Completed!</h4>
                  <p className="mt-1 font-medium leading-relaxed text-emerald-600">Your Facebook workflow has completed successfully.</p>
                </div>
                <button 
                  onClick={() => setWorkflowStatus("idle")}
                  className="text-emerald-500 hover:text-emerald-700 font-bold px-2 text-sm selection:bg-transparent"
                >
                  ×
                </button>
              </div>
            )}
            {workflowStatus === "error" && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs shadow-sm shadow-rose-100/50">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-rose-800">Workflow Failed!</h4>
                  <p className="mt-1 font-medium leading-relaxed text-rose-600">An error occurred while executing the Facebook campaign workflow.</p>
                </div>
                <button 
                  onClick={() => setWorkflowStatus("idle")}
                  className="text-rose-500 hover:text-rose-700 font-bold px-2 text-sm selection:bg-transparent"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Facebook OAuth Notification Banners */}
        {oauthStatus.status !== "idle" && (
          <div className="mx-8 mt-6">
            {oauthStatus.status === "loading" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-700 text-xs shadow-sm shadow-blue-100/50">
                <Loader2 className="w-5 h-5 text-blue-500 shrink-0 animate-spin" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-blue-800">Facebook Authenticating Handshake</h4>
                  <p className="mt-1 font-medium leading-relaxed text-blue-600">{oauthStatus.message}</p>
                </div>
              </div>
            )}
            {oauthStatus.status === "success" && (
              <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-start gap-3 text-emerald-700 text-xs shadow-sm shadow-emerald-100/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">Connection Completed successfully</h4>
                  <p className="mt-1 font-medium leading-relaxed text-emerald-600">{oauthStatus.message}</p>
                </div>
                <button 
                  onClick={() => setOauthStatus({ status: "idle", message: null })}
                  className="text-emerald-500 hover:text-emerald-700 font-bold px-2 text-sm selection:bg-transparent"
                >
                  ×
                </button>
              </div>
            )}
            {oauthStatus.status === "error" && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs shadow-sm shadow-rose-100/50">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-rose-800">Connection authorization aborted</h4>
                  <p className="mt-1 font-medium leading-relaxed text-rose-600">{oauthStatus.message}</p>
                </div>
                <button 
                  onClick={() => setOauthStatus({ status: "idle", message: null })}
                  className="text-rose-500 hover:text-rose-700 font-bold px-2 text-sm selection:bg-transparent"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Fluid layout frame */}
        <main className="flex-1 p-8 outline-none">
          {isLoading && pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <h3 className="font-display font-medium text-sm text-slate-700">Retrieving operational stats...</h3>
              <p className="text-xs text-slate-400 mt-1">Establishing secure connection to AutoFB backend daemon</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {renderTabView()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
