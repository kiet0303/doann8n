import React from "react";
import { Users, FileText, CheckCircle, Activity, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { WorkflowStats } from "../types";

interface DashboardCardsProps {
  stats: WorkflowStats;
  isWorkflowRunning: boolean;
  isFbConnected: boolean;
  onTabChange: (tab: string) => void;
}

export default function DashboardCards({ stats, isWorkflowRunning, isFbConnected, onTabChange }: DashboardCardsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {/* Card 1: Connected Pages */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        onClick={() => onTabChange("fanpages")}
        className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm cursor-pointer hover:border-blue-400/75 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 -z-10 opacity-40 group-hover:scale-110 transition-transform duration-300" />
        <div className="flex items-center justify-between">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Users className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
        <div className="mt-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Connected Pages
          </span>
          <h3 className="text-2xl font-black mt-1 text-slate-900 tracking-tight">
            {isFbConnected ? stats.connectedPagesCount : "0"} Pages
          </h3>
          <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active target delivery streams</span>
          </p>
        </div>
      </motion.div>

      {/* Card 2: Pending Posts */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        onClick={() => onTabChange("dashboard")}
        className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm cursor-pointer hover:border-violet-400/75 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -mr-8 -mt-8 -z-10 opacity-40 group-hover:scale-110 transition-transform duration-300" />
        <div className="flex items-center justify-between">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
            <FileText className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-violet-505 transition-colors" />
        </div>
        <div className="mt-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Pending Queue
          </span>
          <h3 className="text-2xl font-black mt-1 text-slate-900 tracking-tight">
            {stats.pendingPostsCount} Scheduled
          </h3>
          <p className="text-[10px] text-violet-600 font-bold mt-1.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>AI pipeline synchronized</span>
          </p>
        </div>
      </motion.div>

      {/* Card 3: Posted Today */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        onClick={() => onTabChange("logs")}
        className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm cursor-pointer hover:border-emerald-400/75 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 -z-10 opacity-40 group-hover:scale-110 transition-transform duration-300" />
        <div className="flex items-center justify-between">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <CheckCircle className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-505 transition-colors" />
        </div>
        <div className="mt-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Posted Today
          </span>
          <h3 className="text-2xl font-black mt-1 text-slate-900 tracking-tight">
            {stats.postedContentCount} Sent
          </h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Next polling sequence ready</span>
          </p>
        </div>
      </motion.div>

      {/* Card 4: AI Workflow Status */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -3, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        onClick={() => onTabChange("settings")}
        className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm cursor-pointer hover:border-[#10B981] transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 -z-10 opacity-40 group-hover:scale-110 transition-transform duration-300" />
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl transition-all duration-300 ${
            isWorkflowRunning 
              ? "bg-emerald-100/80 text-emerald-600 border border-emerald-250 animate-pulse" 
              : "bg-slate-100 text-slate-600"
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider leading-none ${
            isWorkflowRunning ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
          }`}>
            {isWorkflowRunning ? "LIVE" : "READY"}
          </span>
        </div>
        <div className="mt-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            AI Workflow Status
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              isWorkflowRunning ? "bg-emerald-500 animate-ping" : "bg-slate-400"
            }`} />
            <span className={`font-bold text-sm tracking-tight ${
              isWorkflowRunning ? "text-emerald-600" : "text-slate-500"
            }`}>
              {isWorkflowRunning ? "Engine Active (Polling)" : "Standby (Awaiting Queue)"}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1.5 font-mono">
            Daemon v2.10 (Cloud Run Node)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Simple clock icon replacement fallback
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
