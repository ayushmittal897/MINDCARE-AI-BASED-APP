import React from "react";
import type { AnalysisResult, ScreeningResult, User } from "@mindcare/types";
import { CheckCircle2 } from "lucide-react";
import { useAnalysisStore } from "@/store/analysisStore";

interface Props {
  result: AnalysisResult | null;
  screeningResult: ScreeningResult | null;
  patientName?: string;
  patientAge?: string;
  user: User | null;
}

export const WellnessReportPrintView = React.forwardRef<HTMLDivElement, Props>(
  ({ result, screeningResult, patientName, patientAge, user }, ref) => {
    
    // For historical sessions, result.inputs has the data. For current sessions, it's in the store.
    const runData = result?.inputs || useAnalysisStore.getState().lastRun;
    
    const displaySession = screeningResult?.displayId || screeningResult?.sessionId || result?.displayId || result?.sessionId || "Unknown";

    return (
      <div
        ref={ref}
        className="bg-[#f2f7f4] text-foreground text-sm"
        style={{
          width: "210mm",
          padding: "15mm",
          boxSizing: "border-box",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div className="border border-[#3d8361]/20 rounded-xl p-8 bg-white/50 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-row items-center justify-between pb-6 border-b border-border/50 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#3d8361]">Your Personal Wellness Report</h1>
              <div className="mt-2 space-y-1">
                {(patientName || patientAge) && (
                  <p className="text-sm text-gray-500">
                    {patientName && <span className="font-medium text-gray-700">{patientName}</span>}
                    {patientName && patientAge && " • "}
                    {patientAge && <span>Age: {patientAge}</span>}
                  </p>
                )}
                {user && (
                  <div className="text-xs text-gray-500 font-mono tracking-wider flex flex-col gap-1">
                    <p>ID: {user.patientId || user.id.slice(-8)}</p>
                    <p>Session: {displaySession}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right text-gray-400 text-xs font-medium uppercase tracking-widest">
              MindCare
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-medium mb-3 text-lg text-gray-900">Summary</h3>
              <p className="text-base leading-relaxed text-gray-600">
                {result?.userSummary || screeningResult?.summary || "No summary available."}
              </p>
            </div>
            
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-medium mb-4 text-base text-gray-900">How this report was created</h3>
              <p className="text-sm text-gray-500 mb-6">
                MindCare analyzes multiple aspects of your emotional expression to provide a holistic wellness screening. 
                Your results are based on the inputs provided during your session:
              </p>
              
              <ul className="space-y-6 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 mt-0.5 ${runData?.transcriptChars ? "text-[#3d8361]" : "text-gray-300"}`} />
                  <div>
                    <span className={runData?.transcriptChars ? "font-medium text-gray-900 block mb-1" : "block"}>
                      Text Transcript {runData?.transcriptChars ? `(${runData.transcriptChars} characters)` : "(Not provided)"}
                    </span>
                    {runData?.transcriptText && (
                      <p className="italic text-gray-500 border-l-2 border-gray-200 pl-3 py-1">
                        "{runData.transcriptText}"
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 mt-0.5 ${runData?.hasAudio ? "text-[#3d8361]" : "text-gray-300"}`} />
                  <span className={runData?.hasAudio ? "font-medium text-gray-900" : ""}>
                    Audio Clip {runData?.hasAudio && runData.audioKb ? `(${Math.round(runData.audioKb)} KB)` : "(Not provided)"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-5 w-5 mt-0.5 ${runData?.hasVideoFrame ? "text-[#3d8361]" : "text-gray-300"}`} />
                  <div className="w-full">
                    <span className={runData?.hasVideoFrame ? "font-medium text-gray-900 block mb-3" : "block"}>
                      Facial Expressions / Video Frame {runData?.hasVideoFrame ? "(Analyzed)" : "(Not provided)"}
                    </span>
                    {runData?.videoFrameBase64 && (
                      <div className="max-w-[250px] rounded-lg overflow-hidden border shadow-sm">
                        <img 
                          src={`data:image/jpeg;base64,${runData.videoFrameBase64}`} 
                          alt="Captured face" 
                          className="w-full h-auto object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WellnessReportPrintView.displayName = "WellnessReportPrintView";
