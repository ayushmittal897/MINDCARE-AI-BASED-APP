import { ClinicalReport } from "@/components/reports/ClinicalReport";
import { PatientReport } from "@/components/reports/PatientReport";
import { ModalityWeights } from "@/components/reports/ModalityWeights";
import { SHAPVisualizer } from "@/components/reports/SHAPVisualizer";
import { ScreeningDashboard } from "@/components/screening/ScreeningDashboard";
import { useAnalysisStore } from "@/store/analysisStore";
import { useSearchParams } from "react-router-dom";

export function ReportsPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // "session" or "clinical"

  const result = useAnalysisStore((s) => s.current);
  const screeningResult = useAnalysisStore((s) => s.screeningResult);
  const printMode = useAnalysisStore((s) => s.printMode);

  const showSession = type !== "clinical"; // Default to session if not explicitly clinical
  const showClinical = type === "clinical";

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <h1 className="font-display text-3xl font-bold tracking-tight">Clinical reports</h1>
        <p className="mt-2 text-muted-foreground">ERM outputs: modality weights, SHAP rankings, and printable summaries.</p>
      </div>

      {showClinical && screeningResult && (
        <div className={`border-b pb-8 mb-8 print:border-b-0 print:mb-4 print:pb-4 ${printMode === "clinical" ? "print:hidden" : ""}`}>
          <h2 className="text-2xl font-bold mb-6 print:hidden">Screening Analysis Report</h2>
          <ScreeningDashboard result={screeningResult} />
        </div>
      )}

      {showSession && result && (
        <>
          <h2 className="text-2xl font-bold mb-6 print:hidden">Session Analysis Report</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={`space-y-6 flex flex-col h-full ${printMode === "clinical" ? "print:hidden" : ""}`}>
              <PatientReport result={result} />
            </div>
            <div className={`space-y-6 flex flex-col ${printMode === "patient" ? "print:hidden" : ""}`}>
              <ClinicalReport result={result} />
              <div className="print:hidden flex flex-col gap-6">
                <ModalityWeights weights={result.weights ?? null} />
                <SHAPVisualizer rankings={result.shapRankings ?? []} />
              </div>
            </div>
          </div>
        </>
      )}

      {!result && !screeningResult && (
        <div className="text-center py-12 text-muted-foreground">
          No reports available. Please complete a session or a multimodal screening first.
        </div>
      )}
    </div>
  );
}
