import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily if environment variable exists
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini Client successfully initialized on backend server.");
    } catch (err) {
      console.error("Failed to initialize Gemini Client:", err);
    }
  }
  return aiClient;
}

// In-Memory Database / State Store
interface FacebookPage {
  id: string;
  name: string;
  category: string;
  followers: number;
  pictureUrl: string;
  connected: boolean;
}

interface WorkflowLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  details?: string;
  pageId?: string;
}

// Initial Mock Facebook Pages
let fbPages: FacebookPage[] = [
  { id: "pg_1", name: "TechCraft Insights", category: "Technology", followers: 14500, pictureUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop", connected: false },
  { id: "pg_2", name: "Organic Growth Blueprint", category: "Marketing", followers: 8200, pictureUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=80&fit=crop", connected: false },
  { id: "pg_3", name: "AI Automation Hub", category: "Scientific Community", followers: 23100, pictureUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=80&h=80&fit=crop", connected: false },
  { id: "pg_4", name: "SaaS Builders Club", category: "Entrepreneurship", followers: 11000, pictureUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&h=80&fit=crop", connected: false },
  { id: "pg_5", name: "Creative Content Lab", category: "Digital agency", followers: 6400, pictureUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=80&h=80&fit=crop", connected: false },
  { id: "pg_6", name: "Social Media Strategy Hacks", category: "Consulting", followers: 9800, pictureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=80&h=80&fit=crop", connected: false }
];

// Seed Logs representing historical postings
let logs: WorkflowLog[] = [
  {
    id: "log_init_1",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: "info",
    message: "AutoFB Workflow Daemon initialized.",
    details: "Listening for automated webhook notifications and scheduled cron task updates."
  },
  {
    id: "log_init_2",
    timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    type: "success",
    message: "Connection to Facebook Fanpage Graph Gateway verified.",
    details: "OAuth session token valid for 59 days."
  },
  {
    id: "log_init_3",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    type: "success",
    message: "Archived Campaign Posted: 'Welcome to the Future of Low-Code Automation'",
    details: "Posted to TechCraft Insights & AI Automation Hub. Reach: 2,400+ organic impressions.",
    pageId: "pg_1"
  }
];

// Workflow Configuration
let isFbConnected = false;
let googleSheetUrl = "https://docs.google.com/spreadsheets/d/1X45fG9H-automation-template/edit";
let selectedPageIds: string[] = ["pg_1", "pg_3"];
let isWorkflowRunning = false;
let postedContentCount = 24;
let pendingPostsCount = 5;

// Topics to read from the simulated Google Sheet
const googleSheetRows = [
  "10 Mind-blowing tech hacks that save over 5 hours of work every week.",
  "How low-code SaaS automation platforms are reshaping modern entrepreneurship.",
  "Why micro-copy with clean typography and high contrast holds user attention 40% longer.",
  "Common pitfalls to avoid when syndicating automated posts to Facebook Pages.",
  "AI Content Moderation: Balancing speed, voice authenticity, and guideline safety.",
  "Building a feedback loop: How dashboard metrics directly drive content direction."
];

let backgroundInterval: NodeJS.Timeout | null = null;
let currentSheetIndex = 0;

// Helper to push logs and keep size within limits
function addLog(type: "info" | "success" | "warning" | "error", message: string, details?: string, pageId?: string) {
  const newLog: WorkflowLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    details,
    pageId
  };
  logs.unshift(newLog); // push on top
  if (logs.length > 200) {
    logs = logs.slice(0, 200);
  }
}

// Simulated background automation runner step
async function executeWorkflowStep() {
  if (!isWorkflowRunning) return;

  const rowTopic = googleSheetRows[currentSheetIndex % googleSheetRows.length];
  const activePages = fbPages.filter(p => p.connected && selectedPageIds.includes(p.id));

  if (activePages.length === 0) {
    addLog(
      "error",
      "Workflow run canceled: No connected Facebook Fanpages selected.",
      "Please select at least one connected Facebook page to post the captions to."
    );
    stopWorkflowInterval();
    return;
  }

  addLog(
    "info",
    `[n8n Webhook] Starting automation step for Sheet Row #${currentSheetIndex + 1}`,
    `Extracting row data... Row Title: "${rowTopic}"`
  );

  // 1. Generate AI Caption
  let generatedCaption = "";
  let usingFallback = false;
  const ai = getGeminiClient();

  if (ai) {
    try {
      addLog("info", "Triggering Gemini AI (gemini-3.5-flash) to generate caption text...", `Prompt: "Write an engaging, professional Facebook post caption about: ${rowTopic}"`);
      
      const promptText = `Please draft an engaging social media post caption focusing on this topic:\n"${rowTopic}"\n\nGuidelines:\n- Use a professional, warm SaaS-style voice.\n- Use custom emojis and line brackets to increase readable spacing.\n- Add 3-5 trending hashtags at the end.\n- Return ONLY the clean caption text. Do not wrap in markdown quotes, or include conversational prefix like "Here is your caption:".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "You are an elite copywriter and social media growth automation director. Write captivating captions that command attention.",
        }
      });

      generatedCaption = response.text || "";
      if (!generatedCaption) throw new Error("Empty text returned from Gemini");
      
      addLog("success", "AI Caption generated successfully with Gemini!", generatedCaption);
    } catch (err: any) {
      console.error("Gemini Generation Error:", err);
      usingFallback = true;
    }
  } else {
    usingFallback = true;
  }

  if (usingFallback) {
    // Elegant fallback simulation if no AI key configured
    addLog("info", "No Gemini API Key found or API call stalled. Standard fallback caption template selected.");
    generatedCaption = `🚀 Optimization Spotlight: ${rowTopic}\n\nAutomating your workflow ensures peak productivity, less human error, and flawless publishing.\n\nRead more via our master template:\n👉 ${googleSheetUrl}\n\n#WorkflowAutomation #SaaS #GrowthMindset #Productivity`;
    addLog("success", "SaaS caption generated successfully (System Standard).", generatedCaption);
  }

  // 2. OpenAI Moderation Check Simulation
  addLog("info", "Submitting generated caption to OpenAI Content Moderation API...", "Scrutinizing for toxic language, community standards infractions, or restricted keywords.");

  // Simulate a slight mock delay or check moderation
  const isSafe = true; // Simulating successful moderation validation
  if (isSafe) {
    addLog(
      "success",
      "OpenAI Moderation Check: Passed (Score: 0.0003 - Compliant).",
      "Content is highly compliant with Facebook Community Standards guidelines."
    );
  } else {
    addLog(
      "warning",
      "Moderation Warning flagged.",
      "Slight spam trigger words detected, but automatically polished and cleared for publication."
    );
  }

  // 3. Post to Selected Fanpages
  for (const page of activePages) {
    addLog(
      "info",
      `Publishing to Facebook Fanpage API: ${page.name}...`,
      `Endpoint: GraphAPI v19.0 /${page.id}/feed`
    );

    // Simulate Graph API latency
    const mockPostId = `fb_post_${Math.floor(Math.random() * 10000000000000)}`;
    addLog(
      "success",
      `Successfully published to Facebook page "${page.name}"!`,
      `Post ID: ${mockPostId}\nCaption Snippet: ${generatedCaption.slice(0, 80)}...`,
      page.id
    );
    
    // Increment total stats
    postedContentCount++;
  }

  // Update sheet status column simulation
  addLog(
    "success",
    `Updating Google Sheets status indicator...`,
    `Row #${currentSheetIndex + 1} marked as 'PUBLISHED' with live Link: https://facebook.com/posts`
  );

  // Transition to next row
  currentSheetIndex++;
  if (pendingPostsCount > 0) {
    pendingPostsCount--;
  } else {
    pendingPostsCount = 5; // Refill automatically to maintain engaging dashboard stats
  }
}

// Safe Start function
function startWorkflowInterval() {
  if (isWorkflowRunning) return;
  isWorkflowRunning = true;
  addLog("info", "AutoFB Workflow Engine Started.", `Active loop configured for every 15 seconds. Active Sheets Target: ${googleSheetUrl}`);
  
  // Set first execution immediately in the background
  executeWorkflowStep();
  
  // Schedule subsequent steps every 15 seconds
  backgroundInterval = setInterval(() => {
    executeWorkflowStep();
  }, 15000);
}

// Stop function
function stopWorkflowInterval() {
  if (!isWorkflowRunning) return;
  isWorkflowRunning = false;
  if (backgroundInterval) {
    clearInterval(backgroundInterval);
    backgroundInterval = null;
  }
  addLog("warning", "AutoFB Workflow Engine Suspended by User Request.", "Pending cues stored. The workflow runner is now IDLE.");
}

// --- API ENDPOINTS ---

// Check Status
app.get("/api/workflow/status", (req, res) => {
  res.json({
    isFbConnected,
    googleSheetUrl,
    selectedPageIds,
    isWorkflowRunning,
    stats: {
      connectedPagesCount: fbPages.filter(p => p.connected).length,
      pendingPostsCount,
      postedContentCount,
    }
  });
});

// Connect Facebook mock account
app.post("/api/facebook/connect", (req, res) => {
  isFbConnected = true;
  // Make some mock pages connected as standard default so the list is checked
  fbPages = fbPages.map((p, idx) => ({
    ...p,
    connected: true, // Mark all pages as now available
  }));

  // Log connectivity
  addLog(
    "success",
    "Successfully authenticated with Facebook OAuth Graph Integration.",
    "Scope approved: manage_pages, publish_to_groups, pages_read_engagement, pages_show_list"
  );

  res.json({
    success: true,
    isFbConnected,
    pages: fbPages
  });
});

// Disconnect Facebook
app.post("/api/facebook/disconnect", (req, res) => {
  isFbConnected = false;
  isWorkflowRunning = false;
  if (backgroundInterval) {
    clearInterval(backgroundInterval);
    backgroundInterval = null;
  }
  fbPages = fbPages.map(p => ({ ...p, connected: false }));
  selectedPageIds = [];
  addLog("warning", "Facebook Graph OAuth Revoked.", "Disconnected from all page feeds.");
  res.json({
    success: true,
    isFbConnected,
    pages: fbPages
  });
});

// Update workflow configuration
app.post("/api/workflow/config", (req, res) => {
  const { url, pageIds } = req.body;
  if (url !== undefined) googleSheetUrl = url;
  if (pageIds !== undefined) selectedPageIds = pageIds;

  addLog(
    "info",
    "Workflow Configuration Settings Updated.",
    `Google Sheets target modified: ${googleSheetUrl}\nSelected Facebook Fanpages targeted: ${selectedPageIds.length} pages`
  );

  res.json({
    success: true,
    googleSheetUrl,
    selectedPageIds
  });
});

// Start Workflow
app.post("/api/workflow/start", (req, res) => {
  if (!isFbConnected) {
    return res.status(400).json({
      success: false,
      message: "Please connect your Facebook Account first!"
    });
  }
  if (!googleSheetUrl) {
    return res.status(400).json({
      success: false,
      message: "A valid Google Sheet URL is required!"
    });
  }
  if (selectedPageIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "You must select at least one Facebook Fanpage!"
    });
  }

  startWorkflowInterval();
  res.json({
    success: true,
    isWorkflowRunning
  });
});

// Stop Workflow
app.post("/api/workflow/stop", (req, res) => {
  stopWorkflowInterval();
  res.json({
    success: true,
    isWorkflowRunning
  });
});

// Fetch Pages
app.get("/api/facebook/pages", (req, res) => {
  res.json({
    pages: fbPages
  });
});

// Fetch logs
app.get("/api/workflow/logs", (req, res) => {
  res.json({
    logs
  });
});

// Clear Logs
app.post("/api/workflow/logs/clear", (req, res) => {
  logs = [
    {
      id: "log_init_clear",
      timestamp: new Date().toISOString(),
      type: "info",
      message: "Logs cleared by user.",
      details: "Audit history reset. Listening for future webhook triggers."
    }
  ];
  res.json({
    success: true,
    logs
  });
});

// Reset configuration to stock settings
app.post("/api/workflow/reset", (req, res) => {
  isWorkflowRunning = false;
  if (backgroundInterval) {
    clearInterval(backgroundInterval);
    backgroundInterval = null;
  }
  isFbConnected = true;
  googleSheetUrl = "https://docs.google.com/spreadsheets/d/1X45fG9H-automation-template/edit";
  selectedPageIds = ["pg_1", "pg_3"];
  postedContentCount = 24;
  pendingPostsCount = 5;
  currentSheetIndex = 0;
  fbPages = fbPages.map(p => ({ ...p, connected: true }));
  logs = [
    {
      id: "log_reset",
      timestamp: new Date().toISOString(),
      type: "info",
      message: "Dashboard and parameters reset to default state.",
      details: "Database hydrated with fresh mock pages and configuration presets."
    }
  ];
  addLog("success", "Mock Database re-hydrated beautifully.");
  res.json({
    success: true,
    isFbConnected,
    googleSheetUrl,
    selectedPageIds,
    isWorkflowRunning,
    pages: fbPages,
    logs,
    stats: {
      connectedPagesCount: 2,
      pendingPostsCount: 5,
      postedContentCount: 24,
    }
  });
});



// Handle Vite Dev Server or Production Build serving static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite Dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled vite bundle from /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoFB Express Backend Server actively listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
