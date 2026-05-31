import axios from "axios";
import { FacebookPage, WorkflowLog, WorkflowStatus } from "../types";

// Base API instance with standard headers
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const workflowService = {
  // Get active workflow status and statistics
  getStatus: async (): Promise<WorkflowStatus> => {
    const response = await api.get<WorkflowStatus>("/workflow/status");
    return response.data;
  },

  // Connect mock Facebook Account
  connectFacebook: async (): Promise<{ success: boolean; isFbConnected: boolean; pages: FacebookPage[] }> => {
    const response = await api.post("/facebook/connect");
    return response.data;
  },

  // Disconnect mock Facebook Account
  disconnectFacebook: async (): Promise<{ success: boolean; isFbConnected: boolean; pages: FacebookPage[] }> => {
    const response = await api.post("/facebook/disconnect");
    return response.data;
  },

  // Retrieve current fanpages
  getPages: async (): Promise<{ pages: FacebookPage[] }> => {
    const response = await api.get<{ pages: FacebookPage[] }>("/facebook/pages");
    return response.data;
  },

  // Update configuration parameters
  updateConfig: async (googleSheetUrl: string, selectedPageIds: string[]): Promise<{ success: boolean; googleSheetUrl: string; selectedPageIds: string[] }> => {
    const response = await api.post("/workflow/config", {
      url: googleSheetUrl,
      pageIds: selectedPageIds,
    });
    return response.data;
  },

  // Start automation
  startWorkflow: async (): Promise<{ success: boolean; isWorkflowRunning: boolean }> => {
    const response = await api.post<{ success: boolean; isWorkflowRunning: boolean }>("/workflow/start");
    return response.data;
  },

  // Stop automation
  stopWorkflow: async (): Promise<{ success: boolean; isWorkflowRunning: boolean }> => {
    const response = await api.post<{ success: boolean; isWorkflowRunning: boolean }>("/workflow/stop");
    return response.data;
  },

  // Retrieve workflow history logs
  getLogs: async (): Promise<{ logs: WorkflowLog[] }> => {
    const response = await api.get<{ logs: WorkflowLog[] }>("/workflow/logs");
    return response.data;
  },

  // Reset audit logs
  clearLogs: async (): Promise<{ success: boolean; logs: WorkflowLog[] }> => {
    const response = await api.post<{ success: boolean; logs: WorkflowLog[] }>("/workflow/logs/clear");
    return response.data;
  },

  // Restore initial baseline setup
  resetConfig: async (): Promise<any> => {
    const response = await api.post("/workflow/reset");
    return response.data;
  },
};
