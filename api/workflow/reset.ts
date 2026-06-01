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
  state.isFbConnected = false;
  state.googleSheetUrl = "";
  state.selectedPageIds = [];
  state.postedContentCount = 0;
  state.pendingPostsCount = 0;
  state.currentSheetIndex = 0;
  state.fbPages = [];
  state.logs = [];

  return res.status(200).json({
    success: true,
    isFbConnected: state.isFbConnected,
    googleSheetUrl: state.googleSheetUrl,
    selectedPageIds: state.selectedPageIds,
    isWorkflowRunning: state.isWorkflowRunning,
    pages: state.fbPages,
    logs: state.logs,
    stats: {
      connectedPagesCount: 0,
      pendingPostsCount: 0,
      postedContentCount: 0,
    }
  });
}
