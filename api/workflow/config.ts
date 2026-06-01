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

  const { url, pageIds } = req.body || {};
  if (url !== undefined) state.googleSheetUrl = url;
  if (pageIds !== undefined) state.selectedPageIds = pageIds;

  addLog(
    "info",
    "Workflow Configuration Settings Updated.",
    `Google Sheets target modified: ${state.googleSheetUrl}\nSelected Facebook Fanpages targeted: ${state.selectedPageIds.length} pages`
  );

  return res.status(200).json({
    success: true,
    googleSheetUrl: state.googleSheetUrl,
    selectedPageIds: state.selectedPageIds,
  });
}
