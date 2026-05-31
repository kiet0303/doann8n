import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, AlertCircle } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { FacebookPage, WorkflowLog, WorkflowStats } from "./types";
import { workflowService } from "./services/api";

// Page View modules
import Dashboard from "./pages/Dashboard";
import Fanpages from "./pages/Fanpages";
import WorkflowLogs from "./pages/WorkflowLogs";
import Settings from "./pages/Settings";

export default function App() {
  const [currentTab, setTab] = useState<string>("dashboard");
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [isFbConnected, setIsFbConnected] = useState<boolean>(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState<boolean>(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>("");
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    connectedPagesCount: 0,
    pendingPostsCount: 0,
    postedContentCount: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Unified State Synchronizer
  const syncState = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsLoading(true);
    setApiError(null);
    try {
      // Parallelize fetches of pages, status, and logs for fast cold loadings
      const [statusRes, pagesRes, logsRes] = await Promise.all([
        workflowService.getStatus(),
        workflowService.getPages(),
        workflowService.getLogs(),
      ]);

      setIsFbConnected(statusRes.isFbConnected);
      setIsWorkflowRunning(statusRes.isWorkflowRunning);
      setGoogleSheetUrl(statusRes.googleSheetUrl);
      setSelectedPageIds(statusRes.selectedPageIds);
      setStats(statusRes.stats);
      setPages(pagesRes.pages);
      setLogs(logsRes.logs);
    } catch (err: any) {
      console.error("API Synchronization failed:", err);
      setApiError(
        err.response?.data?.message || 
        "Failed to communicate with Express API. Verify server port binding."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate initial configurations on mount
  useEffect(() => {
    syncState(true);
  }, [syncState]);

  // Decode code parameter returned from the Vercel Facebook redirect route
  const handleOauthCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // 5. Submit authorization code securely to the n8n webhook API
      const n8nRes = await workflowService.submitFacebookCode(code);
      
      if (n8nRes && n8nRes.pages) {
        // 6. Push return records to our local server configurations store
        const syncRes = await workflowService.saveConnectedPages(n8nRes.pages);
        
        if (syncRes.success) {
          setIsFbConnected(true);
          setPages(syncRes.pages);
          const allPageIds = syncRes.pages.map((p) => p.id);
          setSelectedPageIds(allPageIds);
          
          await workflowService.updateConfig(googleSheetUrl, allPageIds);
          await syncState(false);
          setTab("fanpages"); // Auto navigate to feed tables view
        }
      } else {
        throw new Error("n8n responded successfully but did not supply pages list elements.");
      }
    } catch (err: any) {
      console.error("Facebook OAuth exchange error:", err);
      setApiError(
        `OAuth Connection Error: ${
          err.response?.data?.message || err.message || "n8n response has empty data structure"
        }. Please verify that the n8n webhook gateway at 'https://doankiet.app.n8n.cloud/webhook/facebook-pages' is accepting POST payloads.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [googleSheetUrl, syncState]);

  // Listen for callback code parameters in routing context
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      // Remove query code arg cleanly from adress bar to keep beautiful SaaS styling matching URL norms
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Handle the code exchange trigger
      handleOauthCallback(code);
    }
  }, [handleOauthCallback]);

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
    const redirectUri = "https://doann8n.vercel.app";
    const scopes = ["pages_show_list", "pages_manage_posts", "public_profile"].join(",");
    
    const fbOAuthUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&response_type=code`;

    // Perform direct browser redirect
    window.location.href = fbOAuthUrl;
  };

  // Disconnect Facebook integration
  const handleDisconnectFb = async () => {
    setIsLoading(true);
    try {
      const res = await workflowService.disconnectFacebook();
      if (res.success) {
        setIsFbConnected(res.isFbConnected);
        setIsWorkflowRunning(false);
        setPages(res.pages);
        setSelectedPageIds([]);
        await syncState(false);
      }
    } catch (err: any) {
      setApiError("Disconnecting Facebook returned an error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sheet URL custom update with backend dispatch persistence
  const handleUrlChange = async (url: string) => {
    setGoogleSheetUrl(url);
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

    try {
      await workflowService.updateConfig(googleSheetUrl, updatedPageIds);
      // Synchronize in-memory stats immediately
      await syncState(false);
    } catch (err) {
      console.error("Failed to commit target state:", err);
    }
  };

  // Start automation trigger loop with complete n8n payload structure
  const handleStartWorkflow = async () => {
    setApiError(null);
    try {
      const activePagesPayload = pages
        .filter((page) => selectedPageIds.includes(page.id))
        .map((page) => ({
          id: page.id,
          name: page.name,
          access_token: page.access_token || page.accessToken || "EAAUxb_mock_access_token_for_n8n"
        }));

      const payload = {
        sheetUrl: googleSheetUrl,
        selectedPages: activePagesPayload
      };

      const res = await workflowService.startWorkflow(payload);
      if (res.success) {
        setIsWorkflowRunning(res.isWorkflowRunning);
        await syncState(false);
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to start workflow engine.");
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
            stats={stats}
            isWorkflowRunning={isWorkflowRunning}
            isFbConnected={isFbConnected}
            googleSheetUrl={googleSheetUrl}
            onUrlChange={handleUrlChange}
            onConnectFb={handleConnectFb}
            onDisconnectFb={handleDisconnectFb}
            pages={pages}
            selectedPageIds={selectedPageIds}
            onTogglePage={handleTogglePage}
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
            isFbConnected={isFbConnected}
            onConnectFb={handleConnectFb}
          />
        );
      case "logs":
        return (
          <WorkflowLogs
            logs={logs}
            onClearLogs={handleClearLogs}
            isWorkflowRunning={isWorkflowRunning}
            onRefresh={() => syncState(false)}
          />
        );
      case "settings":
        return (
          <Settings
            googleSheetUrl={googleSheetUrl}
            onUrlChange={handleUrlChange}
            isFbConnected={isFbConnected}
            onDisconnectFb={handleDisconnectFb}
            onReset={handleDevReset}
            isWorkflowRunning={isWorkflowRunning}
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
          pageTitle={currentTab === "logs" ? "Workflow logs Audit" : currentTab}
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
