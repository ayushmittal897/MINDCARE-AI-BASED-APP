import { useState } from "react";
import type { AnalysisResult } from "@mindcare/types";
import type { LastRunMeta } from "@/store/analysisStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Maximize2, X, Sparkles, Heart, Activity, AlertCircle, ShieldAlert } from "lucide-react";

const getSeverityStyle = (prediction: string) => {
  const p = prediction.toLowerCase();
  if (p.includes("healthy")) return { color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", bar: "bg-green-500", icon: Heart };
  if (p.includes("mild")) return { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800", bar: "bg-yellow-500", icon: Activity };
  if (p.includes("mod")) return { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", bar: "bg-orange-500", icon: AlertCircle };
  if (p.includes("sev")) return { color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", bar: "bg-red-500", icon: ShieldAlert };
  return { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", bar: "bg-primary", icon: Activity };
};

interface Props {
  result: AnalysisResult | null;
  lastRun: LastRunMeta | null;
  loading?: boolean;
}

export function ResultsPanel({ result, lastRun, loading }: Props) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="text-base">Running multimodal fusion…</CardTitle>
        </CardHeader>
        <CardContent className="h-32 rounded-lg bg-muted" />
      </Card>
    );
  }

  if (!result) {
    return (
      <EmptyState
        icon={
          <div className="rounded-full bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary opacity-80" />
          </div>
        }
        title="Ready for analysis"
        description="Start a clinical assessment session to generate your AI-powered insights and results."
        className="h-48"
      />
    );
  }

  const severity = result ? getSeverityStyle(result.prediction) : getSeverityStyle("");
  const Icon = severity.icon;

  return (
    <Card className="border-primary/30 shadow-soft">
      <CardHeader className="pb-4 border-b border-border mb-4 bg-muted/10 rounded-t-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Top Predicted Class</p>
            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm ${severity.bg} ${severity.border}`}>
              <div className={`p-2 rounded-full bg-background/50 ${severity.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className={`text-2xl font-bold tracking-tight ${severity.color}`}>
                {result.prediction}
              </h2>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-muted-foreground">Session ID</p>
            <p className="font-mono text-sm">
              {result.displayId || result.sessionId}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(result.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-col gap-4">
          {result.userSummary && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <h4 className="mb-1 font-semibold text-primary">Patient-Facing Summary (Plain Language)</h4>
              <p className="text-sm leading-relaxed text-foreground">{result.userSummary}</p>
            </div>
          )}
          {result.medicalSummary && (
            <div className="rounded-lg border border-muted bg-muted/20 px-4 py-3">
              <h4 className="mb-1 font-semibold text-muted-foreground">Clinician Technical Report</h4>
              <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {result.medicalSummary}
              </p>
            </div>
          )}
        </div>
        
        {lastRun && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
            <p className="font-semibold text-foreground">Captured Inputs</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Transcript / Chosen Words</span>
                <div className="rounded bg-background p-3 text-sm text-foreground shadow-sm border whitespace-pre-wrap min-h-[80px]">
                  {lastRun.transcriptText || <span className="italic text-muted-foreground">No text provided</span>}
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>{lastRun.transcriptChars} chars</span>
                  <span>Audio: {lastRun.hasAudio ? `Recorded (~${lastRun.audioKb ?? "?"} KB)` : "None"}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Visual Frame</span>
                <div 
                  className="group relative flex h-[120px] items-center justify-center rounded bg-black/5 dark:bg-white/5 border shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => setFullscreenImage(`data:image/jpeg;base64,${lastRun.videoFrameBase64}`)}
                >
                  {lastRun.videoFrameBase64 ? (
                    <>
                      <img 
                        src={`data:image/jpeg;base64,${lastRun.videoFrameBase64}`} 
                        alt="Captured frame" 
                        className="h-full w-full object-contain" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="h-6 w-6" />
                      </div>
                    </>
                  ) : (
                    <span className="italic text-muted-foreground text-sm">No frame captured</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-right pt-2 border-t mt-2">
              Submitted at: {new Date(lastRun.sentAt).toLocaleTimeString()}
            </p>
          </div>
        )}
        <div className="rounded-lg border border-border p-4">
          <p className="mb-4 font-semibold text-foreground">Class Probabilities</p>
          <div className="space-y-3">
            {[...result.probabilities]
              .sort((a, b) => b.probability - a.probability)
              .map((p, idx) => {
                const s = getSeverityStyle(p.label);
                return (
                  <div key={p.label} className="group">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className={idx === 0 ? `font-semibold ${s.color}` : "text-muted-foreground"}>{p.label}</span>
                      <span className="font-mono text-xs font-medium">{(p.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-muted/50 overflow-hidden rounded-full border shadow-inner">
                      <div className={`h-full ${s.bar} transition-all duration-1000 ease-out`} style={{ width: `${Math.max(1, p.probability * 100)}%` }} />
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="mb-4 font-semibold text-foreground">CAFE Fusion Weights & Confidences</p>
          <div className="space-y-4">
            {[
              { label: "Acoustic (A)", w: result.weights.wA, c: result.confidences.cA, color: "bg-blue-500" },
              { label: "Visual (V)", w: result.weights.wV, c: result.confidences.cV, color: "bg-purple-500" },
              { label: "Linguistic (L)", w: result.weights.wL, c: result.confidences.cL, color: "bg-emerald-500" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-muted-foreground">{m.label}</span>
                  <span className="font-mono text-[10px]">w: {m.w.toFixed(2)} | c: {m.c.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-muted/50 overflow-hidden rounded-full flex border shadow-inner">
                    <div className={`h-full ${m.color} transition-all opacity-80`} style={{ width: `${Math.max(1, m.w * 100)}%` }} title="Weight (w)" />
                    <div className={`h-full ${m.color} transition-all opacity-40`} style={{ width: `${Math.max(1, m.c * 100)}%` }} title="Confidence (c)" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-screen p-4 flex flex-col items-center justify-center">
            <Button 
              variant="default" 
              size="icon" 
              className="absolute top-0 right-0 z-10 rounded-full shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImage(null);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
            <img 
              src={fullscreenImage} 
              alt="Enlarged captured frame" 
              className="max-h-[90vh] max-w-full object-contain rounded-xl shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
