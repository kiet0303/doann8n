import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini Client is initialized lazily
let aiClient: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI | null {
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
      console.log("Vercel Serverless Gemini Client successfully initialized.");
    } catch (err) {
      console.error("Failed to initialize Vercel Gemini Client:", err);
    }
  }
  return aiClient;
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  followers: number;
  pictureUrl: string;
  connected: boolean;
  access_token?: string;
  accessToken?: string;
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  details?: string;
  pageId?: string;
}

// Global mutable state object to maintain ES Module live bindings
export const state = {
  isFbConnected: false,
  googleSheetUrl: "",
  selectedPageIds: [] as string[],
  isWorkflowRunning: false,
  postedContentCount: 0,
  pendingPostsCount: 0,
  currentSheetIndex: 0,
  lastStepTime: 0,
  
  fbPages: [] as FacebookPage[],

  logs: [] as WorkflowLog[]
};

export const googleSheetRows = [
  "10 Mind-blowing tech hacks that save over 5 hours of work every week.",
  "How low-code SaaS automation platforms are reshaping modern entrepreneurship.",
  "Why micro-copy with clean typography and high contrast holds user attention 40% longer.",
  "Common pitfalls to avoid when syndicating automated posts to Facebook Pages.",
  "AI Content Moderation: Balancing speed, voice authenticity, and guideline safety.",
  "Building a feedback loop: How dashboard metrics directly drive content direction."
];

// Helper to push logs and keep size within limits
export function addLog(type: "info" | "success" | "warning" | "error", message: string, details?: string, pageId?: string) {
  const newLog: WorkflowLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    details,
    pageId
  };
  state.logs.unshift(newLog);
  if (state.logs.length > 200) {
    state.logs = state.logs.slice(0, 200);
  }
}

// Simulated background automation runner step
export async function executeWorkflowStep() {
  if (!state.isWorkflowRunning) return;

  const rowTopic = googleSheetRows[state.currentSheetIndex % googleSheetRows.length];
  const activePages = state.fbPages.filter(p => p.connected && state.selectedPageIds.includes(p.id));

  if (activePages.length === 0) {
    addLog(
      "error",
      "Workflow run canceled: No connected Facebook Fanpages selected.",
      "Please select at least one connected Facebook page to post the captions to."
    );
    state.isWorkflowRunning = false;
    return;
  }

  addLog(
    "info",
    `[n8n Webhook] Starting automation step for Sheet Row #${state.currentSheetIndex + 1}`,
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
    addLog("info", "No Gemini API Key found or API call stalled. Standard fallback caption template selected.");
    generatedCaption = `🚀 Optimization Spotlight: ${rowTopic}\n\nAutomating your workflow ensures peak productivity, less human error, and flawless publishing.\n\nRead more via our master template:\n👉 ${state.googleSheetUrl}\n\n#WorkflowAutomation #SaaS #GrowthMindset #Productivity`;
    addLog("success", "SaaS caption generated successfully (System Standard).", generatedCaption);
  }

  // 2. OpenAI Moderation Check Simulation
  addLog("info", "Submitting generated caption to OpenAI Content Moderation API...", "Scrutinizing for toxic language, community standards infractions, or restricted keywords.");

  const isSafe = true;
  if (isSafe) {
    addLog(
      "success",
      "OpenAI Moderation Check: Passed (Score: 0.0003 - Compliant).",
      "Content is highly compliant with Facebook Community Standards guidelines."
    );
  }

  // 3. Post to Selected Fanpages
  for (const page of activePages) {
    addLog(
      "info",
      `Publishing to Facebook Fanpage API: ${page.name}...`,
      `Endpoint: GraphAPI v19.0 /${page.id}/feed`
    );

    const mockPostId = `fb_post_${Math.floor(Math.random() * 10000000000000)}`;
    addLog(
      "success",
      `Successfully published to Facebook page "${page.name}"!`,
      `Post ID: ${mockPostId}\nCaption Snippet: ${generatedCaption.slice(0, 80)}...`,
      page.id
    );
    
    state.postedContentCount++;
  }

  addLog(
    "success",
    `Updating Google Sheets status indicator...`,
    `Row #${state.currentSheetIndex + 1} marked as 'PUBLISHED' with live Link: https://facebook.com/posts`
  );

  state.currentSheetIndex++;
  if (state.pendingPostsCount > 0) {
    state.pendingPostsCount--;
  } else {
    state.pendingPostsCount = 5;
  }
}

// Check schedule and execute step dynamically for realistic client polls
export async function checkAndRunSimulation() {
  if (!state.isWorkflowRunning) return;
  const now = Date.now();
  if (state.lastStepTime === 0) {
    state.lastStepTime = now;
    // Execute first step
    await executeWorkflowStep();
  } else if (now - state.lastStepTime >= 15000) {
    state.lastStepTime = now;
    await executeWorkflowStep();
  }
}
