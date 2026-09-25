import { useState } from "react";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { AudioCapture } from "@/components/analysis/AudioCapture";
import { FaceCapture } from "@/components/analysis/FaceCapture";
import { ModalityStatus } from "@/components/analysis/ModalityStatus";
import { ResultsPanel } from "@/components/analysis/ResultsPanel";
import { TextInput } from "@/components/analysis/TextInput";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRunAnalysis } from "@/hooks/useAnalysis";
import { blobToBase64 } from "@/lib/media";
import { useAnalysisStore } from "@/store/analysisStore";
import { Input } from "@/components/ui/input";

export function AnalysisPage() {
  const [activeTab, setActiveTab] = useState("capture");
  const [text, setText] = useState("I've been tired lately but I'm trying to stay positive.");
  const [audioClip, setAudioClip] = useState<Blob | null>(null);
  const [videoFrameB64, setVideoFrameB64] = useState<string | null>(null);
  const run = useRunAnalysis();
  const result = useAnalysisStore((s) => s.current);
  const lastRun = useAnalysisStore((s) => s.lastRun);

  const patientName = useAnalysisStore((s) => s.patientName);
  const patientAge = useAnalysisStore((s) => s.patientAge);
  const setPatientInfo = useAnalysisStore((s) => s.setPatientInfo);

  const audioKb = audioClip ? Math.round(audioClip.size / 1024) : undefined;

  async function handleRun() {
    const transcript = text.trim();
    let audioBase64: string | undefined;
    let videoBase64: string | undefined;
    if (audioClip) {
      audioBase64 = await blobToBase64(audioClip);
    }
    if (videoFrameB64) {
      videoBase64 = videoFrameB64;
    }
    try {
      await run.mutateAsync({
        transcript: transcript || undefined,
        audioBase64,
        videoBase64,
      });
      setActiveTab("review");
    } catch (e) {
      console.error("Analysis failed:", e);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Analysis session</h1>
        <p className="mt-2 text-muted-foreground">
          Each modality you attach is sent together to the gateway → ML core. Change text, record new audio, or capture a new frame to see
          scores and weights move.
        </p>
      </div>



      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="patientNameAnalysis" className="text-sm font-medium leading-none">Patient Name</label>
          <Input 
            id="patientNameAnalysis"
            placeholder="Enter name"
            value={patientName}
            onChange={(e) => setPatientInfo(e.target.value, patientAge)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="patientAgeAnalysis" className="text-sm font-medium leading-none">Age</label>
          <Input 
            id="patientAgeAnalysis"
            type="number"
            placeholder="Enter age"
            value={patientAge}
            onChange={(e) => setPatientInfo(patientName, e.target.value)}
          />
        </div>
      </div>
      <ModalityStatus
        transcriptChars={text.trim().length}
        hasAudio={Boolean(audioClip && audioClip.size > 0)}
        audioKb={audioKb}
        hasVideoFrame={Boolean(videoFrameB64)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="capture">Capture</TabsTrigger>
          <TabsTrigger value="review">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="capture">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <TextInput value={text} onChange={setText} />
              <AudioCapture clip={audioClip} onClipChange={setAudioClip} />
            </div>
            <FaceCapture frameBase64={videoFrameB64} onFrameChange={setVideoFrameB64} />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            {run.isSuccess && !run.isPending && (
              <Button
                type="button"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                onClick={() => setActiveTab("review")}
              >
                Analysis Done. Click 'Results' tab above to view.
              </Button>
            )}
            <Button
              type="button"
              size="lg"
              variant={run.isSuccess ? "outline" : "default"}
              disabled={run.isPending || !patientName.trim() || !patientAge.toString().trim()}
              onClick={handleRun}
            >
              {run.isPending ? "Analyzing…" : (!patientName.trim() || !patientAge.toString().trim() ? "Enter Name & Age to Start" : (run.isSuccess ? "Re-analyze" : "Run multimodal analysis"))}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="review">
          <ResultsPanel result={result} lastRun={lastRun} loading={run.isPending} />
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              size="lg"
              className="group relative overflow-hidden rounded-full px-8 py-6 font-medium text-primary border-primary/30 bg-primary/5 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-primary/25 hover:shadow-lg"
              onClick={() => setActiveTab("capture")}
            >
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-base">Back to Capture & Re-analyze</span>
              <RefreshCcw className="ml-3 h-5 w-5 opacity-70 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
