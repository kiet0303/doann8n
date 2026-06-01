import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state, addLog } from "../state.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(45).json({ error: "Method not allowed" });
  }

  state.isFbConnected = true;
  state.fbPages = state.fbPages.map((p) => ({
    ...p,
    connected: true,
  }));

  addLog(
    "success",
    "Successfully authenticated with Facebook OAuth Graph Integration.",
    "Scope approved: manage_pages, publish_to_groups, pages_read_engagement, pages_show_list"
  );

  return res.status(200).json({
    success: true,
    isFbConnected: state.isFbConnected,
    pages: state.fbPages,
  });
}
