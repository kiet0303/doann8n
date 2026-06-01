import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state, checkAndRunSimulation } from "../state.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Trigger dynamic workflow simulation for mock background activity
  await checkAndRunSimulation();

  return res.status(200).json({
    isFbConnected: state.isFbConnected,
    googleSheetUrl: state.googleSheetUrl,
    selectedPageIds: state.selectedPageIds,
    isWorkflowRunning: state.isWorkflowRunning,
    stats: {
      connectedPagesCount: state.fbPages.filter(p => p.connected).length,
      pendingPostsCount: state.pendingPostsCount,
      postedContentCount: state.postedContentCount,
    },
  });
}
