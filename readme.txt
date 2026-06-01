Cấu trúc và thông tin cấu hình chi tiết của dự án Automation Facebook SaaS Dashboard:

========================================================================
1. CẤU TRÚC THƯ MỤC & FILE TẠI THƯ MỤC GỐC (ROOT LEVEL) VÀ SRC/
========================================================================

Root folder /
│
├── .env.example (Cấu hình mẫu biến môi trường)
├── .gitignore (Chỉ định danh sách file/thư mục bỏ qua)
├── assets/ (Thư mục tài nguyên ảnh tĩnh)
├── index.html (File HTML chính cho trình duyệt)
├── metadata.json (Metadata của applet bao gồm quyền truy cập và mô tả)
├── package-lock.json (Lưu dấu phiên bản package đã cài đặt chính xác)
├── package.json (Định nghĩa scripts, dependencies phục vụ Build & Run)
├── server.ts (File server Node Express kết nối n8n webhook và lưu cache cục bộ)
├── tsconfig.json (Cấu hình Typescript Compiler)
├── vite.config.ts (Cấu hình Vite Packager)
│
└── src/ (Mã nguồn chính của ứng dụng Frontend)
    ├── App.tsx (Giao diện trung tâm chứa điều khiển Router, Core States và xử lý OAuth)
    ├── index.css (File CSS chứa import Tailwind CSS v4 mới nhất)
    ├── main.tsx (Điểm khởi đầu root gắn kết khung Frontend của Vite React)
    ├── types.ts (Chứa định nghĩa toàn bộ Interface & Types như FacebookPage, Logs, v.v...)
    │
    ├── components/ (Thành phần giao diện tái sử dụng)
    │   ├── DashboardCards.tsx (Thẻ thống kê thông số n8n)
    │   ├── LogsPanel.tsx (Bảng nhật ký kiểm toán nhanh)
    │   ├── PageSelector.tsx (Hộp chọn fanpage nhanh)
    │   ├── Sidebar.tsx (Thành phần điều hướng thanh bên trái)
    │   ├── StatusBadge.tsx (Huy hiệu trạng thái trực quan)
    │   ├── Topbar.tsx (Thanh công cụ trên cùng chứa thông số trạng thái)
    │   ├── WorkflowForm.tsx (Form cấu hình Sheet URL và kết nối Facebook)
    │   ├── WorkflowSteps.tsx (Quy trình hiển thị sườn hoạt động tự động hóa)
    │
    ├── pages/ (Các màn hình chức năng chính)
    │   ├── Dashboard.tsx (Màn hình bảng điều khiển chính, điều hướng & khởi chạy bot)
    │   ├── Fanpages.tsx (Danh sách quản lý, cấp quyền và chọn Fanpages thông minh)
    │   ├── Settings.tsx (Cài đặt hệ thống, cài đặt Sheet Google và khôi phục cài đặt gốc)
    │   ├── WorkflowLogs.tsx (Màn hình chi tiết kiểm định logs lịch sử chạy công việc)
    │
    └── services/ (Tích hợp giao thức Backend và dịch vụ bên thứ ba)
        └── api.ts (Quản trị liên lạc API cục bộ và n8n Webhook Endpoint)


========================================================================
2. CHI TIẾT NỘI DUNG FILE: package.json
========================================================================

{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "clean": "rm -rf dist server.js server.cjs",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "axios": "^1.16.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}


========================================================================
3. CHI TIẾT NỘI DUNG FILE: vite.config.ts
========================================================================

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


========================================================================
4. CHI TIẾT NỘI DUNG FILE: src/services/api.ts
========================================================================

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

  // Submit actual Facebook authorization code to n8n webhook
  submitFacebookCode: async (code: string): Promise<{ success: boolean; pages: FacebookPage[] }> => {
    const response = await axios.post("https://doankiet.app.n8n.cloud/webhook/facebook-pages", { code });
    return response.data;
  },

  // Sync actual authorized fanpages to local node express cache
  saveConnectedPages: async (pages: FacebookPage[]): Promise<{ success: boolean; pages: FacebookPage[] }> => {
    const response = await api.post("/facebook/pages/sync", { pages });
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
  startWorkflow: async (payload?: { sheetUrl: string; selectedPages: { id: string; name: string; access_token?: string }[] }): Promise<{ success: boolean; isWorkflowRunning: boolean }> => {
    const response = await api.post<{ success: boolean; isWorkflowRunning: boolean }>("/workflow/start", payload);
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
