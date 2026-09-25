import React from "react";
import type { AnalysisResult, ScreeningResult, User } from "@mindcare/types";

interface Props {
  result: AnalysisResult | null;
  screeningResult: ScreeningResult | null;
  patientName?: string;
  patientAge?: string;
  user: User | null;
}

export const ClinicalAssessmentPrintView = React.forwardRef<HTMLDivElement, Props>(
  ({ result, screeningResult, patientName, patientAge, user }, ref) => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const displaySession = screeningResult?.displayId || screeningResult?.sessionId || result?.displayId || result?.sessionId || "Unknown";

    return (
      <div
        ref={ref}
        className="bg-white text-black text-sm"
        style={{
          width: "210mm",
          padding: "20mm",
          boxSizing: "border-box",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold m-0 p-0 text-black">MindCare</h1>
            <p className="text-gray-600 mt-1 m-0">Clinical Assessment Report</p>
          </div>
          <div className="text-right text-gray-600">
            <p className="m-0">Generated: {dateStr}</p>
            <p className="m-0 mt-1">Session: {displaySession}</p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-200 pb-2">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-500 text-xs uppercase">Name</p>
              <p className="font-medium text-base">{patientName || "Not specified"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs uppercase">Age</p>
              <p className="font-medium text-base">{patientAge || "Not specified"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-xs uppercase">Patient ID</p>
              <p className="font-mono text-sm">{user?.patientId || user?.id.slice(-8) || "Unknown"}</p>
            </div>
          </div>
        </div>

        {/* Screening Results */}
        {screeningResult && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b border-black pb-1">Assessment Overview (PHQ-9/GAD-7/PCL-5)</h2>
            
            <div className="flex gap-8 mb-6">
              <div className="bg-gray-50 p-4 border border-gray-200 flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">ERM Score</p>
                <p className="text-3xl font-bold">
                  {screeningResult.screeningIndex.score} <span className="text-sm font-normal text-gray-600">/ 100</span>
                </p>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200 flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Interpretation</p>
                <p className="text-xl font-medium">{screeningResult.screeningIndex.interpretation}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Explanation of Condition</h3>
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">{screeningResult.summary}</p>
            </div>
          </div>
        )}

        {/* Clinical Results */}
        {!screeningResult && result && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b border-black pb-1">Analysis Overview</h2>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Medical Summary</h3>
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">{result.medicalSummary}</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {screeningResult && screeningResult.recommendations && screeningResult.recommendations.length > 0 && (
          <div className="mb-8" style={{ pageBreakInside: "avoid" }}>
            <h2 className="text-xl font-bold mb-4 border-b border-black pb-1">Clinical Recommendations</h2>
            <ul className="list-disc pl-6 space-y-3">
              {screeningResult.recommendations.map((rec, i) => (
                <li key={i} className="text-base leading-relaxed text-gray-800">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-4 border-2 border-gray-300 bg-gray-50 text-xs text-gray-600" style={{ pageBreakInside: "avoid" }}>
          <p className="font-bold mb-2 uppercase tracking-wide">Important Clinical Context & Disclaimer</p>
          <p className="leading-relaxed">
            {screeningResult?.disclaimer || 
            "This output is for research and clinician discussion only. It is not a diagnosis or a substitute for professional care. MindCare utilizes an Emotion Recognition Model (ERM) that analyzes multimodal markers (acoustic, visual, and linguistic) which may aid clinicians in forming an evaluation. It should not be used as the sole basis for clinical decision-making."}
          </p>
        </div>
      </div>
    );
  }
);

ClinicalAssessmentPrintView.displayName = "ClinicalAssessmentPrintView";
