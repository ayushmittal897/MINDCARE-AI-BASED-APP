import { useState, useEffect } from "react";
import { EmotionChart } from "@/components/dashboard/EmotionChart";
import { useAnalysisStore } from "@/store/analysisStore";
import { useHistory } from "@/hooks/useAnalysis";
import { getReport, emailResult } from "@/api/analysis";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateReportPDF } from "@/utils/pdfExport";
import { useAuthStore } from "@/store/authStore";

export function DashboardPage() {
  const result = useAnalysisStore((s) => s.current);
  const setResult = useAnalysisStore((s) => s.setResult);
  const { data: history, isLoading, isError, error, refetch, isRefetching } = useHistory();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab"); // 'session', 'clinical', or null

  const filteredHistory = history?.filter((session) => {
    if (tab === "session") return session.type === "session";
    if (tab === "clinical") return session.type === "screening";
    return true;
  });

  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  
  const [emailCooldowns, setEmailCooldowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const activeKeys = Object.keys(emailCooldowns).filter((k) => emailCooldowns[k] > 0);
    if (activeKeys.length > 0) {
      const timer = setTimeout(() => {
        setEmailCooldowns((prev) => {
          const next = { ...prev };
          activeKeys.forEach((k) => {
            if (next[k] > 0) next[k] -= 1;
          });
          return next;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldowns]);

  const handleDownloadReport = async (sessionId: string, type: "session" | "screening", template: "wellness" | "clinical") => {
    try {
      setLoadingReportId(`dl-${template}-${sessionId}`);
      const report = await getReport(sessionId);
      
      const pdfBase64 = await generateReportPDF({
        result: type === "session" ? (report as any) : null,
        screeningResult: type === "screening" ? (report as any).screeningResult : null,
        template: template,
        patientName: useAnalysisStore.getState().patientName,
        patientAge: useAnalysisStore.getState().patientAge,
        user
      });
      
      const link = document.createElement("a");
      link.href = pdfBase64;
      link.download = `MindCare_Report_${(report as any).displayId || report.sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    } finally {
      setLoadingReportId(null);
    }
  };

  const handleEmailReport = async (sessionId: string, type: "session" | "screening", template: "wellness" | "clinical") => {
    if (emailCooldowns[sessionId] > 0) return;
    try {
      setLoadingReportId(`email-${template}-${sessionId}`);
      const report = await getReport(sessionId);
      
      const pdfBase64 = await generateReportPDF({
        result: type === "session" ? (report as any) : null,
        screeningResult: type === "screening" ? (report as any).screeningResult : null,
        template: template,
        patientName: useAnalysisStore.getState().patientName,
        patientAge: useAnalysisStore.getState().patientAge,
        user
      });
      
      await emailResult(pdfBase64);
      toast.success("PDF emailed successfully!");
      
      setEmailCooldowns(prev => ({ ...prev, [sessionId]: 30 }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to email PDF.");
    } finally {
      setLoadingReportId(null);
    }
  };

  const handleViewReport = async (sessionId: string, type: "session" | "screening") => {
    try {
      setLoadingReportId(sessionId);
      const report = await getReport(sessionId);
      
      if (type === "screening" && (report as any).screeningResult) {
        useAnalysisStore.getState().setScreeningResult((report as any).screeningResult);
        navigate("/reports?type=clinical");
      } else {
        setResult(report);
        if (report.inputs) {
          useAnalysisStore.getState().setLastRun(report.inputs as any);
        } else {
          useAnalysisStore.getState().setLastRun(null);
        }
        navigate("/reports?type=session");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load report data.");
    } finally {
      setLoadingReportId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Your Wellness Dashboard</h1>
        <p className="mt-2 text-muted-foreground mb-4">
          An overview of your emotional state based on your most recent clinical assessment.
        </p>
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-3 border border-yellow-200 dark:border-yellow-800 w-full mb-6">
          <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium m-0">
            <strong>MEDICAL DISCLAIMER:</strong> This app is a screening/demonstration tool, is NOT a medical diagnosis, and is NOT a substitute for consultation with a licensed mental health professional.
          </p>
        </div>
      </div>
      
      {!result ? (
        <div className="bg-muted/30 p-8 rounded-xl text-center border border-dashed">
          <p className="text-muted-foreground">You haven't completed any sessions yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Head over to the Capture or Clinical Assessment tabs to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
              <h3 className="font-semibold text-lg text-primary mb-2">Current Status</h3>
              <p className="text-2xl font-bold text-foreground capitalize">
                {result.prediction.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your latest session on {new Date(result.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {result.userSummary && (
              <div className="bg-card p-6 rounded-xl border shadow-sm">
                <h3 className="font-medium text-foreground mb-3">Recent Insights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.userSummary}
                </p>
              </div>
            )}
          </div>
          
          <EmotionChart result={result} />
        </div>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Past Assessments</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isRefetching || isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefetching ? "animate-spin" : "")} />
            Reload Data
          </Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading history...</p>
        ) : isError ? (
          <div className="bg-destructive/10 p-8 rounded-xl text-center border border-destructive/20">
            <p className="text-destructive font-medium">Failed to load past assessments</p>
            <p className="text-sm text-destructive/80 mt-1">Unable to load your past sessions. Please try again later.</p>
          </div>
        ) : filteredHistory && filteredHistory.length > 0 ? (
          <div className="bg-card rounded-xl border overflow-hidden">
            <table className="hidden lg:table w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Result</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredHistory.map((session) => (
                  <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(session.startedAt).toLocaleDateString()} {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 capitalize text-muted-foreground">
                      {session.type}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary capitalize">{session.topPrediction?.replace(/([A-Z])/g, " $1").trim() || "Screening Test"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewReport(session.id, session.type)}
                          disabled={loadingReportId === session.id || loadingReportId === `dl-${session.id}`}
                          className="gap-2"
                        >
                          {loadingReportId === session.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                          {loadingReportId === session.id ? "Loading..." : "View Report"}
                        </Button>
                        {session.type === "session" ? (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleDownloadReport(session.id, session.type, "wellness")}
                              disabled={loadingReportId === session.id || loadingReportId === `dl-wellness-${session.id}`}
                              className="gap-2"
                            >
                              {loadingReportId === `dl-wellness-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                              {loadingReportId === `dl-wellness-${session.id}` ? "Loading..." : "Personal Report"}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleDownloadReport(session.id, session.type, "clinical")}
                              disabled={loadingReportId === session.id || loadingReportId === `dl-clinical-${session.id}`}
                              className="gap-2"
                            >
                              {loadingReportId === `dl-clinical-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                              {loadingReportId === `dl-clinical-${session.id}` ? "Loading..." : "Clinical PDF"}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleEmailReport(session.id, session.type, "wellness")}
                              disabled={loadingReportId === `email-wellness-${session.id}` || emailCooldowns[session.id] > 0}
                              className="gap-2"
                            >
                              {loadingReportId === `email-wellness-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                              {emailCooldowns[session.id] > 0 ? `${emailCooldowns[session.id]}s` : "Email PDF"}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleDownloadReport(session.id, session.type, "clinical")}
                              disabled={loadingReportId === session.id || loadingReportId === `dl-clinical-${session.id}`}
                              className="gap-2"
                            >
                              {loadingReportId === `dl-clinical-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                              {loadingReportId === `dl-clinical-${session.id}` ? "Loading..." : "PDF"}
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleEmailReport(session.id, session.type, "clinical")}
                              disabled={loadingReportId === `email-clinical-${session.id}` || emailCooldowns[session.id] > 0}
                              className="gap-2"
                            >
                              {loadingReportId === `email-clinical-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                              {emailCooldowns[session.id] > 0 ? `${emailCooldowns[session.id]}s` : "Email PDF"}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="grid gap-0 divide-y lg:hidden">
              {filteredHistory.map((session) => (
                <div key={`mobile-${session.id}`} className="p-4 space-y-4 hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {new Date(session.startedAt).toLocaleDateString()} {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-muted-foreground capitalize text-xs">{session.type}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-primary capitalize text-sm">{session.topPrediction?.replace(/([A-Z])/g, " $1").trim() || "Screening Test"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewReport(session.id, session.type)}
                      disabled={loadingReportId === session.id || loadingReportId === `dl-${session.id}`}
                      className="flex-1 min-w-[120px] gap-2"
                    >
                      {loadingReportId === session.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                      {loadingReportId === session.id ? "Loading..." : "View Report"}
                    </Button>
                    {session.type === "session" ? (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleDownloadReport(session.id, session.type, "wellness")}
                          disabled={loadingReportId === session.id || loadingReportId === `dl-wellness-${session.id}`}
                          className="flex-1 min-w-[120px] gap-2"
                        >
                          {loadingReportId === `dl-wellness-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          {loadingReportId === `dl-wellness-${session.id}` ? "Loading..." : "Personal Report"}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleDownloadReport(session.id, session.type, "clinical")}
                          disabled={loadingReportId === session.id || loadingReportId === `dl-clinical-${session.id}`}
                          className="flex-1 min-w-[120px] gap-2"
                        >
                          {loadingReportId === `dl-clinical-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          {loadingReportId === `dl-clinical-${session.id}` ? "Loading..." : "Clinical PDF"}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleEmailReport(session.id, session.type, "wellness")}
                          disabled={loadingReportId === `email-wellness-${session.id}` || emailCooldowns[session.id] > 0}
                          className="flex-1 min-w-[120px] gap-2"
                        >
                          {loadingReportId === `email-wellness-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                          {emailCooldowns[session.id] > 0 ? `${emailCooldowns[session.id]}s` : "Email PDF"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleDownloadReport(session.id, session.type, "clinical")}
                          disabled={loadingReportId === session.id || loadingReportId === `dl-clinical-${session.id}`}
                          className="flex-1 min-w-[120px] gap-2"
                        >
                          {loadingReportId === `dl-clinical-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          {loadingReportId === `dl-clinical-${session.id}` ? "Loading..." : "PDF"}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleEmailReport(session.id, session.type, "clinical")}
                          disabled={loadingReportId === `email-clinical-${session.id}` || emailCooldowns[session.id] > 0}
                          className="flex-1 min-w-[120px] gap-2"
                        >
                          {loadingReportId === `email-clinical-${session.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                          {emailCooldowns[session.id] > 0 ? `${emailCooldowns[session.id]}s` : "Email PDF"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 p-8 rounded-xl text-center border border-dashed">
            <p className="text-muted-foreground">No past assessments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
