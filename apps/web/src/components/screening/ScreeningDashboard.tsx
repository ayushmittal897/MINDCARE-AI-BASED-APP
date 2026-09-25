import { ScreeningResult } from "@mindcare/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, CheckCircle2, Info, Printer, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { emailAssessmentResult } from "@/api/reports";
import { generateReportPDF } from "@/utils/pdfExport";

import { useAnalysisStore } from "@/store/analysisStore";
import { useAuthStore } from "@/store/authStore";

interface Props {
  result: ScreeningResult;
  onRetake?: () => void;
}

export function ScreeningDashboard({ result, onRetake }: Props) {
  const [isEmailing, setIsEmailing] = useState(false);

  const patientName = useAnalysisStore((s) => s.patientName);
  const patientAge = useAnalysisStore((s) => s.patientAge);
  const user = useAuthStore((s) => s.user);

  const handleEmailPDF = async () => {
    try {
      setIsEmailing(true);
      const pdfBase64 = await generateReportPDF({
        result: null,
        screeningResult: result,
        template: "clinical",
        patientName,
        patientAge,
        user
      });
      await emailAssessmentResult({ pdfBase64 });
      alert("Assessment results emailed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to email results. Please try again.");
    } finally {
      setIsEmailing(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfBase64 = await generateReportPDF({
        result: null,
        screeningResult: result,
        template: "clinical",
        patientName,
        patientAge,
        user
      });
      
      const link = document.createElement("a");
      link.href = pdfBase64;
      link.download = `MindCare_ClinicalAssessment_${result.displayId || result.sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-destructive";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 print:hidden" data-html2canvas-ignore>
        {onRetake && (
          <Button variant="outline" className="w-full sm:w-auto" onClick={onRetake}>
            Retake Test
          </Button>
        )}
        <Button onClick={handleDownloadPDF} className="w-full sm:w-auto gap-2">
          <Printer className="w-4 h-4" />
          Download PDF
        </Button>
        <Button onClick={handleEmailPDF} disabled={isEmailing} className="w-full sm:w-auto gap-2" variant="secondary">
          {isEmailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Email PDF
        </Button>
      </div>

      {result.safety.triggered && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-6 rounded-r-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <ShieldAlert className="h-8 w-8 text-destructive shrink-0" />
          <div>
            <h3 className="text-destructive font-bold text-lg mb-1">Safety Check</h3>
            <p className="text-foreground text-sm leading-relaxed">
              Based on your responses, we strongly encourage you to seek immediate professional support. 
              Please contact your local emergency services, a crisis support hotline, or a trusted healthcare provider right away.
            </p>
          </div>
        </div>
      )}

      {/* Main Score Card */}
      <Card className="border-primary/20 bg-primary/5 shadow-soft">
        <CardHeader className="text-center pb-2">
          {(patientName || patientAge || user?.id) && (
            <div className="mb-4 space-y-1">
              {(patientName || patientAge) && (
                <p className="text-sm font-medium text-foreground">
                  {patientName && <span>{patientName}</span>}
                  {patientName && patientAge && " • "}
                  {patientAge && <span>Age: {patientAge}</span>}
                </p>
              )}
              {user?.id && (
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">ID: {user.patientId || user.id.slice(-8)}</p>
              )}
            </div>
          )}
          <CardDescription className="text-primary font-medium tracking-widest uppercase text-xs">
            Clinical Assessment Score
          </CardDescription>
          <CardTitle className="text-6xl font-display mt-2">
            <span className={getScoreColor(result.screeningIndex.score)}>
              {result.screeningIndex.score}
            </span>
            <span className="text-3xl text-muted-foreground font-normal"> / 100</span>
          </CardTitle>
          <p className="font-medium text-lg mt-2 text-foreground">
            {result.screeningIndex.interpretation}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Explanation of Current Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground">
            {result.summary}
          </p>
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-sm mb-3">Recommendations</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            Clinical Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Some of the reported patterns may be worth discussing with a qualified healthcare professional, 
            particularly if they persist or interfere with daily activities.
          </p>
          <p className="font-medium text-foreground italic">
            Disclaimer: {result.disclaimer}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
