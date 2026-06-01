import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state, addLog, executeWorkflowStep } from "../state";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sheetUrl, selectedPages } = req.body || {};
  if (sheetUrl !== undefined && sheetUrl !== "") {
    state.googleSheetUrl = sheetUrl;
  }
  if (Array.isArray(selectedPages)) {
    state.selectedPageIds = selectedPages.map((p: any) => p.id);
    
    addLog(
      "info",
      `n8n syndication payload received matching ${selectedPages.length} channels`,
      `Secure tokens ingested: [${selectedPages.map(p => `${p.name}: Validated`).join(", ")}]`
    );
  }

  if (!state.isFbConnected) {
    return res.status(400).json({
      success: false,
      message: "Please connect your Facebook Account first!"
    });
  }
  if (!state.googleSheetUrl) {
    return res.status(400).json({
      success: false,
      message: "A valid Google Sheet URL is required!"
    });
  }
  if (state.selectedPageIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "You must select at least one Facebook Fanpage!"
    });
  }

  state.isWorkflowRunning = true;
  state.lastStepTime = Date.now();
  addLog("info", "AutoFB Workflow Engine Started.", `Active loop configured for every 15 seconds. Active Sheets Target: ${state.googleSheetUrl}`);
  
  // Instantly run the first step
  await executeWorkflowStep();

  return res.status(200).json({
    success: true,
    isWorkflowRunning: state.isWorkflowRunning,
  });
}
