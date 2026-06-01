import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state, addLog } from "../state.js";

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
  addLog("warning", "AutoFB Workflow Engine Suspended by User Request.", "Pending cues stored. The workflow runner is now IDLE.");

  return res.status(200).json({
    success: true,
    isWorkflowRunning: state.isWorkflowRunning,
  });
}
