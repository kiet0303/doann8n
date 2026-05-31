import React from "react";
import { Play, Pause, AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";

interface StatusBadgeProps {
  status: "running" | "idle" | "disconnected" | "info" | "success" | "warning" | "error";
  compact?: boolean;
}

export default function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  let text = "";
  let badgeClass = "";
  let Icon: React.ComponentType<any> = Info;

  switch (status) {
    case "running":
      text = "Active Workflow";
      badgeClass = "bg-green-50 text-green-700 border-green-200 animate-pulse";
      Icon = Play;
      break;
    case "idle":
      text = "Workflow Paused";
      badgeClass = "bg-slate-50 text-slate-700 border-slate-200";
      Icon = Pause;
      break;
    case "disconnected":
      text = "FB Disconnected";
      badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
      Icon = AlertTriangle;
      break;
    case "info":
      text = "INFO";
      badgeClass = "bg-blue-50 text-blue-600 border-blue-200";
      Icon = Info;
      break;
    case "success":
      text = "SUCCESS";
      badgeClass = "bg-green-50 text-green-700 border-green-200";
      Icon = CheckCircle;
      break;
    case "warning":
      text = "WARN";
      badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
      Icon = AlertTriangle;
      break;
    case "error":
      text = "ERROR";
      badgeClass = "bg-red-50 text-red-700 border-red-200";
      Icon = AlertCircle;
      break;
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold uppercase border ${badgeClass}`}>
        <Icon className="w-3.5 h-3.5" />
        {text}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
      <span className={`w-2 h-2 rounded-full ${status === "running" ? "bg-green-500 animate-ping" : status === "idle" ? "bg-slate-400" : status === "disconnected" ? "bg-rose-400" : "bg-current"}`} />
      <Icon className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}
