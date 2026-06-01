import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state } from "../../state";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  state.logs = [
    {
      id: "log_init_clear",
      timestamp: new Date().toISOString(),
      type: "info",
      message: "Logs cleared by user.",
      details: "Audit history reset. Listening for future webhook triggers."
    }
  ];

  return res.status(200).json({
    success: true,
    logs: state.logs,
  });
}
