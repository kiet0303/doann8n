import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state, addLog, FacebookPage } from "../state.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  state.isWorkflowRunning = false;
  state.lastStepTime = 0;
  state.isFbConnected = true;
  state.googleSheetUrl = "https://docs.google.com/spreadsheets/d/1X45fG9H-automation-template/edit";
  state.selectedPageIds = ["pg_1", "pg_3"];
  state.postedContentCount = 24;
  state.pendingPostsCount = 5;
  state.currentSheetIndex = 0;
  state.fbPages = state.fbPages.map((p) => ({ ...p, connected: true }));
  
  state.logs = [
    {
      id: "log_reset",
      timestamp: new Date().toISOString(),
      type: "info",
      message: "Dashboard and parameters reset to default state.",
      details: "Database hydrated with fresh mock pages and configuration presets."
    }
  ];

  addLog("success", "Mock Database re-hydrated beautifully.");

  return res.status(200).json({
    success: true,
    isFbConnected: state.isFbConnected,
    googleSheetUrl: state.googleSheetUrl,
    selectedPageIds: state.selectedPageIds,
    isWorkflowRunning: state.isWorkflowRunning,
    pages: state.fbPages,
    logs: state.logs,
    stats: {
      connectedPagesCount: 2,
      pendingPostsCount: 5,
      postedContentCount: 24,
    }
  });
}
