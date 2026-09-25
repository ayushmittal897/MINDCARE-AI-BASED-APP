import type { AnalysisResult } from "@mindcare/types";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

import { useAnalysisStore } from "@/store/analysisStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { generateReportPDF } from "@/utils/pdfExport";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  result: AnalysisResult | null;
}

export function ClinicalReport({ result }: Props) {
  const navigate = useNavigate();
  const patientName = useAnalysisStore((s) => s.patientName);
  const patientAge = useAnalysisStore((s) => s.patientAge);
  const user = useAuthStore((s) => s.user);

  const [isGenerating, setIsGenerating] = useState(false);

  async function handlePrint() {
    try {
      setIsGenerating(true);
      const pdfBase64 = await generateReportPDF({
        result,
        screeningResult: null, // Depending on if we want to include it, but the prop only provides result
        template: "clinical",
        patientName,
        patientAge,
        user
      });
      
      const link = document.createElement("a");
      link.href = pdfBase64;
      link.download = `MindCare_ClinicalReport_${result?.displayId || result?.sessionId || "export"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (!result) {
    return (
      <EmptyState
        icon={
          <div className="rounded-full bg-primary/10 p-4">
            <FileText className="h-8 w-8 text-primary opacity-80" />
          </div>
        }
        title="Structured clinical summary"
        description="The clinical overview will be generated here once a patient screening is completed."
        actionLabel="Start Session"
        onAction={() => navigate("/screening")}
      />
    );
  }

  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Structured clinical summary</CardTitle>
          <div className="mt-1 space-y-0.5">
            {(patientName || patientAge) && (
              <p className="text-sm text-muted-foreground">
                {patientName && <span className="font-medium text-foreground">{patientName}</span>}
                {patientName && patientAge && " • "}
                {patientAge && <span>Age: {patientAge}</span>}
              </p>
            )}
            {user && (
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                ID: {user.patientId || user.id.slice(-8)}
              </p>
            )}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2 print:hidden" onClick={handlePrint} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          PDF / print
        </Button>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none dark:prose-invert">
        <p className="text-sm text-muted-foreground">Session ID: {result.displayId || result.sessionId}</p>
        <p className="mt-4 text-sm leading-relaxed">{result.medicalSummary}</p>
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-xs">
          <p className="font-medium">Disclaimer</p>
          <p className="mt-1 text-muted-foreground">
            This output is for research and clinician discussion only. It is not a diagnosis or a substitute for professional care.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
