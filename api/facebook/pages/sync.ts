import type { VercelRequest, VercelResponse } from "@vercel/node";
import { state, addLog } from "../../state";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pages } = req.body || {};
  if (Array.isArray(pages)) {
    state.isFbConnected = true;
    
    state.fbPages = pages.map((p: any, idx: number) => {
      const id = p.id || p.pageId || `pg_real_${idx + 1}`;
      const name = p.name || p.pageName || `Facebook Channel ${idx + 1}`;
      const category = p.category || p.category_list?.[0]?.name || "Creator";
      const followers = typeof p.followers === "number" ? p.followers : (p.fan_count || Math.floor(Math.random() * 8000) + 1200);
      const pictureUrl = p.pictureUrl || p.picture?.data?.url || `https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=80&h=80&fit=crop`;
      const access_token = p.access_token || p.accessToken;

      return {
        id,
        name,
        category,
        followers,
        pictureUrl,
        connected: true,
        access_token,
        accessToken: access_token
      };
    });

    state.selectedPageIds = state.fbPages.map(page => page.id);

    addLog(
      "success",
      `Dynamic Fanpages Synchronized (${state.fbPages.length} Channels)`,
      `Linked: ${state.fbPages.map(p => p.name).join(", ")}. Stored active posting security credentials.`
    );
  }

  return res.status(200).json({
    success: true,
    isFbConnected: state.isFbConnected,
    pages: state.fbPages,
  });
}
