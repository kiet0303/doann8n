import React, { useMemo } from "react";
import { Check, Loader2, CircleDot } from "lucide-react";
import { WorkflowLog } from "../types";

interface WorkflowStepsProps {
  isWorkflowRunning: boolean;
  logs: WorkflowLog[];
}

export default function WorkflowSteps({ isWorkflowRunning, logs }: WorkflowStepsProps) {
  // Determine current active step based on logs
  const currentStepInfo = useMemo(() => {
    if (!isWorkflowRunning || logs.length === 0) {
      return { stepIndex: -1, label: "Idle" };
    }

    const latestLog = logs[0];
    const msg = (latestLog.message + " " + (latestLog.details || "")).toLowerCase();

    if (
      msg.includes("starting automation") || 
      msg.includes("extracting row") || 
      msg.includes("row extraction") || 
      msg.includes("reading") ||
      msg.includes("sheet row")
    ) {
      return { stepIndex: 0, label: "Reading Google Sheet" };
    }
    if (
      msg.includes("gemini") || 
      msg.includes("triggering gemini") || 
      msg.includes("ai caption") || 
      msg.includes("fallback caption") || 
      msg.includes("copywriter") ||
      msg.includes("generating caption")
    ) {
      return { stepIndex: 1, label: "Generating AI caption" };
    }
    if (
      msg.includes("moderation") || 
      msg.includes("scrutinizing") || 
      msg.includes("safety") ||
      msg.includes("toxic language") ||
      msg.includes("compliant")
    ) {
      return { stepIndex: 2, label: "Moderation checking" };
    }
    if (
      msg.includes("publishing to facebook") || 
      msg.includes("successfully published") || 
      msg.includes("graphapi") ||
      msg.includes("publish to facebook")
    ) {
      return { stepIndex: 3, label: "Posting to Facebook" };
    }
    if (
      msg.includes("updating google sheets") || 
      msg.includes("marked as 'published'") ||
      msg.includes("sheets status indicator")
    ) {
      return { stepIndex: 4, label: "Updating Google Sheet" };
    }

    // Default to a rolling sequence or progress
    return { stepIndex: 1, label: "Processing Pipeline" };
  }, [isWorkflowRunning, logs]);

  const steps = [
    { title: "Reading Google Sheet", desc: "n8n fetches pending rows" },
    { title: "Generating AI caption", desc: "Gemini drafts custom copywriting" },
    { title: "Moderation checking", desc: "OpenAI inspects content safety" },
    { title: "Posting to Facebook", desc: "Concurrently posts with Graph API" },
    { title: "Updating Google Sheet", desc: "Sets status col to PUBLISHED" },
  ];

  return (
    <div className="bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm text-slate-800 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">AI Workflow Status Monitor</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">Real-time dynamic visualization of the operational pipeline</p>
        </div>
        <div>
          {isWorkflowRunning ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-250 text-[#059669] text-[10px] font-bold uppercase tracking-wider font-sans leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
              <span>{currentStepInfo.label}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-[10px] font-bold uppercase tracking-wider font-sans leading-none">
              <span>Idle</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative mt-1">
        {steps.map((step, idx) => {
          const isCompleted = isWorkflowRunning && currentStepInfo.stepIndex > idx;
          const isActive = isWorkflowRunning && currentStepInfo.stepIndex === idx;
          const isPending = !isWorkflowRunning || currentStepInfo.stepIndex < idx;

          return (
            <div
              key={idx}
              className={`p-4 border rounded-xl flex flex-col justify-between transition-all duration-300 relative ${
                isActive
                  ? "border-[#2563EB] bg-[#EFF6FF] text-slate-950 shadow-sm ring-1 ring-blue-500/20"
                  : isCompleted
                  ? "border-emerald-250 bg-emerald-50/20 text-slate-800"
                  : "border-[#E2E8F0] bg-slate-50/45 text-slate-405"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono font-bold uppercase ${isActive ? "text-[#2563EB]" : "text-slate-400"}`}>
                  STEP 0{idx + 1}
                </span>
                
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/10">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/10">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-50 flex items-center justify-center text-slate-350 border border-slate-200 shrink-0">
                    <CircleDot className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h4 className={`text-xs font-bold leading-snug tracking-tight ${isActive ? "text-blue-900" : isCompleted ? "text-slate-850" : "text-slate-700"}`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-[#64748B] font-medium leading-snug mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
