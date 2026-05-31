export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  followers: number;
  pictureUrl: string;
  connected: boolean;
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  pageId?: string;
}

export interface WorkflowStats {
  connectedPagesCount: number;
  pendingPostsCount: number;
  postedContentCount: number;
}

export interface WorkflowStatus {
  isFbConnected: boolean;
  googleSheetUrl: string;
  selectedPageIds: string[];
  isWorkflowRunning: boolean;
  stats: WorkflowStats;
}
