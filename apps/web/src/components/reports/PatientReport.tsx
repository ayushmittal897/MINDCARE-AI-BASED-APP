import type { AnalysisResult } from "@mindcare/types";
import { Download, CheckCircle2, UserRound, Leaf } from "lucide-react";
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

export function PatientReport({ result }: Props) {
  const navigate = useNavigate();
  const lastRun = useAnalysisStore((s) => s.lastRun);
  const patientName = useAnalysisStore((s) => s.patientName);
  const patientAge = useAnalysisStore((s) => s.patientAge);
  const user = useAuthStore((s) => s.user);

  const [isGenerating, setIsGenerating] = useState(false);

  async function handlePrint() {
    try {
      setIsGenerating(true);
      const pdfBase64 = await generateReportPDF({
        result,
        screeningResult: null,
        template: "wellness",
        patientName,
        patientAge,
        user
      });
      
      const link = document.createElement("a");
      link.href = pdfBase64;
      link.download = `MindCare_PatientReport_${result?.displayId || result?.sessionId || "export"}.pdf`;
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
          <>
            <div className="absolute -top-1 -right-1 bg-background rounded-full p-1 shadow-sm">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-full bg-primary/10 p-4">
              <UserRound className="h-8 w-8 text-primary opacity-80" />
            </div>
          </>
        }
        title="Your wellness journey"
        description="Complete a screening session to generate your personalized wellness report. Insights, goals, and reflections will appear here."
        actionLabel="Take Assessment"
        onAction={() => navigate("/screening")}
      />
    );
  }

  return (
    <Card className="print:border-0 print:shadow-none bg-primary/5 border-primary/20 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg text-primary">Your Personal Wellness Report</CardTitle>
          <div className="mt-1 space-y-0.5">
            {(patientName || patientAge) && (
              <p className="text-sm text-muted-foreground">
                {patientName && <span className="font-medium text-foreground">{patientName}</span>}
                {patientName && patientAge && " • "}
                {patientAge && <span>Age: {patientAge}</span>}
              </p>
            )}
            {user && (
              <div className="text-xs text-muted-foreground font-mono tracking-wider flex flex-col gap-0.5">
                <p>ID: {user.patientId || user.id.slice(-8)}</p>
                {result && <p>Session: {result.displayId || result.sessionId}</p>}
              </div>
            )}
          </div>
        </div>
        <Button type="button" variant="default" size="sm" className="gap-2 print:hidden" onClick={handlePrint} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Report
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2 text-foreground">Summary</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{result.userSummary}</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium mb-3 text-sm">How this report was created</h3>
          <p className="text-xs text-muted-foreground mb-4">
            MindCare analyzes multiple aspects of your emotional expression to provide a holistic wellness screening. 
            Your results are based on the inputs provided during your session:
          </p>
          <ul className="space-y-4 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className={`h-4 w-4 mt-0.5 ${lastRun?.transcriptChars ? "text-primary" : "text-muted"}`} />
              <div>
                <span className={lastRun?.transcriptChars ? "font-medium text-foreground block" : "block"}>
                  Text Transcript {lastRun?.transcriptChars ? `(${lastRun.transcriptChars} characters)` : "(Not provided)"}
                </span>
                {lastRun?.transcriptText && (
                  <p className="mt-1 italic text-muted-foreground border-l-2 border-border pl-2">
                    "{lastRun.transcriptText}"
                  </p>
                )}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className={`h-4 w-4 mt-0.5 ${lastRun?.hasAudio ? "text-primary" : "text-muted"}`} />
              <span className={lastRun?.hasAudio ? "font-medium text-foreground" : ""}>
                Audio Clip {lastRun?.hasAudio && lastRun.audioKb ? `(${Math.round(lastRun.audioKb)} KB)` : "(Not provided)"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className={`h-4 w-4 mt-0.5 ${lastRun?.hasVideoFrame ? "text-primary" : "text-muted"}`} />
              <div className="w-full">
                <span className={lastRun?.hasVideoFrame ? "font-medium text-foreground block mb-2" : "block"}>
                  Facial Expressions / Video Frame {lastRun?.hasVideoFrame ? "(Analyzed)" : "(Not provided)"}
                </span>
                {lastRun?.videoFrameBase64 && (
                  <div className="max-w-[200px] rounded-lg overflow-hidden border shadow-sm">
                    <img 
                      src={`data:image/jpeg;base64,${lastRun.videoFrameBase64}`} 
                      alt="Captured face" 
                      className="w-full h-auto object-cover" 
                    />
                  </div>
                )}
              </div>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
