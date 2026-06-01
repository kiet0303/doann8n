import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state, addLog } from "../state";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  state.isFbConnected = false;
  state.isWorkflowRunning = false;
  state.fbPages = state.fbPages.map((p) => ({ ...p, connected: false }));
  state.selectedPageIds = [];

  addLog("warning", "Facebook Graph OAuth Revoked.", "Disconnected from all page feeds.");

  return res.status(200).json({
    success: true,
    isFbConnected: state.isFbConnected,
    pages: state.fbPages,
  });
}
